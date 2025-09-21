import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
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
    const highActivityClients = data.activityLevels.find((level: any) => level.level === 'Очень высокий')?.count || 0;
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


    return insights;
  };

  // Генерация AI инсайтов через OpenRouter
  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    
    try {
      // Подготовка данных для AI анализа
      const analyticsData = {
        totalClients: data.totalClients,
        activeClients: data.retentionAnalysis.activeClients,
        churnRate: data.retentionAnalysis.churnRate.toFixed(1),
        wealthSegments: data.wealthSegments.slice(0,3).map((ws: any) => ({
          segment: ws.segment,
          clients: ws.count
        })),
        demographics: {
          gender: data.demographics.gender,
          age: data.demographics.age
        },
        depositAnalysis: data.depositAnalysis
      };

      const prompt = `Анализируй данные клиентской аналитики и дай 3 конкретные бизнес-рекомендации на русском языке:

Данные:
${JSON.stringify(analyticsData, null, 2)}

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
}`;

      // Проверяем доступность API ключа
      const apiKey = (import.meta as any).env?.VITE_OPENROUTER_KEY || 
                    (window as any).__VITE_OPENROUTER_KEY__;
      
      if (!apiKey || apiKey === 'undefined' || apiKey.includes('your_openrouter_api_key_here')) {
        console.warn('OpenRouter API key not available, using fallback insights');
        throw new Error('API key not configured');
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Freedom Analytics Dashboard",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "qwen/qwen3-30b-a3b-instruct-2507",
          "messages": [
            {
              "role": "user",
              "content": prompt
            }
          ],
          "max_tokens": 1500,
          "temperature": 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content;
      
      if (aiResponse) {
        // Парсим JSON ответ от AI
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiData = JSON.parse(jsonMatch[0]);
          const newAiInsights = aiData.insights.map((insight: any, index: number) => ({
            id: `ai-${index}`,
            type: insight.type,
            icon: <Brain className="h-5 w-5" />,
            title: insight.title,
            description: insight.description,
            recommendation: insight.recommendation,
            impact: insight.impact,
            aiGenerated: true
          }));
          
          setAiInsights(newAiInsights);
        }
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Улучшенные фоллбэк инсайты на основе реальных данных
      const fallbackInsights: Insight[] = [
        {
          id: 'ai-fallback-1',
          type: 'info',
          icon: <Brain className="h-5 w-5" />,
          title: 'Оптимизация маркетинговых каналов',
          description: `Анализ показывает возможности для оптимизации клиентской базы`,
          recommendation: 'Диверсифицируйте источники трафика и увеличьте инвестиции в недооцененные каналы',
          impact: 'high',
          aiGenerated: true
        },
        {
          id: 'ai-fallback-2',
          type: data.retentionAnalysis.churnRate > 25 ? 'warning' : 'success',
          icon: <Zap className="h-5 w-5" />,
          title: 'Программа удержания клиентов',
          description: `Текущий риск оттока ${data.retentionAnalysis.churnRate.toFixed(1)}% ${data.retentionAnalysis.churnRate > 25 ? 'превышает' : 'находится в пределах'} нормы`,
          recommendation: data.retentionAnalysis.churnRate > 25 ? 
            'Внедрите проактивные меры удержания и персонализированные предложения' :
            'Поддерживайте текущий уровень клиентского сервиса',
          impact: data.retentionAnalysis.churnRate > 25 ? 'high' : 'medium',
          aiGenerated: true
        },
        {
          id: 'ai-fallback-3',
          type: 'success',
          icon: <Target className="h-5 w-5" />,
          title: 'Сегментация и персонализация',
          description: `Выявлено ${data.wealthSegments.length} сегментов богатства с разной активностью`,
          recommendation: 'Создайте персонализированные продуктовые предложения для каждого сегмента',
          impact: 'medium',
          aiGenerated: true
        }
      ];
      setAiInsights(fallbackInsights);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    // Запускаем генерацию AI инсайтов с небольшой задержкой
    const timer = setTimeout(generateAIInsights, 2000);
    return () => clearTimeout(timer);
  }, [data]);

  const basicInsights = getBasicInsights();
  const allInsights = [...basicInsights, ...aiInsights];

  const getInsightColor = (type: string, aiGenerated?: boolean) => {
    const colors = {
      success: aiGenerated ? 'bg-green-100 text-green-700 border-green-200' : 'bg-green-50 text-green-700',
      warning: aiGenerated ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-yellow-50 text-yellow-700',
      info: aiGenerated ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-50 text-blue-700',
      danger: aiGenerated ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-50 text-red-700'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const getInsightIconColor = (type: string, aiGenerated?: boolean) => {
    const colors = {
      success: aiGenerated ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600',
      warning: aiGenerated ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-600',
      info: aiGenerated ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600',
      danger: aiGenerated ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'
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
            <span>AI анализ...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allInsights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type, insight.aiGenerated)} ${
              insight.aiGenerated ? 'border-2 border-dashed' : 'border'
            }`}
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {insight.description}
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    💡 Рекомендация: {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {allInsights.length === 0 && !isLoadingAI && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Анализируем данные для генерации инсайтов...</p>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessInsights;