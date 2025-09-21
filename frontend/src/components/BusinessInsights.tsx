import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  Lightbulb, 
  Award,
  DollarSign,
  Activity
} from 'lucide-react';
import type { ClientPortrait } from '../types/analytics';
import { generateBusinessInsights } from '../utils/analytics';

interface BusinessInsightsProps {
  data: ClientPortrait;
}

interface InsightCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: 'success' | 'warning' | 'info' | 'recommendation';
  metric?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, description, icon, type, metric }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20';
      case 'recommendation':
        return 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'recommendation':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-xl border-2 ${getTypeStyles()} transition-all duration-200`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${getIconColor()}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {description}
          </p>
          {metric && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-sm font-medium">
              {metric}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BusinessInsights: React.FC<BusinessInsightsProps> = ({ data }) => {
  const insights = generateBusinessInsights(data);
  
  // Автоматически генерируем инсайты на основе данных
  const getSmartInsights = () => {
    const smartInsights = [];
    
    // Анализ конверсии онбординга
    if (data.onboardingStats.conversionRate < 50) {
      smartInsights.push({
        title: 'Низкая конверсия онбординга',
        description: `Только ${data.onboardingStats.conversionRate.toFixed(1)}% пользователей завершают процесс регистрации. Рекомендуется упростить процесс и добавить мотивирующие элементы.`,
        icon: <AlertTriangle className="h-6 w-6" />,
        type: 'warning' as const,
        metric: `${data.onboardingStats.conversionRate.toFixed(1)}% конверсия`
      });
    }
    
    // Анализ активности
    const activeRate = (data.retentionAnalysis.activeClients / data.totalClients) * 100;
    if (activeRate > 70) {
      smartInsights.push({
        title: 'Высокий уровень активности',
        description: `${activeRate.toFixed(1)}% клиентов проявляют активность. Это отличный показатель вовлеченности пользователей.`,
        icon: <Activity className="h-6 w-6" />,
        type: 'success' as const,
        metric: `${activeRate.toFixed(1)}% активных`
      });
    }
    
    // Анализ маркетинговых каналов
    const topChannel = data.marketingChannels[0];
    if (topChannel && topChannel.percentage > 40) {
      smartInsights.push({
        title: 'Высокая зависимость от одного канала',
        description: `${topChannel.percentage.toFixed(1)}% клиентов приходит через "${topChannel.channel.replace('Маркетинг KZ - ', '')}". Рекомендуется диверсифицировать источники трафика.`,
        icon: <Target className="h-6 w-6" />,
        type: 'warning' as const,
        metric: `${topChannel.percentage.toFixed(1)}% от одного канала`
      });
    }
    
    // Анализ сегментов депозитов
    const vipSegment = data.segments.find(s => s.segment.includes('VIP'));
    if (vipSegment && vipSegment.percentage > 5) {
      smartInsights.push({
        title: 'Значительная доля VIP клиентов',
        description: `${vipSegment.percentage.toFixed(1)}% клиентов относятся к VIP сегменту. Это высокий показатель монетизации.`,
        icon: <Award className="h-6 w-6" />,
        type: 'success' as const,
        metric: `${vipSegment.percentage.toFixed(1)}% VIP клиентов`
      });
    }
    
    // Рекомендации по улучшению
    smartInsights.push({
      title: 'Персонализация по возрасту',
      description: 'Основную долю составляют клиенты 25-34 лет. Создайте персонализированные предложения для разных возрастных групп.',
      icon: <Lightbulb className="h-6 w-6" />,
      type: 'recommendation' as const
    });
    
    return smartInsights;
  };
  
  const smartInsights = getSmartInsights();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
    >
      <div className="flex items-center space-x-3 mb-8">
        <TrendingUp className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Бизнес-инсайты и рекомендации
        </h2>
      </div>
      
      {/* Ключевые метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Всего клиентов</p>
              <p className="text-2xl font-bold">{data.totalClients.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Общие депозиты</p>
              <p className="text-2xl font-bold">
                ${(data.depositAnalysis.totalDeposits / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Конверсия</p>
              <p className="text-2xl font-bold">{data.onboardingStats.conversionRate.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Активность</p>
              <p className="text-2xl font-bold">
                {((data.retentionAnalysis.activeClients / data.totalClients) * 100).toFixed(1)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>
      
      {/* Умные инсайты */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {smartInsights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InsightCard {...insight} />
          </motion.div>
        ))}
      </div>
      
      {/* Детальная аналитика */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Детальная статистика
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {metric.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metric.value}
                    </span>
                    {(metric as any).conversion && (
                      <span className="text-xs text-gray-500">
                        {(metric as any).conversion}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessInsights;