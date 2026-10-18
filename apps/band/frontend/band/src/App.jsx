import Chat from "./Components/Chat/Chat";
import Hub from "./Components/Hub/Hub";
import HubList from "./Components/HubList/HubList";
import Users from "./Components/Users/Users";
import "./roots.css";
import "./fonts.css";
import "./App.css";
import { useContext, useEffect } from "react";
import LoginSignup from "./Components/LoginSignup/LoginSignUp";
import { WSContext } from "./Contexts/WSProvider";
import FloatingElement from "./Components/UI/FloatingElement/FloatingElement";
import ContextMenu from "./Components/UI/ContextMenu/ContextMEnu";
import { getInstanceId } from "./services/simulatedBackend";

export default function App() {
  const { login, streams, setInviteToken, contextMenu, setContextMenu } =
    useContext(WSContext);
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    const catKey = `categoryIsOpen_${getInstanceId()}`;
    if (!localStorage.getItem(catKey)) {
      localStorage.setItem(catKey, "{}");
    }
    if (getInstanceId() === "default" || getInstanceId() === "band") {
      if (!localStorage.getItem("categoryIsOpen")) {
        localStorage.setItem("categoryIsOpen", "{}");
      }
    }
    const urlParams = new URLSearchParams(window.location.search);
    setInviteToken(urlParams.get("token"));

    // Notify WebOS Container Runtime that BAND guest application is ready
    if (window.parent && window.parent !== window) {
      const targetOrigin =
        typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : '*';

      window.parent.postMessage(
        {
          source: 'aec-webos-guest',
          targetAppId: 'band',
          timestamp: Date.now(),
          payload: {
            type: 'WEBOS_GUEST_READY',
            appId: 'band',
            version: '1.0.0',
          },
        },
        targetOrigin
      );
    }
  }, [setInviteToken]);
  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu({ isVisible: false });
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [setContextMenu]);

  return (
    <>
      {login ? (
        <div id="app">
          <div id="app-main">
            <HubList />
            <Hub />
            <Chat />
            <Users />
          </div>
        </div>
      ) : (
        <LoginSignup />
      )}
      {[streams.cam, streams.screen].map((element, i) => {
        if (element instanceof MediaStream)
          return (
            <FloatingElement
              coordinate={[]}
              key={element.id || `stream-media-${i}`}
              styles={{
                width: "15%",
                aspectRatio: "16/9",
                backgroundColor: "black",
                border: "1px solid var(--dark-font-medium-gray)",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{ width: "100%", height: "100%" }}
                className="rtcFloatingVideo-div"
              >
                <video
                  className="rtcFloatingVideo-div-video"
                  muted
                  autoPlay
                  playsInline
                  ref={(video) => {
                    if (video) video.srcObject = element;
                  }}
                  style={{ width: "100%", height: "100%" }}
                ></video>
              </div>
            </FloatingElement>
          );
      })}
      <ContextMenu data={contextMenu} />
    </>
  );
}
