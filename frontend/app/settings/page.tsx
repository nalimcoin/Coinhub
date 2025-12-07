'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/src/components/Layout';
import { UserService } from '@/src/services/UserService';
import { AuthService } from '@/src/services/AuthService';
import { User } from '@/src/models/User';

export default function SettingsPage() {
  const router = useRouter();
  const authService = new AuthService();
  const userService = new UserService('http://localhost:3001/api', authService);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
      setFormData({
        email: currentUser.email,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!user) return;

    try {
      const updateData: {
        email?: string;
        firstName?: string;
        lastName?: string;
        password?: string;
      } = {};

      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      if (formData.firstName !== user.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== user.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }

      if (Object.keys(updateData).length === 0) {
        setError('Aucune modification détectée');
        return;
      }

      const updatedUser = await userService.updateUser(user.id, updateData);
      setUser(updatedUser);
      setFormData({
        email: updatedUser.email,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        password: '',
        confirmPassword: '',
      });
      setSuccessMessage('Profil mis à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') {
      setError('Veuillez taper "SUPPRIMER" pour confirmer');
      return;
    }

    if (!user) return;

    try {
      await userService.deleteUser(user.id);
      authService.logout();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du compte');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-black p-8">
            <p className="text-center text-gray-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Paramètres</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-lg">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
            <p className="text-green-700 font-semibold">{successMessage}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border-2 border-black p-8 mb-6">
          <h2 className="text-2xl font-bold text-black mb-6">Informations du compte</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-black mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-black mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-black mb-4">Changer le mot de passe</h3>
              <p className="text-sm text-gray-600 mb-4">
                Laissez vide si vous ne souhaitez pas changer votre mot de passe
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-black mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-black mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    minLength={8}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-300 transition-colors"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border-2 border-black p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Zone dangereuse</h2>
          <p className="text-gray-700 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données (comptes bancaires,
            transactions, catégories) seront définitivement supprimées.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="deleteConfirm" className="block text-sm font-bold text-black mb-2">
                  Tapez &quot;SUPPRIMER&quot; pour confirmer
                </label>
                <input
                  type="text"
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="SUPPRIMER"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg border-2 border-black hover:bg-red-700 transition-colors"
                >
                  Confirmer la suppression
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-6 py-3 bg-gray-300 text-black font-bold rounded-lg border-2 border-black hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
