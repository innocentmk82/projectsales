import React, { useEffect, useState } from 'react';
import { User, Moon, Sun, LogOut, Package, RefreshCw, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import QueuedActionsModal from './QueuedActionsModal';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-72">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="ml-2 text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
              StockFlow
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {currentUser?.email}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 capitalize">
                    {currentUser?.role}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {showInstall && (
              <button
                onClick={handleInstall}
                className="flex items-center px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-xs font-semibold"
                title="Install App"
              >
                <Download className="h-4 w-4 mr-1" /> Install App
              </button>
            )}
            <button
              onClick={() => setQueueModalOpen(true)}
              className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs font-semibold"
              title="View Offline Queue"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Offline Queue
            </button>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              title={isOnline ? 'Online' : 'Offline'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      <QueuedActionsModal open={queueModalOpen} onClose={() => setQueueModalOpen(false)} />
    </nav>
  );
};

export default Navbar;