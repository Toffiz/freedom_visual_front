import type { 
  ClientData, 
  ClientPortrait, 
  ClientSegment, 
  MarketingChannel, 
  ActivityLevel, 
  OnboardingStats,
  ChartDataPoint 
} from '../types/analytics';

// Цвета для различных уровней активности
const ACTIVITY_COLORS = {
  'Очень высокий': '#10B981',
  'Высокий': '#3B82F6', 
  'Средний': '#F59E0B',
  'Низкий': '#EF4444',
  'Неактивный': '#6B7280'
};

// Функция для определения уровня активности
const getActivityLevel = (activity: number): { level: string; range: string; color: string } => {
  if (activity >= 4) return { level: 'Очень высокий', range: '4.0+', color: ACTIVITY_COLORS['Очень высокий'] };
  if (activity >= 2) return { level: 'Высокий', range: '2.0-3.9', color: ACTIVITY_COLORS['Высокий'] };
  if (activity >= 1) return { level: 'Средний', range: '1.0-1.9', color: ACTIVITY_COLORS['Средний'] };
  if (activity > 0) return { level: 'Низкий', range: '0.1-0.9', color: ACTIVITY_COLORS['Низкий'] };
  return { level: 'Неактивный', range: '0', color: ACTIVITY_COLORS['Неактивный'] };
};

// Функция для определения сегмента по депозитам
const getDepositSegment = (deposit: number): string => {
  if (deposit === 0) return 'Без депозитов';
  if (deposit < 100) return 'Микро ($0-99)';
  if (deposit < 1000) return 'Малые ($100-999)';
  if (deposit < 10000) return 'Средние ($1K-9.9K)';
  if (deposit < 50000) return 'Крупные ($10K-49.9K)';
  return 'VIP ($50K+)';
};

// Извлечение маркетинговых каналов
const extractMarketingChannels = (data: ClientData[]): MarketingChannel[] => {
  const channelFields = [
    'Маркетинг KZ - Блоггеры - daulet',
    'Маркетинг KZ - Блоггеры - gulmira_qarasai',
    'Маркетинг KZ - Лендинг - ffinkz',
    'Маркетинг KZ - Лендинг - global',
    'Маркетинг KZ - Лендинг - Лендинг не определен',
    'Маркетинг KZ - Не определен Маркетингом - Не определен Маркетингом',
    'Маркетинг KZ - Рекламные Кабинеты - Apple Search',
    'Маркетинг KZ - Рекламные Кабинеты - Google',
    'Маркетинг KZ - Рекламные Кабинеты - TikTok',
    'Маркетинг KZ - Реферальные - tradernet.global',
    'Маркетинг KZ - Реферальные - Реферрер не определен',
    'Органика',
    'Рефералка Sales',
    'Банк',
    'Белиз'
  ];

  const channels: MarketingChannel[] = [];

  channelFields.forEach(field => {
    const clientsInChannel = data.filter(client => (client as any)[field] === 1);
    if (clientsInChannel.length > 0) {
      const onboardedClients = clientsInChannel.filter(client => client.client_onboarded_any);
      const totalDeposits = clientsInChannel.reduce((sum, client) => sum + client.total_deposit, 0);
      
      channels.push({
        channel: field,
        count: clientsInChannel.length,
        percentage: (clientsInChannel.length / data.length) * 100,
        conversionRate: clientsInChannel.length > 0 ? (onboardedClients.length / clientsInChannel.length) * 100 : 0,
        avgLTV: clientsInChannel.length > 0 ? totalDeposits / clientsInChannel.length : 0
      });
    }
  });

  return channels.sort((a, b) => b.count - a.count);
};

