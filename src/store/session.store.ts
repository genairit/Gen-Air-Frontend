import { create } from "zustand";
import type { ISession } from "../interfaces/session.interface";
import { readStoredSession } from "../utilities/session.utility";

interface ISessionStoreState {
  session: ISession | null;
}

const sessionStore = create<ISessionStoreState>(() => ({ session: readStoredSession() }));

export const useSession = () => sessionStore(state => state.session);

export const useSessionUser = () => sessionStore(state => state.session?.user ?? null);

export const getSession = () => sessionStore.getState().session;

export const getAccessToken = () => sessionStore.getState().session?.accessToken ?? null;

export const setSession = (session: ISession | null) => sessionStore.setState({ session });
