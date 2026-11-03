const requestState = { generation: 0, authorizationGeneration: 0, isSwitching: false };
const switchWaiters = new Set<() => void>();

export class SessionRequestManager {
  static getAuthorizationGeneration(): number {
    return requestState.authorizationGeneration;
  }

  static invalidateAuthorization(): void {
    requestState.authorizationGeneration += 1;
  }

  static retireSessionRequests(): void {
    requestState.generation += 1;
    this.releaseSwitch();
  }

  static beginRefresh(): number | null {
    if (requestState.isSwitching) {
      return null;
    }

    requestState.generation += 1;
    return requestState.generation;
  }

  static beginSwitch(): number {
    requestState.generation += 1;
    requestState.isSwitching = true;
    return requestState.generation;
  }

  static isCurrent(generation: number): boolean {
    return requestState.generation === generation;
  }

  static isSwitching(): boolean {
    return requestState.isSwitching;
  }

  static async waitForSwitch(): Promise<void> {
    if (!requestState.isSwitching) {
      return;
    }

    await new Promise<void>(resolve => switchWaiters.add(resolve));
  }

  static finishSwitch(generation: number): void {
    if (!this.isCurrent(generation)) {
      return;
    }

    requestState.generation += 1;
    this.releaseSwitch();
  }

  private static releaseSwitch(): void {
    requestState.isSwitching = false;
    switchWaiters.forEach(resolve => resolve());
    switchWaiters.clear();
  }
}
