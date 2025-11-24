export interface ICategory {
  categoryId: number;
  name: string;
  description: string | null;
  color: string;
}

export class Category {
  private categoryId: number;
  private name: string;
  private description: string | null;
  private color: string;

  constructor(data: ICategory) {
    this.categoryId = data.categoryId;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color;
  }

  public getId(): number {
    return this.categoryId;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getColor(): string {
    return this.color;
  }

  public toJSON(): ICategory {
    return {
      categoryId: this.categoryId,
      name: this.name,
      description: this.description,
      color: this.color,
    };
  }
}
