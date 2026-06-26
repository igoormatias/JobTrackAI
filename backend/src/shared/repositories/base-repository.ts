export abstract class BaseRepository {
  protected readonly resourceName: string;

  protected constructor(resourceName: string) {
    this.resourceName = resourceName;
  }
}