// Анализ демографических данных
const analyzeDemographics = (data: ClientData[]) => {
  const genderFields = ['sex_type_Ж', 'sex_type_М', 'sex_type_Не указано клиентом'];
  const ageFields = [
    'age_segment_<18 лет',
    'age_segment_18-24 лет', 
    'age_segment_25-34 лет',
    'age_segment_35-44 лет',
    'age_segment_45-54 лет',
    'age_segment_55 лет +',
    'age_segment_Не указано клиентом'
  ];

  const gender: ChartDataPoint[] = genderFields.map(field => {
    const count = data.filter(client => (client as any)[field] === 1).length;
    return {
      name: field.replace('sex_type_', ''),
      value: count,
      percentage: (count / data.length) * 100
    };
  }).filter(item => item.value > 0);

  const age: ChartDataPoint[] = ageFields.map(field => {
    const count = data.filter(client => (client as any)[field] === 1).length;
    return {
      name: field.replace('age_segment_', ''),
      value: count,
      percentage: (count / data.length) * 100
    };
  }).filter(item => item.value > 0);

  return { gender, age };
};

// Основная функция анализа данных
export const analyzeClientData = (data: ClientData[]): ClientPortrait => {
  if (!data || data.length === 0) {
    throw new Error('Нет данных для анализа');
  }

  // Общая статистика
  const totalClients = data.length;
  const totalDeposits = data.reduce((sum, client) => sum + client.total_deposit, 0);
  const avgDepositPerClient = totalDeposits / totalClients;

  // Анализ активности
  const activityLevels: ActivityLevel[] = [];
  const activityGroups = data.reduce((groups, client) => {
    const { level } = getActivityLevel(client.avg_activity);
    groups[level] = (groups[level] || 0) + 1;
    return groups;
  }, {} as Record<string, number>);

  Object.entries(activityGroups).forEach(([level, count]) => {
    const { range, color } = getActivityLevel(Object.keys(activityGroups).includes(level) ? 1 : 0);
    activityLevels.push({ level, count, range, color });
  });

  // Анализ сегментов по депозитам
  const segments: ClientSegment[] = [];
  const segmentGroups = data.reduce((groups, client) => {
    const segment = getDepositSegment(client.total_deposit);
    groups[segment] = (groups[segment] || []);
    groups[segment].push(client);
    return groups;
  }, {} as Record<string, ClientData[]>);

  Object.entries(segmentGroups).forEach(([segment, clients]) => {
    const avgDeposit = clients.reduce((sum, client) => sum + client.total_deposit, 0) / clients.length;
    const avgActivity = clients.reduce((sum, client) => sum + client.avg_activity, 0) / clients.length;
    
    segments.push({
      segment,
      count: clients.length,
      percentage: (clients.length / totalClients) * 100,
      avgDeposit,
      avgActivity
    });
  });

  // Анализ маркетинговых каналов
  const marketingChannels = extractMarketingChannels(data);

  // Статистика онбординга
  const startedOnboarding = data.filter(client => client.any_started_onboarding > 0);
  const completedOnboarding = data.filter(client => client.any_completed_onboarding > 0);

  const onboardingStats: OnboardingStats = {
    started: startedOnboarding.length,
    completed: completedOnboarding.length,
    conversionRate: startedOnboarding.length > 0 ? (completedOnboarding.length / startedOnboarding.length) * 100 : 0,
    avgTimeToComplete: 0 // Требуется дополнительный расчет на основе дат
  };

  // Демографический анализ
  const demographics = analyzeDemographics(data);

  // Анализ депозитов
  const depositDistribution: ChartDataPoint[] = [
    { name: 'Без депозитов', value: data.filter(c => c.total_deposit === 0).length },
    { name: '$1-99', value: data.filter(c => c.total_deposit > 0 && c.total_deposit < 100).length },
    { name: '$100-999', value: data.filter(c => c.total_deposit >= 100 && c.total_deposit < 1000).length },
    { name: '$1K-9.9K', value: data.filter(c => c.total_deposit >= 1000 && c.total_deposit < 10000).length },
    { name: '$10K-49.9K', value: data.filter(c => c.total_deposit >= 10000 && c.total_deposit < 50000).length },
    { name: '$50K+', value: data.filter(c => c.total_deposit >= 50000).length }
  ].filter(item => item.value > 0);

  // Анализ удержания
  const activeClients = data.filter(client => client.avg_activity > 0).length;
  const avgInactiveDays = data.reduce((sum, client) => sum + client.avg_inactive_days, 0) / data.length;
  const churnRate = ((totalClients - activeClients) / totalClients) * 100;

  const retentionBySegment: ChartDataPoint[] = segments.map(segment => ({
    name: segment.segment,
    value: segment.avgActivity,
    count: segment.count
  }));

  return {
    totalClients,
    segments: segments.sort((a, b) => b.count - a.count),
    marketingChannels,
    activityLevels,
    onboardingStats,
    demographics,
    depositAnalysis: {
      totalDeposits,
      avgDepositPerClient,
      depositDistribution
    },
    retentionAnalysis: {
      activeClients,
      churnRate,
      avgInactiveDays,
      retentionBySegment
    }
  };
};

