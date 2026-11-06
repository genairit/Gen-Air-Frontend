import { SESSION_SYNC } from "../constants/session.constant";
import { isRecord } from "../utilities/guards/primitive.guard";

interface ISessionSyncMessage {
  userId: string;
  type: typeof SESSION_SYNC.MESSAGE_TYPES.USER_CHANGED;
}

const getBroadcastChannelConstructor = (): typeof BroadcastChannel | null =>
  globalThis.BroadcastChannel ?? null;

const isSessionSyncMessage = (message: unknown): message is ISessionSyncMessage => {
  if (!isRecord(message)) {
    return false;
  }

  const isUserChanged = message.type === SESSION_SYNC.MESSAGE_TYPES.USER_CHANGED;
  const hasUserId = typeof message.userId === "string";

  return isUserChanged && hasUserId;
};

export class SessionBroadcastManager {
  static notifyUserChanged(userId: string): void {
    const BroadcastChannelConstructor = getBroadcastChannelConstructor();

    if (BroadcastChannelConstructor === null) {
      return;
    }

    const channel = new BroadcastChannelConstructor(SESSION_SYNC.CHANNEL_NAME);
    const message: ISessionSyncMessage = {
      type: SESSION_SYNC.MESSAGE_TYPES.USER_CHANGED,
      userId,
    };
    channel.postMessage(message);
    channel.close();
  }

  static subscribeToUserChanges(onUserChanged: (userId: string) => Promise<void>): () => void {
    const BroadcastChannelConstructor = getBroadcastChannelConstructor();

    if (BroadcastChannelConstructor === null) {
      return () => {};
    }

    const channel = new BroadcastChannelConstructor(SESSION_SYNC.CHANNEL_NAME);
    channel.onmessage = async event => {
      if (isSessionSyncMessage(event.data)) {
        const { userId } = event.data;
        await onUserChanged(userId);
      }
    };

    return () => channel.close();
  }
}
