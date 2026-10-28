import type { IApiAuthorizedUser } from "./api.interface";

export interface ISession {
  accessToken: string;
  user: IApiAuthorizedUser;
}
