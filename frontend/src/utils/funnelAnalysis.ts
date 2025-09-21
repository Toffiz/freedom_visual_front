// Утилиты для анализа воронки онбординга
import type { ClientData } from '../types/analytics';

export interface OnboardingEvent {
  id: string;
  name: string;
  description: string;
  category: 'registration' | 'verification' | 'contract' | 'account_setup' | 'documents' | 'optional' | 'success' | 'system';
  isRequired: boolean;
  isSuccess: boolean;
  parentEvents?: string[];
  childEvents?: string[];
}

export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'main' | 'branch' | 'optional' | 'success' | 'exit';
  count: number;
  percentage: number;
  conversionRate?: number;
  dropoffRate?: number;
  children?: string[];
  x: number;
  y: number;
  color: string;
}

export interface FunnelConnection {
  from: string;
  to: string;
  count: number;
  percentage: number;
  type: 'main' | 'branch' | 'optional';
}

export interface OnboardingAnalysis {
  totalUsers: number;
  completedUsers: number;
  dropoffUsers: number;
  conversionRate: number;
  steps: FunnelStep[];
  connections: FunnelConnection[];
  bottlenecks: Array<{
    step: string;
    dropoffRate: number;
    impact: 'high' | 'medium' | 'low';
  }>;
}

// Определение событий онбординга на основе вашего описания
export const ONBOARDING_EVENTS: OnboardingEvent[] = [
  // Регистрация (стартовые точки)
  {
    id: 'initiated_account_registration',
    name: 'Initiated account registration',
    description: 'Начал регистрацию аккаунта',
    category: 'registration',
    isRequired: true,
    isSuccess: false,
    childEvents: ['identity_verification', 'user_session_established']
  },
  
  // Верификация
  {
    id: 'identity_verification',
    name: 'Identity verification completed',
    description: 'Завершена верификация личности',
    category: 'verification',
    isRequired: true,
    isSuccess: false,
    parentEvents: ['initiated_account_registration'],
    childEvents: ['account_contract_signed', 'referral_enrollment_finalized']
  },
  
  // Подписание контракта
  {
    id: 'account_contract_signed',
    name: 'Account contract signed',
    description: 'Подписан договор на аккаунт',
    category: 'contract',
    isRequired: true,
    isSuccess: false,
    parentEvents: ['identity_verification', 'user_session_established'],
    childEvents: [
      'account_registered_personal_name',
      'account_created_business_organization',
      'account_set_up_mobile_device',
      'chosen_pricing_plan'
    ]
  },
  
  // Настройка аккаунта (ветвления)
  {
    id: 'account_registered_personal_name',
    name: 'Account registered under a personal name',
    description: 'Аккаунт зарегистрирован на физическое лицо',
    category: 'account_setup',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['account_contract_signed'],
    childEvents: ['documents_uploaded_verified']
  },
  
  {
    id: 'account_created_business_organization',
    name: 'Account created for a business or organization',
    description: 'Аккаунт создан для бизнеса или организации',
    category: 'account_setup',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['account_contract_signed'],
    childEvents: ['documents_uploaded_verified']
  },
  
  {
    id: 'account_set_up_mobile_device',
    name: 'Account set up through a mobile device',
    description: 'Аккаунт настроен через мобильное устройство',
    category: 'account_setup',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['account_contract_signed'],
    childEvents: ['documents_uploaded_verified']
  },
  
  // Опциональные шаги
  {
    id: 'referral_enrollment_finalized',
    name: 'Referral enrollment finalized',
    description: 'Завершена реферальная регистрация',
    category: 'optional',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['identity_verification'],
    childEvents: ['documents_uploaded_verified']
  },
  
  {
    id: 'chosen_pricing_plan',
    name: 'Chosen a pricing plan',
    description: 'Выбран тарифный план',
    category: 'optional',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['account_contract_signed'],
    childEvents: ['ipo_participation_option_selected', 'documents_uploaded_verified']
  },
  
  {
    id: 'ipo_participation_option_selected',
    name: 'IPO participation option selected',
    description: 'Выбрана опция участия в IPO',
    category: 'optional',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['chosen_pricing_plan'],
    childEvents: ['account_successfully_created']
  },
  
  // Документы
  {
    id: 'documents_uploaded_verified',
    name: 'Documents uploaded and verified',
    description: 'Документы загружены и проверены',
    category: 'documents',
    isRequired: true,
    isSuccess: false,
    parentEvents: [
      'account_registered_personal_name',
      'account_created_business_organization',
      'account_set_up_mobile_device',
      'referral_enrollment_finalized',
      'chosen_pricing_plan'
    ],
    childEvents: ['account_successfully_created', 'account_opened_successfully']
  },
  
  // Успешные завершения
  {
    id: 'account_successfully_created',
    name: 'Account successfully created',
    description: 'Аккаунт успешно создан',
    category: 'success',
    isRequired: false,
    isSuccess: true,
    parentEvents: ['documents_uploaded_verified', 'ipo_participation_option_selected']
  },
  
  {
    id: 'account_opened_successfully',
    name: 'Account opened successfully',
    description: 'Аккаунт успешно открыт',
    category: 'success',
    isRequired: false,
    isSuccess: true,
    parentEvents: ['documents_uploaded_verified']
  },
  
  // Системные события
  {
    id: 'user_session_established',
    name: 'User session established',
    description: 'Пользовательская сессия установлена',
    category: 'system',
    isRequired: false,
    isSuccess: false,
    parentEvents: ['initiated_account_registration'],
    childEvents: ['account_contract_signed']
  },
  
  {
    id: 'change_in_management',
    name: 'Change in management',
    description: 'Изменения в управлении',
    category: 'system',
    isRequired: false,
    isSuccess: false
  }
];