// Фильтрация данных по различным критериям
export const filterClientData = (
  data: ClientData[], 
  filters: {
    minActivity?: number;
    maxActivity?: number;
    minDeposit?: number;
    maxDeposit?: number;
    onboardedOnly?: boolean;
    marketingChannel?: string;
    ageSegment?: string;
    gender?: string;
  }
): ClientData[] => {
  return data.filter(client => {
    if (filters.minActivity !== undefined && client.avg_activity < filters.minActivity) return false;
    if (filters.maxActivity !== undefined && client.avg_activity > filters.maxActivity) return false;
    if (filters.minDeposit !== undefined && client.total_deposit < filters.minDeposit) return false;
    if (filters.maxDeposit !== undefined && client.total_deposit > filters.maxDeposit) return false;
    if (filters.onboardedOnly && !client.client_onboarded_any) return false;
    
    if (filters.marketingChannel) {
      const hasChannel = (client as any)[filters.marketingChannel] === 1;
      if (!hasChannel) return false;
    }
    
    if (filters.ageSegment) {
      const hasAge = (client as any)[`age_segment_${filters.ageSegment}`] === 1;
      if (!hasAge) return false;
    }
    
    if (filters.gender) {
      const hasGender = (client as any)[`sex_type_${filters.gender}`] === 1;
      if (!hasGender) return false;
    }
    
    return true;
  });
};

// Экспорт отчета в формате для бизнес-презентации
export const generateBusinessInsights = (portrait: ClientPortrait) => {
  const insights = [];
  
  // Ключевые метрики
  insights.push({
    category: 'Обзор',
    metrics: [
      { name: 'Общее количество клиентов', value: portrait.totalClients.toLocaleString() },
      { name: 'Общая сумма депозитов', value: `$${(portrait.depositAnalysis.totalDeposits / 1000000).toFixed(1)}M` },
      { name: 'Средний депозит на клиента', value: `$${portrait.depositAnalysis.avgDepositPerClient.toFixed(0)}` },
      { name: 'Процент активных клиентов', value: `${((portrait.retentionAnalysis.activeClients / portrait.totalClients) * 100).toFixed(1)}%` }
    ]
  });
  
  // Топ маркетинговые каналы
  const topChannels = portrait.marketingChannels.slice(0, 5);
  insights.push({
    category: 'Маркетинговая эффективность',
    metrics: topChannels.map(channel => ({
      name: channel.channel.replace('Маркетинг KZ - ', ''),
      value: `${channel.count} клиентов (${channel.percentage.toFixed(1)}%)`,
      conversion: `${channel.conversionRate.toFixed(1)}% конверсия`
    }))
  });
  
  // Рекомендации
  const recommendations = [];
  
  if (portrait.onboardingStats.conversionRate < 50) {
    recommendations.push('Улучшить процесс онбординга - низкая конверсия');
  }
  
  if (portrait.retentionAnalysis.churnRate > 30) {
    recommendations.push('Разработать программу удержания клиентов');
  }
  
  const topChannel = portrait.marketingChannels[0];
  if (topChannel && topChannel.percentage > 40) {
    recommendations.push('Диверсифицировать маркетинговые каналы');
  }
  
  insights.push({
    category: 'Рекомендации',
    metrics: recommendations.map(rec => ({ name: rec, value: '' }))
  });
  
  return insights;
};