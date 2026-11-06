import { getSession } from "../store/session.store";
import { SessionRequestManager } from "./session-request.manager";

const getAuthorizationIdentity = (): string => {
  const session = getSession();

  return JSON.stringify({
    accessToken: session?.accessToken ?? null,
    userId: session?.user.id ?? null,
    role: session?.user.role ?? null,
    permissions: session?.user.permissions ?? null,
    assignedRoles: session?.user.assignedRoles ?? null,
  });
};

export class AuthorizationContextChangedError extends Error {
  constructor() {
    super(
      "הרשאות החשבון השתנו בזמן הפעולה. ייתכן שהשינוי נשמר בשרת; יש לבדוק אותו מחדש בתפקיד הנוכחי.",
    );
    this.name = "AuthorizationContextChangedError";
  }
}

export class AuthorizationContext {
  private readonly identity = getAuthorizationIdentity();
  private readonly generation = SessionRequestManager.getAuthorizationGeneration();

  isCurrent(): boolean {
    const hasSameGeneration =
      this.generation === SessionRequestManager.getAuthorizationGeneration();
    const hasSameIdentity = this.identity === getAuthorizationIdentity();

    return hasSameGeneration && hasSameIdentity;
  }

  assertCurrent(): void {
    if (!this.isCurrent()) {
      throw new AuthorizationContextChangedError();
    }
  }
}
