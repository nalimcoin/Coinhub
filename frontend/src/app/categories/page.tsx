'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import CreateCategoryModal from '../../components/CreateCategoryModal';
import { CategoryService } from '../../services/CategoryService';
import { Category } from '../../models/Category';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryService = new CategoryService();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('coinhub_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du chargement des catégories');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('used in transactions')) {
          setError('Impossible de supprimer cette catégorie car elle est utilisée dans des transactions');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur est survenue lors de la suppression de la catégorie');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">Mes Catégories</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Créer une catégorie
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Chargement des catégories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-black p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Vous n&apos;avez pas encore de catégorie</p>
            <p className="text-gray-500">Créez votre première catégorie pour organiser vos dépenses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.getId()}
                className="bg-white rounded-lg border-2 border-black p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-black"
                      style={{ backgroundColor: category.getColor() }}
                    />
                    <h3 className="text-lg font-bold text-black">{category.getName()}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.getId())}
                    className="text-red-600 hover:text-red-800 font-bold text-lg ml-2"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>

                {category.getDescription() && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {category.getDescription()}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{category.getColor()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCategoryCreated={loadCategories}
        />
      </div>
    </Layout>
  );
}
