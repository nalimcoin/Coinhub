'use client';

import { useState, FormEvent } from 'react';
import { AccountService } from '../services/AccountService';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export default function CreateAccountModal({ isOpen, onClose, onAccountCreated }: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const accountService = new AccountService();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const balanceInCents = Math.round(parseFloat(initialBalance) * 100);

      await accountService.createAccount({
        name,
        initialBalance: balanceInCents,
        currency,
      });

      setName('');
      setInitialBalance('');
      setCurrency('EUR');
      onAccountCreated();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la création du compte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border-2 border-black p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-black">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-semibold mb-2 text-black">
              Nom du compte
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Ex: Compte courant"
              required
              disabled={isLoading}
              minLength={5}
              maxLength={50}
            />
          </div>

          <div>
            <label htmlFor="initialBalance" className="block text-sm font-semibold mb-2 text-black">
              Solde initial
            </label>
            <input
              type="number"
              id="initialBalance"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="0.00"
              step="0.01"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-semibold mb-2 text-black">
              Devise
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              disabled={isLoading}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CHF">CHF (Fr)</option>
            </select>
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
              disabled={isLoading}
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