// Функция для анализа данных воронки онбординга
export const analyzeOnboardingFunnel = (data: ClientData[]): OnboardingAnalysis => {
  // Подсчитываем количество клиентов на каждом этапе
  const eventCounts = new Map<string, number>();
  
  // Инициализируем счетчики
  ONBOARDING_EVENTS.forEach(event => {
    eventCounts.set(event.id, 0);
  });
  
  // Анализируем данные клиентов
  let totalUsers = 0;
  let completedUsers = 0;
  
  data.forEach(client => {
    // Здесь должна быть логика анализа событий клиента
    // Поскольку в CSV нет прямых событий, создадим симуляцию на основе данных
    totalUsers++;
    
    // Симулируем прохождение воронки на основе реальных данных
    if (client.reg_date) {
      eventCounts.set('initiated_account_registration', 
        (eventCounts.get('initiated_account_registration') || 0) + 1);
      
      // Если есть активность, значит прошел верификацию
      if (client.avg_activity && client.avg_activity > 0) {
        eventCounts.set('identity_verification', 
          (eventCounts.get('identity_verification') || 0) + 1);
        
        // Если есть депозиты, значит подписал контракт
        if (client.total_deposit && client.total_deposit > 0) {
          eventCounts.set('account_contract_signed', 
            (eventCounts.get('account_contract_signed') || 0) + 1);
          
          // Определяем тип аккаунта на основе данных
          const accountType = client.city ? 'personal' : 'business';
          if (accountType === 'personal') {
            eventCounts.set('account_registered_personal_name', 
              (eventCounts.get('account_registered_personal_name') || 0) + 1);
          } else {
            eventCounts.set('account_created_business_organization', 
              (eventCounts.get('account_created_business_organization') || 0) + 1);
          }
          
          // Если активность высокая, значит загрузил документы
          if (client.avg_activity > 2) {
            eventCounts.set('documents_uploaded_verified', 
              (eventCounts.get('documents_uploaded_verified') || 0) + 1);
            
            // Если есть статус успешности (определяем по высокой активности)
            if (client.avg_activity > 3) {
              eventCounts.set('account_successfully_created', 
                (eventCounts.get('account_successfully_created') || 0) + 1);
              completedUsers++;
            }
          }
        }
      }
    }
  });
  
  // Создаем шаги воронки
  const steps: FunnelStep[] = [
    {
      id: 'initiated_account_registration',
      name: 'Начало регистрации',
      description: 'Initiated account registration',
      type: 'start',
      count: eventCounts.get('initiated_account_registration') || 0,
      percentage: 100,
      x: 50,
      y: 50,
      color: '#3B82F6'
    },
    {
      id: 'identity_verification',
      name: 'Верификация',
      description: 'Identity verification completed',
      type: 'main',
      count: eventCounts.get('identity_verification') || 0,
      percentage: 0,
      x: 30,
      y: 150,
      color: '#10B981'
    },
    {
      id: 'account_contract_signed',
      name: 'Подписание контракта',
      description: 'Account contract signed',
      type: 'main',
      count: eventCounts.get('account_contract_signed') || 0,
      percentage: 0,
      x: 30,
      y: 250,
      color: '#10B981'
    },
    {
      id: 'account_registered_personal_name',
      name: 'Личный аккаунт',
      description: 'Personal account setup',
      type: 'branch',
      count: eventCounts.get('account_registered_personal_name') || 0,
      percentage: 0,
      x: 10,
      y: 350,
      color: '#F59E0B'
    },
    {
      id: 'account_created_business_organization',
      name: 'Бизнес аккаунт',
      description: 'Business account setup',
      type: 'branch',
      count: eventCounts.get('account_created_business_organization') || 0,
      percentage: 0,
      x: 50,
      y: 350,
      color: '#F59E0B'
    },
    {
      id: 'documents_uploaded_verified',
      name: 'Загрузка документов',
      description: 'Documents uploaded and verified',
      type: 'main',
      count: eventCounts.get('documents_uploaded_verified') || 0,
      percentage: 0,
      x: 30,
      y: 450,
      color: '#10B981'
    },
    {
      id: 'account_successfully_created',
      name: 'Успешное создание',
      description: 'Account successfully created',
      type: 'success',
      count: eventCounts.get('account_successfully_created') || 0,
      percentage: 0,
      x: 30,
      y: 550,
      color: '#059669'
    }
  ];
  
  // Вычисляем проценты и конверсии
  const totalStart = steps[0].count;
  steps.forEach(step => {
    if (totalStart > 0) {
      step.percentage = (step.count / totalStart) * 100;
    }
  });
  
  // Вычисляем конверсии между шагами
  for (let i = 1; i < steps.length; i++) {
    const prevStep = steps[i - 1];
    const currentStep = steps[i];
    if (prevStep.count > 0) {
      currentStep.conversionRate = (currentStep.count / prevStep.count) * 100;
      currentStep.dropoffRate = 100 - (currentStep.conversionRate || 0);
    }
  }
  
  // Создаем связи
  const connections: FunnelConnection[] = [
    {
      from: 'initiated_account_registration',
      to: 'identity_verification',
      count: eventCounts.get('identity_verification') || 0,
      percentage: 0,
      type: 'main'
    },
    {
      from: 'identity_verification',
      to: 'account_contract_signed',
      count: eventCounts.get('account_contract_signed') || 0,
      percentage: 0,
      type: 'main'
    },
    {
      from: 'account_contract_signed',
      to: 'account_registered_personal_name',
      count: eventCounts.get('account_registered_personal_name') || 0,
      percentage: 0,
      type: 'branch'
    },
    {
      from: 'account_contract_signed',
      to: 'account_created_business_organization',
      count: eventCounts.get('account_created_business_organization') || 0,
      percentage: 0,
      type: 'branch'
    },
    {
      from: 'account_registered_personal_name',
      to: 'documents_uploaded_verified',
      count: eventCounts.get('documents_uploaded_verified') || 0,
      percentage: 0,
      type: 'main'
    },
    {
      from: 'account_created_business_organization',
      to: 'documents_uploaded_verified',
      count: eventCounts.get('documents_uploaded_verified') || 0,
      percentage: 0,
      type: 'main'
    },
    {
      from: 'documents_uploaded_verified',
      to: 'account_successfully_created',
      count: eventCounts.get('account_successfully_created') || 0,
      percentage: 0,
      type: 'main'
    }
  ];
  
  // Вычисляем проценты для связей
  connections.forEach(connection => {
    if (totalStart > 0) {
      connection.percentage = (connection.count / totalStart) * 100;
    }
  });
  
  // Определяем узкие места
  const bottlenecks = steps
    .filter(step => step.dropoffRate && step.dropoffRate > 20)
    .map(step => ({
      step: step.id,
      dropoffRate: step.dropoffRate || 0,
      impact: step.dropoffRate! > 40 ? 'high' as const : 
              step.dropoffRate! > 30 ? 'medium' as const : 'low' as const
    }))
    .sort((a, b) => b.dropoffRate - a.dropoffRate);
  
  return {
    totalUsers,
    completedUsers,
    dropoffUsers: totalUsers - completedUsers,
    conversionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
    steps,
    connections,
    bottlenecks
  };
};

