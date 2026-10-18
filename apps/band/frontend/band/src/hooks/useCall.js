import * as mediasoup from "mediasoup-client";
import { useCallback, useRef } from "react";

export default function useCall(setConsumingStreams, setRtcMediaSettings) {
  const deviceRef = useRef();
  const produceTransportRef = useRef();
  const producerRef = useRef(new Map());
  const consumeTransportRef = useRef();
  const consumerRef = useRef(new Map());
  const consumeTransportIdRef = useRef();
  const produceTransportIdRef = useRef();
  const isInitializedRef = useRef(false);

  const closeProduce = useCallback(async (key, socket) => {
    const currentProducer = producerRef.current.get(key);
    if (!currentProducer) return;

    const response = await socket.emitWithAck("msServer", {
      type: "close-producer",
      id: currentProducer.id,
    });

    if (response) {
      console.log(
        "Producer Closed :> Type: " +
          currentProducer.appData.type
      );
      producerRef.current.delete(key);
    }
  }, []);

  const isDisconnect = useCallback(() => {
    return (
      produceTransportRef.current === null ||
      consumeTransportRef.current === null
    );
  }, []);

  const disconnect = useCallback(async (socket) => {
    await socket.emitWithAck("msServer", {
      type: "close-transports",
      p_id: produceTransportIdRef.current,
      c_id: consumeTransportIdRef.current,
    });
    produceTransportRef.current?.close();
    consumeTransportRef.current?.close();
    console.log("Disconnect");
    produceTransportRef.current = null;
    consumeTransportRef.current = null;
    consumeTransportIdRef.current = null;
    produceTransportIdRef.current = null;
    producerRef.current.clear();
    consumerRef.current.clear();
  }, []);

  const setupAudio = useCallback(async (socket, key, userId) => {
    const consumer = consumerRef.current.get(key);
    if (!consumer) return;
    const { track } = consumer;
    const stream = new MediaStream([track]);
    await socket.emitWithAck("msServer", {
      type: "unpause-consumer",
      id: consumer.id,
    });
    setConsumingStreams((prev) => ({
      ...prev,
      audio: [...prev.audio, { stream, userId }],
    }));
  }, [setConsumingStreams]);

  const setupCam = useCallback(async (socket, key, userId) => {
    const consumer = consumerRef.current.get(key);
    if (!consumer) return;
    const { track } = consumer;
    const stream = new MediaStream([track]);
    await socket.emitWithAck("msServer", {
      type: "unpause-consumer",
      id: consumer.id,
    });
    setConsumingStreams((prev) => ({
      ...prev,
      cam: [...prev.cam, { stream, userId }],
    }));
  }, [setConsumingStreams]);

  const setupScreen = useCallback(async (socket, key, userId) => {
    const consumer = consumerRef.current.get(key);
    if (!consumer) return;
    const { track } = consumer;
    const stream = new MediaStream([track]);
    await socket.emitWithAck("msServer", {
      type: "unpause-consumer",
      id: consumer.id,
    });
    setConsumingStreams((prev) => ({
      ...prev,
      screen: [...prev.screen, { stream, userId }],
    }));
  }, [setConsumingStreams]);

  const consumeStream = useCallback(async (socket, producerId) => {
    const consumer_params = await socket.emitWithAck("msServer", {
      type: "consume-media",
      rtpCapabilities: deviceRef.current.rtpCapabilities,
      c_id: consumeTransportIdRef.current,
      p_id: producerId,
    });
    if (consumer_params) {
      const consumer = await consumeTransportRef.current.consume(
        consumer_params
      );
      consumerRef.current.set(consumer.id, consumer);
      if (consumer_params.appData.type === "audio") {
        await setupAudio(socket, consumer.id, consumer_params.appData.userId);
      } else if (consumer_params.appData.type === "cam") {
        await setupCam(socket, consumer.id, consumer_params.appData.userId);
      } else if (consumer_params.appData.type === "screen") {
        await setupScreen(socket, consumer.id, consumer_params.appData.userId);
      }
      console.log("Consuming:" + consumerRef.current.get(consumer.id)?.id);
    }
  }, [setupAudio, setupCam, setupScreen]);

  const waitNewProducers = useCallback((socket) => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    socket.on("msServer-newProducer", (data) => {
      console.log("New produce:> " + data);
      consumeStream(socket, data);
    });
    socket.on("msServer-producerClosed", (data) => {
      console.log("A user has closed their connection:> " + data.type);
      setConsumingStreams((prev) => ({
        ...prev,
        [data.type]: prev[data.type].filter(
          (element) => element.userId !== data.userId
        ),
      }));
    });
  }, [consumeStream, setConsumingStreams]);

  const setConsumers = useCallback(async (socket) => {
    const response = await socket.emitWithAck("msServer", {
      type: "get-producer-list",
      produceTransportId: produceTransportIdRef.current,
    });
    if (Array.isArray(response)) {
      for (const element of response) {
        await consumeStream(socket, element);
      }
    }
  }, [consumeStream]);

  const init = useCallback(async (socket) => {
    deviceRef.current = new mediasoup.Device();
    const rtpCap = await socket.emitWithAck("msServer", {
      type: "getRtpCap",
    });
    await deviceRef.current.load({ routerRtpCapabilities: rtpCap });
  }, []);

  const getStreams = useCallback(async (devices, types) => {
    const streams = {};
    if (devices.mic?.id && types.includes("audio")) {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          deviceId: devices.mic.id,
        },
      });
      streams.audio = audioStream;
    }
    if (devices.cam?.id && types.includes("cam")) {
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: devices.cam.id,
          facingMode: "user",
          frameRate: { ideal: 30, max: 60 },
        },
      });
      streams.cam = camStream;
    }
    if (types.includes("screen")) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: true,
      });
      screenStream.getVideoTracks()[0].onended = () => {
        setRtcMediaSettings((prev) => ({
          ...prev,
          screen: {
            ...prev.screen,
            open: false,
          },
        }));
      };
      streams.screen = screenStream;
    }
    return streams;
  }, [setRtcMediaSettings]);

  const createProducer = useCallback(async (socket) => {
    const transport_params = await socket.emitWithAck("msServer", {
      type: "create-producer-transport",
    });
    produceTransportIdRef.current = transport_params.id;
    produceTransportRef.current =
      deviceRef.current.createSendTransport(transport_params);
    produceTransportRef.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        const response = await socket.emitWithAck("msServer", {
          type: "connect-transport",
          dtlsParameters,
          id: transport_params.id,
        });
        if (response) {
          callback();
          console.log("Producer Connection Success");
        } else {
          errback();
          console.log("Producer Connection Error");
        }
      }
    );
    produceTransportRef.current.on(
      "produce",
      async (params, callback, errback) => {
        const response = await socket.emitWithAck("msServer", {
          type: "start-producing",
          params,
          id: transport_params.id,
        });
        if (response === -1) {
          errback();
          console.log("Producer Produce Error");
        } else {
          callback({ id: response });
          console.log("Producer Produce Success");
        }
      }
    );
  }, []);

  const publish = useCallback(async (stream, _type) => {
    const tracks = stream.getTracks();
    const producers = [];
    for (const track of tracks) {
      const producer = await produceTransportRef.current.produce({
        track,
        appData: { type: _type },
      });
      producers.push(producer);
      producerRef.current.set(producer.id, producer);
    }
    return { type: _type, keys: producers.map((element) => element.id) };
  }, []);

  const createConsumer = useCallback(async (socket) => {
    const transport_params = await socket.emitWithAck("msServer", {
      type: "create-consumer-transport",
    });
    consumeTransportIdRef.current = transport_params.id;
    consumeTransportRef.current =
      deviceRef.current.createRecvTransport(transport_params);
    consumeTransportRef.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        const response = await socket.emitWithAck("msServer", {
          type: "connect-transport",
          dtlsParameters,
          id: transport_params.id,
        });
        if (response) {
          callback();
          console.log("Consumer Connection Success");
        } else {
          errback();
          console.log("Consumer Connection Error");
        }
      }
    );
  }, []);

  return [
    init,
    getStreams,
    createProducer,
    publish,
    createConsumer,
    setConsumers,
    disconnect,
    isDisconnect,
    waitNewProducers,
    closeProduce,
  ];
}
