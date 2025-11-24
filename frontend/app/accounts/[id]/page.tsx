'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/src/components/Layout';
import CreateTransactionModal from '@/src/components/CreateTransactionModal';
import { AccountService } from '@/src/services/AccountService';
import { TransactionService } from '@/src/services/TransactionService';
import { CategoryService } from '@/src/services/CategoryService';
import { Account } from '@/src/models/Account';
import { Transaction } from '@/src/models/Transaction';
import { Category } from '@/src/models/Category';

export default function AccountTransactionsPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = parseInt(params.id as string);

  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Map<number, Category>>(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const accountService = new AccountService();
  const transactionService = new TransactionService();
  const categoryService = new CategoryService();

  useEffect(() => {
    if (!isNaN(accountId)) {
      loadData();
    }
  }, [accountId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('coinhub_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const [fetchedAccount, fetchedTransactions, fetchedCategories] = await Promise.all([
        accountService.getAccountById(accountId),
        transactionService.getTransactionsByAccountId(accountId),
        categoryService.getAllCategories(),
      ]);

      setAccount(fetchedAccount);
      setTransactions(fetchedTransactions);

      const categoryMap = new Map<number, Category>();
      fetchedCategories.forEach(cat => categoryMap.set(cat.getId(), cat));
      setCategories(categoryMap);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du chargement des données');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      return;
    }

    try {
      await transactionService.deleteTransaction(transactionId);
      await loadData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la suppression de la transaction');
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-xl text-red-600">Compte non trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* En-tête du compte */}
        <div className="bg-white rounded-lg border-2 border-black p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">{account.getName()}</h1>
              <p className="text-gray-600">Compte bancaire</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-500 transition-colors flex items-center gap-2"
            >
              <span className="text-xl">➕</span>
              Nouvelle transaction
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-sm text-gray-600">Solde actuel</p>
              <p className={`text-3xl font-bold ${account.getActualBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {account.getFormattedBalance()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Solde initial</p>
              <p className="text-xl text-black">{account.getFormattedInitialBalance()}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Historique des transactions */}
        <div className="bg-white rounded-lg border-2 border-black p-6">
          <h2 className="text-2xl font-bold text-black mb-6">Historique des transactions</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">Aucune transaction pour le moment</p>
              <p className="text-gray-500">Créez votre première transaction pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const category = categories.get(transaction.getCategoryId());
                return (
                  <div
                    key={transaction.getId()}
                    className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-black transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {category && (
                        <div
                          className="w-12 h-12 rounded-full border-2 border-black flex-shrink-0"
                          style={{ backgroundColor: category.getColor() }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-black">
                            {category ? category.getName() : 'Catégorie inconnue'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.isIncomeTransaction()
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.isIncomeTransaction() ? 'Revenu' : 'Dépense'}
                          </span>
                        </div>
                        {transaction.getDescription() && (
                          <p className="text-sm text-gray-600 truncate">{transaction.getDescription()}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.getDate().toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className={`text-2xl font-bold ${
                        transaction.isIncomeTransaction() ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.isIncomeTransaction() ? '+' : '-'}
                        {transaction.getFormattedAmount(account.getCurrency())}
                      </p>
                      <button
                        onClick={() => handleDeleteTransaction(transaction.getId())}
                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <CreateTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTransactionCreated={loadData}
          accountId={accountId}
        />
      </div>
    </Layout>
  );
}
