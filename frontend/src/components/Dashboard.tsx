'use client';

import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-yellow-400 border-b-2 border-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo.jpg"
              alt="CoinHub Logo"
              className="h-12 w-auto bg-white px-3 py-1 rounded"
            />
          </div>

          {/* Bouton de déconnexion */}
          <button
            onClick={logout}
            className="px-6 py-2 bg-white text-black font-bold rounded-lg border-2 border-black hover:bg-gray-100 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg border-2 border-black p-8">
          {/* Message de bienvenue */}
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur CoinHub !
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              Vous êtes bien authentifié
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 max-w-2xl mx-auto">
              <div className="flex items-start">
                <svg
                  className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Connexion réussie
                  </h3>
                  <p className="text-gray-700">
                    Votre token JWT a été enregistré avec succès dans le localStorage.
                    Vous pouvez maintenant accéder à toutes les fonctionnalités de l&apos;application.
                  </p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="text-3xl mb-2">🔐</div>
                <h3 className="font-bold text-gray-900 mb-2">Sécurisé</h3>
                <p className="text-sm text-gray-600">
                  Votre session est protégée par JWT
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900 mb-2">Rapide</h3>
                <p className="text-sm text-gray-600">
                  Architecture moderne avec Next.js
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="text-3xl mb-2">💎</div>
                <h3 className="font-bold text-gray-900 mb-2">Crypto</h3>
                <p className="text-sm text-gray-600">
                  Plateforme de gestion de cryptomonnaies
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
