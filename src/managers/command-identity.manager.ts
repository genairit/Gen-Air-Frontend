export class CommandIdentityManager {
  static create(): string {
    return crypto.randomUUID();
  }
}
