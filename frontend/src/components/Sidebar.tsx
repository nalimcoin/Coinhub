'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('coinhub_token');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Accueil', icon: '🏠', path: '/dashboard' },
    { name: 'Comptes', icon: '💳', path: '/accounts' },
    { name: 'Catégories', icon: '🏷️', path: '/categories' },
    { name: 'Transactions', icon: '📊', path: '/transactions' },
    { name: 'Paramètres', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div className="w-[200px] h-screen bg-yellow-400 flex flex-col border-r-2 border-black fixed left-0 top-0">
      <div className="p-4 flex justify-center">
        <div className="bg-white px-4 py-2 rounded border-2 border-black flex items-center justify-center">
          <img
            src="/logo.jpg"
            alt="CoinHub Logo"
            className="max-h-12 max-w-full object-contain"
          />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isDisabled = item.path === '/transactions' || item.path === '/settings';
          return (
            <button
              key={item.path}
              onClick={() => !isDisabled && router.push(item.path)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-black font-semibold transition-colors ${
                isDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : pathname === item.path
                  ? 'bg-white text-black'
                  : 'bg-yellow-400 text-black hover:bg-yellow-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-black bg-white text-black font-semibold hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}
