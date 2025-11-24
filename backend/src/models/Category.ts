import { CategoryName } from './CategoryName.js';
import { Color } from './Color.js';

export class Category {
  private categoryId: number;
  private name: CategoryName;
  private description: string | null;
  private color: Color;
  private userId: number;

  constructor(
    categoryId: number,
    name: CategoryName,
    description: string | null,
    color: Color,
    userId: number
  ) {
    this.categoryId = categoryId;
    this.name = name;
    this.description = description;
    this.color = color;
    this.userId = userId;
  }

  public getId(): number {
    return this.categoryId;
  }

  public getName(): CategoryName {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getColor(): Color {
    return this.color;
  }

  public getUserId(): number {
    return this.userId;
  }

  public setName(name: CategoryName): void {
    this.name = name;
  }

  public setDescription(description: string | null): void {
    this.description = description;
  }

  public setColor(color: Color): void {
    this.color = color;
  }

  public toJSON() {
    return {
      categoryId: this.categoryId,
      name: this.name.getValue(),
      description: this.description,
      color: this.color.getValue(),
      userId: this.userId,
    };
  }
}
