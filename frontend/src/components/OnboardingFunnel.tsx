import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  TrendingDown,
  Target,
  GitBranch,
  Activity
} from 'lucide-react';

interface FunnelStep {
  id: string;
  name: string;
  description: string;
  type: 'start' | 'main' | 'branch' | 'optional' | 'success' | 'exit';
  count: number;
  percentage: number;
  conversionRate?: number;
  children?: string[];
  x: number;
  y: number;
  color: string;
}

interface FunnelConnection {
  from: string;
  to: string;
  count: number;
  percentage: number;
  type: 'main' | 'branch' | 'optional';
}

interface OnboardingFunnelProps {
  data?: any;
}

const OnboardingFunnel: React.FC<OnboardingFunnelProps> = ({ data }) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Mock данные воронки онбординга на основе вашего описания
  const funnelSteps: FunnelStep[] = [
    // Стартовые точки
    {
      id: 'init_registration',
      name: 'Initiated account registration',
      description: 'Начал регистрацию аккаунта',
      type: 'start',
      count: 1000,
      percentage: 100,
      x: 50,
      y: 50,
      color: '#3B82F6',
      children: ['verification', 'session_established']
    },
    
    // Основной путь
    {
      id: 'verification',
      name: 'Identity verification',
      description: 'Верификация личности',
      type: 'main',
      count: 850,
      percentage: 85,
      conversionRate: 85,
      x: 30,
      y: 150,
      color: '#10B981',
      children: ['contract_signed']
    },
    
    {
      id: 'contract_signed',
      name: 'Account contract signed',
      description: 'Подписан договор на аккаунт',
      type: 'main',
      count: 720,
      percentage: 72,
      conversionRate: 84.7,
      x: 30,
      y: 250,
      color: '#10B981',
      children: ['personal_account', 'business_account', 'mobile_setup']
    },
    
    // Ветвления после контракта
    {
      id: 'personal_account',
      name: 'Account registered under a personal name',
      description: 'Персональный аккаунт',
      type: 'branch',
      count: 400,
      percentage: 40,
      conversionRate: 55.6,
      x: 10,
      y: 350,
      color: '#F59E0B',
      children: ['document_upload']
    },
    
    {
      id: 'business_account',
      name: 'Account created for a business or organization',
      description: 'Бизнес аккаунт',
      type: 'branch',
      count: 250,
      percentage: 25,
      conversionRate: 34.7,
      x: 30,
      y: 350,
      color: '#F59E0B',
      children: ['document_upload']
    },
    
    {
      id: 'mobile_setup',
      name: 'Account set up through a mobile device',
      description: 'Мобильная регистрация',
      type: 'branch',
      count: 200,
      percentage: 20,
      conversionRate: 27.8,
      x: 50,
      y: 350,
      color: '#F59E0B',
      children: ['document_upload']
    },
    
    // Опциональные шаги
    {
      id: 'referral',
      name: 'Referral enrollment finalized',
      description: 'Реферальная программа',
      type: 'optional',
      count: 150,
      percentage: 15,
      conversionRate: 20.8,
      x: 70,
      y: 200,
      color: '#8B5CF6',
      children: ['document_upload']
    },
    
    {
      id: 'pricing_plan',
      name: 'Chosen a pricing plan',
      description: 'Выбран тарифный план',
      type: 'optional',
      count: 180,
      percentage: 18,
      conversionRate: 25,
      x: 70,
      y: 300,
      color: '#8B5CF6',
      children: ['document_upload']
    },
    
    {
      id: 'ipo_participation',
      name: 'IPO participation option selected',
      description: 'Участие в IPO',
      type: 'optional',
      count: 90,
      percentage: 9,
      conversionRate: 12.5,
      x: 70,
      y: 400,
      color: '#8B5CF6',
      children: ['success_created']
    },
    
    // Загрузка документов
    {
      id: 'document_upload',
      name: 'Documents uploaded and verified',
      description: 'Документы загружены и проверены',
      type: 'main',
      count: 620,
      percentage: 62,
      conversionRate: 86.1,
      x: 30,
      y: 450,
      color: '#10B981',
      children: ['success_created', 'success_opened']
    },
    
    // Финальные состояния успеха
    {
      id: 'success_created',
      name: 'Account successfully created',
      description: 'Аккаунт успешно создан',
      type: 'success',
      count: 480,
      percentage: 48,
      conversionRate: 77.4,
      x: 20,
      y: 550,
      color: '#059669'
    },
    
    {
      id: 'success_opened',
      name: 'Account opened successfully',
      description: 'Аккаунт успешно открыт',
      type: 'success',
      count: 140,
      percentage: 14,
      conversionRate: 22.6,
      x: 40,
      y: 550,
      color: '#059669'
    },
    
    // Системные события
    {
      id: 'session_established',
      name: 'User session established',
      description: 'Сессия пользователя установлена',
      type: 'main',
      count: 120,
      percentage: 12,
      conversionRate: 14.1,
      x: 70,
      y: 150,
      color: '#6B7280',
      children: ['contract_signed']
    }
  ];

  // Связи между шагами
  const connections: FunnelConnection[] = [
    { from: 'init_registration', to: 'verification', count: 850, percentage: 85, type: 'main' },
    { from: 'init_registration', to: 'session_established', count: 120, percentage: 12, type: 'branch' },
    { from: 'verification', to: 'contract_signed', count: 720, percentage: 72, type: 'main' },
    { from: 'session_established', to: 'contract_signed', count: 80, percentage: 8, type: 'branch' },
    { from: 'contract_signed', to: 'personal_account', count: 400, percentage: 40, type: 'branch' },
    { from: 'contract_signed', to: 'business_account', count: 250, percentage: 25, type: 'branch' },
    { from: 'contract_signed', to: 'mobile_setup', count: 200, percentage: 20, type: 'branch' },
    { from: 'verification', to: 'referral', count: 150, percentage: 15, type: 'optional' },
    { from: 'contract_signed', to: 'pricing_plan', count: 180, percentage: 18, type: 'optional' },
    { from: 'pricing_plan', to: 'ipo_participation', count: 90, percentage: 9, type: 'optional' },
    { from: 'personal_account', to: 'document_upload', count: 350, percentage: 35, type: 'main' },
    { from: 'business_account', to: 'document_upload', count: 220, percentage: 22, type: 'main' },
    { from: 'mobile_setup', to: 'document_upload', count: 180, percentage: 18, type: 'main' },
    { from: 'referral', to: 'document_upload', count: 120, percentage: 12, type: 'optional' },
    { from: 'document_upload', to: 'success_created', count: 480, percentage: 48, type: 'main' },
    { from: 'document_upload', to: 'success_opened', count: 140, percentage: 14, type: 'main' },
    { from: 'ipo_participation', to: 'success_created', count: 60, percentage: 6, type: 'optional' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'start': return <Users className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'branch': return <GitBranch className="h-4 w-4" />;
      case 'optional': return <Target className="h-4 w-4" />;
      case 'exit': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getConnectionPath = (from: FunnelStep, to: FunnelStep) => {
    const startX = from.x;
    const startY = from.y + 40;
    const endX = to.x;
    const endY = to.y;
    
    const midY = (startY + endY) / 2;
    
    return `M ${startX} ${startY} Q ${startX} ${midY} ${endX} ${endY}`;
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'main': return '#10B981';
      case 'branch': return '#F59E0B';
      case 'optional': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getConnectionWidth = (percentage: number) => {
    return Math.max(1, Math.min(8, percentage / 5));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="h-6 w-6 text-blue-500" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Воронка онбординга клиентов
        </h3>
      </div>

      {/* Легенда */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Старт</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Основной путь</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Ветвления</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">Опциональные</span>
        </div>
      </div>

      {/* SVG Воронка */}
      <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-hidden">
        <svg 
          viewBox="0 0 100 600" 
          className="w-full h-96 md:h-[500px]"
          style={{ minHeight: '400px' }}
        >
          {/* Рендерим соединения */}
          {connections.map((connection, index) => {
            const fromStep = funnelSteps.find(step => step.id === connection.from);
            const toStep = funnelSteps.find(step => step.id === connection.to);
            
            if (!fromStep || !toStep) return null;
            
            return (
              <motion.path
                key={`connection-${index}`}
                d={getConnectionPath(fromStep, toStep)}
                stroke={getConnectionColor(connection.type)}
                strokeWidth={getConnectionWidth(connection.percentage)}
                fill="none"
                opacity={0.6}
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: animationPhase === 1 ? 1 : 0,
                  opacity: animationPhase === 1 ? 0.8 : 0.4
                }}
                transition={{ duration: 2, delay: index * 0.1 }}
              />
            );
          })}

          {/* Рендерим шаги */}
          {funnelSteps.map((step, index) => (
            <g key={step.id}>
              {/* Нода шага */}
              <motion.circle
                cx={step.x}
                cy={step.y}
                r="8"
                fill={step.color}
                stroke="#fff"
                strokeWidth="2"
                className="cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: selectedStep === step.id ? 1.5 : 1,
                  opacity: 1 
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                whileHover={{ scale: 1.2 }}
              />
              
              {/* Подпись */}
              <motion.text
                x={step.x}
                y={step.y - 15}
                textAnchor="middle"
                className="fill-gray-700 dark:fill-gray-300 text-xs font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              >
                {step.count}
              </motion.text>
            </g>
          ))}
        </svg>

        {/* Анимированные частицы */}
        <AnimatePresence>
          {animationPhase === 2 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 + '%',
                    y: '0%',
                    opacity: 0.8 
                  }}
                  animate={{ 
                    y: '100%',
                    opacity: 0 
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    ease: 'linear'
                  }}
                  exit={{ opacity: 0 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Детали выбранного шага */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
          >
            {(() => {
              const step = funnelSteps.find(s => s.id === selectedStep);
              if (!step) return null;
              
              return (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="p-2 rounded-full text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {getStepIcon(step.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {step.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step.count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Пользователей
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step.percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        От общего числа
                      </div>
                    </div>
                    {step.conversionRate && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {step.conversionRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Конверсия
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Общая статистика */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-800 dark:text-green-300">
              Успешные завершения
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            620 (62%)
          </div>
          <div className="text-sm text-green-700 dark:text-green-400">
            Из {funnelSteps[0]?.count.toLocaleString()} стартов
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-800 dark:text-red-300">
              Оттоки
            </span>
          </div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            380 (38%)
          </div>
          <div className="text-sm text-red-700 dark:text-red-400">
            Потерянные пользователи
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-blue-800 dark:text-blue-300">
              Основной путь
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            720 (72%)
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-400">
            Прошли до подписания
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFunnel;