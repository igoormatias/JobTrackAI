export class AppVersion {
  private constructor(private readonly value: string) {}

  static create(value: string): AppVersion {
    const trimmed = value.trim();
    if (!trimmed) {
      throw new Error("App version cannot be empty");
    }
    return new AppVersion(trimmed);
  }

  toString(): string {
    return this.value;
  }
}
