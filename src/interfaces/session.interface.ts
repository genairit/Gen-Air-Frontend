import type { IApiUser } from "./api.interface";

export interface ISession {
  user: IApiUser;
  accessToken: string;
}
