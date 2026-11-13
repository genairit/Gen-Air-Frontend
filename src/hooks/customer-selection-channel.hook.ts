import { useEffect, useState } from "react";

export const useCustomerSelectionChannel = (onSelect: (customerId: string) => void) => {
  const [channelId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    const channel = new BroadcastChannel(`customer-selection:${channelId}`);
    channel.onmessage = event => {
      const customerId = event.data?.customerId;
      if (typeof customerId === "string") {
        onSelect(customerId);
      }
    };
    return () => channel.close();
  }, [channelId, onSelect]);

  return channelId;
};

export const publishCustomerSelection = (channelId: string | null, customerId: string) => {
  if (!channelId) {
    return;
  }

  const channel = new BroadcastChannel(`customer-selection:${channelId}`);
  channel.postMessage({ customerId });
  channel.close();
};
