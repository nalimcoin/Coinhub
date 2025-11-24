import { CategoryRepository } from '../repositories/CategoryRepository.js';
import { CategoryName } from '../models/CategoryName.js';
import { Color } from '../models/Color.js';

interface DefaultCategoryData {
  name: string;
  description: string;
  color: string;
}

export class DefaultCategoryService {
  private categoryRepository: CategoryRepository;

  private static readonly DEFAULT_CATEGORIES: DefaultCategoryData[] = [
    {
      name: 'Alimentation',
      description: 'Courses, restaurants, livraisons de repas',
      color: '#FF6B6B',
    },
    {
      name: 'Transport',
      description: 'Essence, transports en commun, taxi, vélo',
      color: '#4ECDC4',
    },
    {
      name: 'Logement',
      description: 'Loyer, charges, électricité, eau, internet',
      color: '#45B7D1',
    },
    {
      name: 'Loisirs',
      description: 'Cinéma, concerts, sorties, hobbies',
      color: '#FFA07A',
    },
    {
      name: 'Vêtements',
      description: 'Habits, chaussures, accessoires',
      color: '#98D8C8',
    },
    {
      name: 'Santé',
      description: 'Médecin, pharmacie, sport, bien-être',
      color: '#F7DC6F',
    },
    {
      name: 'Éducation',
      description: 'Livres, formations, cours, abonnements éducatifs',
      color: '#BB8FCE',
    },
    {
      name: 'Shopping',
      description: 'Achats divers, électronique, décoration',
      color: '#F8B739',
    },
    {
      name: 'Abonnements',
      description: 'Netflix, Spotify, services en ligne',
      color: '#5DADE2',
    },
    {
      name: 'Cadeaux',
      description: 'Anniversaires, fêtes, cadeaux divers',
      color: '#EC7063',
    },
    {
      name: 'Épargne',
      description: 'Économies, investissements, placements',
      color: '#52BE80',
    },
    {
      name: 'Autre',
      description: 'Dépenses non catégorisées',
      color: '#95A5A6',
    },
  ];

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  public async createDefaultCategoriesForUser(userId: number): Promise<void> {
    for (const categoryData of DefaultCategoryService.DEFAULT_CATEGORIES) {
      const categoryName = new CategoryName(categoryData.name);
      const categoryColor = new Color(categoryData.color);

      await this.categoryRepository.create(
        categoryName,
        categoryData.description,
        categoryColor,
        userId
      );
    }
  }
}