// Функция для получения мок-данных воронки
export const getMockFunnelData = (): OnboardingAnalysis => {
  return {
    totalUsers: 1000,
    completedUsers: 620,
    dropoffUsers: 380,
    conversionRate: 62,
    steps: [
      {
        id: 'initiated_account_registration',
        name: 'Начало регистрации',
        description: 'Initiated account registration',
        type: 'start',
        count: 1000,
        percentage: 100,
        x: 50,
        y: 50,
        color: '#3B82F6'
      },
      {
        id: 'identity_verification',
        name: 'Верификация',
        description: 'Identity verification completed',
        type: 'main',
        count: 850,
        percentage: 85,
        conversionRate: 85,
        x: 30,
        y: 150,
        color: '#10B981'
      },
      {
        id: 'account_contract_signed',
        name: 'Подписание контракта',
        description: 'Account contract signed',
        type: 'main',
        count: 720,
        percentage: 72,
        conversionRate: 84.7,
        x: 30,
        y: 250,
        color: '#10B981'
      },
      {
        id: 'account_registered_personal_name',
        name: 'Личный аккаунт',
        description: 'Personal account setup',
        type: 'branch',
        count: 400,
        percentage: 40,
        conversionRate: 55.6,
        x: 10,
        y: 350,
        color: '#F59E0B'
      },
      {
        id: 'account_created_business_organization',
        name: 'Бизнес аккаунт',
        description: 'Business account setup',
        type: 'branch',
        count: 320,
        percentage: 32,
        conversionRate: 44.4,
        x: 50,
        y: 350,
        color: '#F59E0B'
      },
      {
        id: 'documents_uploaded_verified',
        name: 'Загрузка документов',
        description: 'Documents uploaded and verified',
        type: 'main',
        count: 660,
        percentage: 66,
        conversionRate: 91.7,
        x: 30,
        y: 450,
        color: '#10B981'
      },
      {
        id: 'account_successfully_created',
        name: 'Успешное создание',
        description: 'Account successfully created',
        type: 'success',
        count: 620,
        percentage: 62,
        conversionRate: 93.9,
        x: 30,
        y: 550,
        color: '#059669'
      }
    ],
    connections: [
      {
        from: 'initiated_account_registration',
        to: 'identity_verification',
        count: 850,
        percentage: 85,
        type: 'main'
      },
      {
        from: 'identity_verification',
        to: 'account_contract_signed',
        count: 720,
        percentage: 72,
        type: 'main'
      },
      {
        from: 'account_contract_signed',
        to: 'account_registered_personal_name',
        count: 400,
        percentage: 40,
        type: 'branch'
      },
      {
        from: 'account_contract_signed',
        to: 'account_created_business_organization',
        count: 320,
        percentage: 32,
        type: 'branch'
      },
      {
        from: 'account_registered_personal_name',
        to: 'documents_uploaded_verified',
        count: 370,
        percentage: 37,
        type: 'main'
      },
      {
        from: 'account_created_business_organization',
        to: 'documents_uploaded_verified',
        count: 290,
        percentage: 29,
        type: 'main'
      },
      {
        from: 'documents_uploaded_verified',
        to: 'account_successfully_created',
        count: 620,
        percentage: 62,
        type: 'main'
      }
    ],
    bottlenecks: [
      {
        step: 'identity_verification',
        dropoffRate: 15,
        impact: 'medium'
      },
      {
        step: 'account_contract_signed',
        dropoffRate: 15.3,
        impact: 'medium'
      }
    ]
  };
};