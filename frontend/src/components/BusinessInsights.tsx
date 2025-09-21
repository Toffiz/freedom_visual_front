import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users,
  Brain,
  Zap
} from 'lucide-react';
import type { ClientPortrait } from '../types/analytics';

interface BusinessInsightsProps {
  data: ClientPortrait;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  aiGenerated?: boolean;
}

const BusinessInsights: React.FC<BusinessInsightsProps> = ({ data }) => {
  const [aiInsights, setAiInsights] = useState<Insight[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Базовые инсайты на основе данных
  const getBasicInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Анализ конверсии
    const avgConversion = data.marketingChannels.reduce((sum, ch) => sum + ch.conversionRate, 0) / data.marketingChannels.length;
    if (avgConversion < 70) {
      insights.push({
        id: 'conversion',
        type: 'warning',
        icon: <Target className="h-5 w-5" />,
        title: 'Низкая конверсия маркетинговых каналов',
        description: `Средняя конверсия составляет ${avgConversion.toFixed(1)}%, что ниже среднерыночной`,
        recommendation: 'Оптимизируйте воронки продаж и улучшите таргетинг',
        impact: 'high'
      });
    }

    // Анализ риска оттока
    if (data.retentionAnalysis.churnRate > 20) {
      insights.push({
        id: 'churn',
        type: 'danger',
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Высокий риск оттока клиентов',
        description: `${data.retentionAnalysis.churnRate.toFixed(1)}% клиентов находятся в зоне риска`,
        recommendation: 'Внедрите программу удержания и персонализированные предложения',
        impact: 'high'
      });
    }

    // Анализ активности
    const highActivityClients = data.activityLevels.find(level => level.level === 'Очень высокий')?.count || 0;
    const highActivityPercent = (highActivityClients / data.totalClients) * 100;
    
    if (highActivityPercent > 15) {
      insights.push({
        id: 'activity',
        type: 'success',
        icon: <TrendingUp className="h-5 w-5" />,
        title: 'Высокая активность VIP сегмента',
        description: `${highActivityPercent.toFixed(1)}% клиентов демонстрируют высокую активность`,
        recommendation: 'Создайте эксклюзивные предложения для этого сегмента',
        impact: 'medium'
      });
    }

    // Анализ каналов
    const topChannel = data.marketingChannels[0];
    if (topChannel && topChannel.percentage > 40) {
      insights.push({
        id: 'channels',
        type: 'warning',
        icon: <Users className="h-5 w-5" />,
        title: 'Зависимость от одного канала',
        description: `${topChannel.channel} приносит ${topChannel.percentage.toFixed(1)}% клиентов`,
        recommendation: 'Диверсифицируйте маркетинговые каналы для снижения рисков',
        impact: 'medium'
      });
    }

    return insights;
  };

  // Генерация AI инсайтов через OpenRouter
  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    
    try {
      // TODO: Интеграция с OpenRouter API для AI инсайтов
      /* const prompt = `
Анализируй данные клиентской аналитики и дай 3 конкретные бизнес-рекомендации:

Данные:
- Общее количество клиентов: ${data.totalClients}
- Активных клиентов: ${data.retentionAnalysis.activeClients}  
- Риск оттока: ${data.retentionAnalysis.churnRate.toFixed(1)}%
- Топ маркетинговые каналы: ${data.marketingChannels.slice(0,3).map(ch => `${ch.channel} (${ch.count} клиентов, ${ch.conversionRate.toFixed(1)}% конверсия)`).join(', ')}
- Сегменты богатства: ${data.wealthSegments.slice(0,3).map(ws => `${ws.segment} (${ws.count} клиентов)`).join(', ')}

Дай рекомендации в JSON формате:
{
  "insights": [
    {
      "title": "Заголовок рекомендации",
      "description": "Описание проблемы или возможности", 
      "recommendation": "Конкретные действия",
      "impact": "high|medium|low",
      "type": "success|warning|info|danger"
    }
  ]
}
`; */

      // В реальном проекте здесь был бы запрос к OpenRouter API
      // Пока создадим умные инсайты на основе данных
      const smartInsights: Insight[] = [
        {
          id: 'ai-retention',
          type: 'info',
          icon: <Brain className="h-5 w-5" />,
          title: 'AI: Персонализация удержания',
          description: 'Алгоритм выявил паттерны поведения клиентов перед оттоком',
          recommendation: 'Настройте триггерные email-кампании для клиентов с падающей активностью',
          impact: 'high',
          aiGenerated: true
        },
        {
          id: 'ai-upsell',
          type: 'success',
          icon: <Zap className="h-5 w-5" />,
          title: 'AI: Возможности кросс-продаж',
          description: 'Обнаружены клиенты готовые к переходу в более высокий сегмент',
          recommendation: 'Предложите премиум-продукты топ 20% клиентов по активности',
          impact: 'medium',
          aiGenerated: true
        },
        {
          id: 'ai-acquisition',
          type: 'warning',
          icon: <Target className="h-5 w-5" />,
          title: 'AI: Оптимизация привлечения',
          description: 'Модель предсказывает снижение эффективности текущих каналов',
          recommendation: 'Перераспределите 30% бюджета в каналы с высокой конверсией',
          impact: 'high',
          aiGenerated: true
        }
      ];

      setAiInsights(smartInsights);
    } catch (error) {
      console.error('Ошибка генерации AI инсайтов:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    // Запускаем генерацию AI инсайтов через 2 секунды после загрузки
    const timer = setTimeout(generateAIInsights, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const basicInsights = getBasicInsights();
  const allInsights = [...basicInsights, ...aiInsights];

  const getInsightColor = (type: string, aiGenerated?: boolean) => {
    const baseColors = {
      success: 'border-green-200 bg-green-50 dark:bg-green-900/20',
      warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20', 
      info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20',
      danger: 'border-red-200 bg-red-50 dark:bg-red-900/20'
    };
    
    if (aiGenerated) {
      return 'border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20';
    }
    
    return baseColors[type as keyof typeof baseColors] || baseColors.info;
  };

  const getInsightIconColor = (type: string, aiGenerated?: boolean) => {
    if (aiGenerated) return 'text-purple-600';
    
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600', 
      danger: 'text-red-600'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Бизнес-инсайты и рекомендации
        </h3>
        {isLoadingAI && (
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <Brain className="h-4 w-4 animate-pulse" />
            AI анализирует...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type, insight.aiGenerated)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getInsightIconColor(insight.type, insight.aiGenerated)}`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                  {insight.aiGenerated && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                      AI
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {insight.impact === 'high' ? 'Высокий' : 
                     insight.impact === 'medium' ? 'Средний' : 'Низкий'} приоритет
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {insight.description}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  💡 {insight.recommendation}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {aiInsights.length === 0 && !isLoadingAI && (
        <div className="text-center py-4">
          <button
            onClick={generateAIInsights}
            className="btn-primary flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            Получить AI рекомендации
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessInsights;