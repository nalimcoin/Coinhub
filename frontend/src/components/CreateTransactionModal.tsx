'use client';

import { useState, FormEvent, useEffect } from 'react';
import { TransactionService } from '../services/TransactionService';
import { CategoryService } from '../services/CategoryService';
import { Category } from '../models/Category';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionCreated: () => void;
  accountId: number;
}

export default function CreateTransactionModal({
  isOpen,
  onClose,
  onTransactionCreated,
  accountId
}: CreateTransactionModalProps) {
  const [isIncome, setIsIncome] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const transactionService = new TransactionService();
  const categoryService = new CategoryService();

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0 && !categoryId) {
        setCategoryId(fetchedCategories[0].getId());
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie');
      setIsLoading(false);
      return;
    }

    if (categories.length === 0) {
      setError('Aucune catégorie disponible. Veuillez créer une catégorie d\'abord.');
      setIsLoading(false);
      return;
    }

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);

      await transactionService.createTransaction({
        isIncome,
        amount: amountInCents,
        description: description || null,
        date: new Date(date),
        accountId,
        categoryId,
      });

      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsIncome(false);
      onTransactionCreated();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la création de la transaction');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border-2 border-black p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-black">Créer une transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              Type de transaction
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsIncome(false)}
                className={`flex-1 py-3 rounded-lg border-2 border-black font-semibold transition-colors ${
                  !isIncome ? 'bg-red-400 text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                💸 Dépense
              </button>
              <button
                type="button"
                onClick={() => setIsIncome(true)}
                className={`flex-1 py-3 rounded-lg border-2 border-black font-semibold transition-colors ${
                  isIncome ? 'bg-green-400 text-white' : 'bg-white text-black hover:bg-gray-100'
                }`}
                disabled={isLoading}
              >
                💰 Revenu
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold mb-2 text-black">
              Montant
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="0.00"
              step="0.01"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold mb-2 text-black">
              Catégorie
            </label>
            <select
              id="category"
              value={categoryId || ''}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              disabled={isLoading || categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Aucune catégorie disponible</option>
              ) : (
                categories.map((category) => (
                  <option key={category.getId()} value={category.getId()}>
                    {category.getName()}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-semibold mb-2 text-black">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-2 text-black">
              Description (optionnel)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              placeholder="Ex: Courses du mois"
              disabled={isLoading}
              maxLength={255}
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-200 text-black font-bold rounded-lg border-2 border-black hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || categories.length === 0}
              className="flex-1 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
