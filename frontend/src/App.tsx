import { useState, useEffect } from 'react';
import { BarChart3, Moon, Sun, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CSVUploader from './components/CSVUploader';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { analyzeClientData } from './utils/analytics';
import type { ClientData, ClientPortrait } from './types/analytics';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showCSVUploader, setShowCSVUploader] = useState(false);
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [analyticsData, setAnalyticsData] = useState<ClientPortrait | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleCSVData = async (data: ClientData[]) => {
    setAnalyticsLoading(true);
    try {
      setClientData(data);
      const portrait = analyzeClientData(data);
      setAnalyticsData(portrait);
    } catch (error) {
      console.error('Error analyzing data:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Freedom Client Analytics
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              
              {/* Load CSV Button */}
              <button
                onClick={() => setShowCSVUploader(!showCSVUploader)}
                className="btn-primary flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Load CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* CSV Uploader Modal */}
          {showCSVUploader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowCSVUploader(false);
                }
              }}
            >
              <CSVUploader
                onDataLoaded={handleCSVData}
                onClose={() => setShowCSVUploader(false)}
              />
            </motion.div>
          )}

          {/* Analytics Content */}
          {analyticsData ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnalyticsDashboard data={analyticsData} loading={analyticsLoading} />
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-lg"
              >
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Загрузите данные клиентов
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Загрузите CSV файл с данными клиентов, чтобы начать анализ и построить 
                  портреты пользователей для хакатона Freedom.
                </p>
                <button
                  onClick={() => setShowCSVUploader(true)}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <FileText className="h-5 w-5" />
                  <span>Загрузить CSV</span>
                </button>
                
                {/* Sample Data Info */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Ожидаемые колонки в CSV:
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    original_client_user_id, total_deposit, avg_activity, sex_type_*, age_segment_*, 
                    маркетинговые каналы и другие метрики активности клиентов
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
