'use client';

import { useState, FormEvent } from 'react';
import { AuthService } from '../services/AuthService';
import { RegisterCredentials } from '../models/RegisterCredentials';

export default function RegisterForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authService = new AuthService();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const credentials = new RegisterCredentials(email, password, firstName, lastName);
      const user = await authService.register(credentials);
      console.log('Inscription réussie:', user.toJSON());
      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-yellow-400 p-8 rounded-lg shadow-lg border-2 border-black">
          <div className="mb-8 flex justify-center">
            <img
              src="/logo.jpg"
              alt="CoinHub Logo"
              className="h-16 w-auto bg-white px-4 py-2 rounded"
            />
          </div>

          <h1 className="text-2xl font-bold text-center mb-6 text-black">
            Créer un compte
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold mb-2 text-black">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold mb-2 text-black">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2 text-black">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                placeholder=""
                required
                disabled={isLoading}
                minLength={12}
              />
              <p className="text-xs mt-1 text-black">Minimum 12 caractères</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white text-black font-bold rounded-lg border-2 border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>
        </div>

        <button
          onClick={() => window.location.href = '/login'}
          className="w-full mt-4 py-3 bg-white text-black font-bold rounded-lg border-2 border-black hover:bg-gray-100 transition-colors"
        >
          Déjà un compte ? Se connecter
        </button>
      </div>
    </div>
  );
}
