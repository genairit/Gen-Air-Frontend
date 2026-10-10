interface IGetValueOptions {
  defaultValue?: string;
  errorOnMissing?: boolean;
}

export class EnvironmentManager {
  private static _isInitialized = false;
  private static properties: Record<string, string> = {};

  public static setup(): void {
    if (this._isInitialized) {
      return;
    }

    this.properties = Object.entries(import.meta.env).reduce(
      (properties, [key, value]) => {
        if (typeof value === 'string') {
          properties[key] = value;
        }

        return properties;
      },
      {} as Record<string, string>,
    );
    this._isInitialized = true;
  }

  public static get(key: string, options?: IGetValueOptions): string {
    this.setup();

    const value = this.properties[key] || options?.defaultValue || '';

    if (!value && options?.errorOnMissing) {
      throw new Error(`${key} is missing from the environment variables`);
    }

    return value;
  }
}