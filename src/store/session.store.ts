import { create } from "zustand";
import type { ISession } from "../interfaces/session.interface";
import { readStoredSession } from "../utilities/session.utility";

interface ISessionStoreState {
  session: ISession | null;
  passwordChangedNotice: boolean;
}

const sessionStore = create<ISessionStoreState>(() => ({
  session: readStoredSession(),
  passwordChangedNotice: false,
}));

export const useSession = () => sessionStore(state => state.session);

export const usePasswordChangedNotice = () => sessionStore(state => state.passwordChangedNotice);

export const useSessionUser = () => sessionStore(state => state.session?.user ?? null);

export const getSession = () => sessionStore.getState().session;

export const getAccessToken = () => sessionStore.getState().session?.accessToken ?? null;

export const setSession = (session: ISession | null, passwordChangedNotice = false) =>
  sessionStore.setState({ session, passwordChangedNotice });
