import { useCallback, useState } from "react";
import useWait from "./useWait";
import { _csrfToken as csrfToken } from "../Contexts/WSProvider";
import { handleSimulatedRequest } from "../services/simulatedBackend";

/**
 * Custom hook for making fetch requests with backend DB simulation fallback.
 * @returns {[function,object,boolean]}
 */
export default function useFetch() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async ({ url, method = "GET", headers, body }) => {
      const wait = useWait(csrfToken);
      setLoading(true);
      const reqData = {
        method: method,
        credentials: "include",
      };
      if (body) reqData.body = body;
      if (headers) reqData.headers = headers;
      if (method === "POST") {
        await wait;
        reqData.headers = { ...reqData.headers, "CSRF-Token": csrfToken[0] };
      }
      try {
        const response = await fetch("http://localhost:3000/" + url, reqData);
        if (
          response.headers.get("file-download") &&
          response.headers.get("file-download") === "yes"
        ) {
          const blob = await response.blob();
          setData(blob);
          if (!response.ok) throw new Error("File download failed");
        } else {
          const resJson = await response.json();
          setData(resJson);
          if (!response.ok) throw new Error(resJson.msg);
        }
      } catch (err) {
        // Fallback to simulated database when live backend server is not running
        try {
          const simResponse = await handleSimulatedRequest({
            url,
            method,
            headers,
            body,
          });
          setData(simResponse);
        } catch (simErr) {
          console.log("Simulated DB error:", simErr, "Original error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return [request, data, loading];
}
