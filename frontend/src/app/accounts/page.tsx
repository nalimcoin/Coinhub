'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import CreateAccountModal from '../../components/CreateAccountModal';
import { AccountService } from '../../services/AccountService';
import { Account } from '../../models/Account';
import { getUserIdFromToken } from '../../utils/jwt';

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const accountService = new AccountService();

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = getUserIdFromToken();
      if (!userId) {
        router.push('/login');
        return;
      }

      const fetchedAccounts = await accountService.getAccountsByUserId(userId);
      setAccounts(fetchedAccounts);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du chargement des comptes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleDeleteAccount = async (accountId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      return;
    }

    try {
      await accountService.deleteAccount(accountId);
      await loadAccounts();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la suppression du compte');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">Mes Comptes</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">➕</span>
            Créer un compte
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Chargement des comptes...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-black p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">Vous n&apos;avez pas encore de compte bancaire</p>
            <p className="text-gray-500">Créez votre premier compte pour commencer à gérer votre budget</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.getId()}
                className="bg-white rounded-lg border-2 border-black p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-black">{account.getName()}</h3>
                  <button
                    onClick={() => handleDeleteAccount(account.getId())}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    🗑️
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Solde actuel</p>
                    <p className={`text-2xl font-bold ${account.getActualBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {account.getFormattedBalance()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Solde initial</p>
                    <p className="text-lg text-black">{account.getFormattedInitialBalance()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Créé le</p>
                    <p className="text-sm text-black">
                      {account.getCreationDate().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Dernières transactions</p>
                  <p className="text-sm text-gray-400 italic">Aucune transaction pour le moment</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAccountCreated={loadAccounts}
        />
      </div>
    </Layout>
  );
}
