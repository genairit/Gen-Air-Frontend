import { useState } from "react";

const createSessionToken = () => crypto.randomUUID();

export const useSessionToken = () => {
  const [sessionToken, setSessionToken] = useState(createSessionToken);

  const renewSessionToken = () => setSessionToken(createSessionToken());

  return { sessionToken, renewSessionToken };
};
