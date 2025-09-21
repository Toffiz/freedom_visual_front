export interface ClientData {
  original_client_user_id: number;
  n_cards: number;
  total_deposit: number;
  withdrawals_total: number;
  ever_withdrawal: number;
  avg_activity: number;
  avg_ottok_log: number;
  avg_ottok: number;
  avg_velocity: number;
  avg_inactive_days: number;
  cards_started_onboarding: number;
  any_started_onboarding: number;
  cards_completed_onboarding: number;
  any_completed_onboarding: number;
  client_onboarded_any: boolean;
  first_event_date_min: string;
  last_event_date_max: string;
  first_segment_sum: number;
  first_segment_mean: number;
  first_segment_mode: number;
  last_segment_sum: number;
  last_segment_mean: number;
  last_segment_mode: number;
  avg_days_between_changes_mean: number;
  avg_days_between: number;
  activity_top: number;
  inactive_days_top: number;
  onboarding_sign_top: number;
  off_stage_top: string;
  first_segment_top: number;
  last_segment_top: number;
  avg_days_between_changes_top: number;
  velocity_top: number;
  first_event_date_top: string;
  last_event_date_top: string;
  id: number;
  
  // Gender types
  'sex_type_Ж': number;
  'sex_type_М': number;
  'sex_type_Не указано клиентом': number;
  
  // Age segments
  'age_segment_18-24 лет': number;
  'age_segment_25-34 лет': number;
  'age_segment_35-44 лет': number;
  'age_segment_45-54 лет': number;
  'age_segment_55 лет +': number;
  'age_segment_<18 лет': number;
  'age_segment_Не указано клиентом': number;
  
  // Marketing channels
  'Маркетинг KZ - Блоггеры - daulet': number;
  'Маркетинг KZ - Блоггеры - gulmira_qarasai': number;
  'Маркетинг KZ - Лендинг - ffinkz': number;
  'Маркетинг KZ - Лендинг - global': number;
  'Маркетинг KZ - Лендинг - Лендинг не определен': number;
  'Маркетинг KZ - Не определен Маркетингом - Не определен Маркетингом': number;
  'Маркетинг KZ - Рекламные Кабинеты - Apple Search': number;
  'Маркетинг KZ - Рекламные Кабинеты - Google': number;
  'Маркетинг KZ - Рекламные Кабинеты - TikTok': number;
  'Маркетинг KZ - Реферальные - tradernet.global': number;
  'Маркетинг KZ - Реферальные - Реферрер не определен': number;
  'Органика': number;
  'Рефералка Sales': number;
  'Банк': number;
  'Белиз': number;
}

export interface ClientSegment {
  segment: string;
  count: number;
  percentage: number;
  avgDeposit: number;
  avgActivity: number;
}

export interface MarketingChannel {
  channel: string;
  count: number;
  percentage: number;
  conversionRate: number;
  avgLTV: number;
}

export interface ActivityLevel {
  level: string;
  count: number;
  range: string;
  color: string;
}

export interface OnboardingStats {
  started: number;
  completed: number;
  conversionRate: number;
  avgTimeToComplete: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
  [key: string]: any;
}

export interface ClientPortrait {
  totalClients: number;
  segments: ClientSegment[];
  marketingChannels: MarketingChannel[];
  activityLevels: ActivityLevel[];
  onboardingStats: OnboardingStats;
  demographics: {
    gender: ChartDataPoint[];
    age: ChartDataPoint[];
  };
  depositAnalysis: {
    totalDeposits: number;
    avgDepositPerClient: number;
    depositDistribution: ChartDataPoint[];
  };
  retentionAnalysis: {
    activeClients: number;
    churnRate: number;
    avgInactiveDays: number;
    retentionBySegment: ChartDataPoint[];
  };
}