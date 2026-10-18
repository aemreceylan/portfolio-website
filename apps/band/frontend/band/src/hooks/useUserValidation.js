import { useState } from "react";
import { _csrfToken as csrfToken } from "../Contexts/WSProvider";
import { checkSimulatedUserValidation } from "../services/simulatedBackend";

/**
 * Custom hook for user validation with simulated backend fallback.
 * @returns {[function,boolean]}
 */
export default function useUserValidation() {
  const [result, setResult] = useState();

  const userValidation = async (_authToken) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/user-validation",
        {
          credentials: "include",
          method: "GET",
          headers: { "CSRF-Token": csrfToken[0] },
        }
      );
      const data = await response.json();
      if (!response.ok && !data.status) throw new Error(data.msg);
      console.log(data.msg);
      setResult(true);
    } catch {
      // Fallback to simulated DB authorization
      const simResult = checkSimulatedUserValidation();
      setResult(simResult);
    }
  };

  return [userValidation, result];
}
