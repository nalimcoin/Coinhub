'use client';

import Layout from '../../components/Layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8">Tableau de bord</h1>

        <div className="bg-white rounded-lg border-2 border-black p-8">
          <p className="text-xl text-gray-600">Bienvenue sur CoinHub!</p>
          <p className="text-gray-500 mt-4">Utilisez le menu à gauche pour naviguer dans l&apos;application.</p>
        </div>
      </div>
    </Layout>
  );
}
