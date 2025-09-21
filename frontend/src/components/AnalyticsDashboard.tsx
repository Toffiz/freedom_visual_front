import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Target } from 'lucide-react';
import BusinessInsights from './BusinessInsights';
import type { ClientPortrait } from '../types/analytics';

interface AnalyticsDashboardProps {
  data: ClientPortrait;
  loading?: boolean;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}> = ({ title, value, icon, trend, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== undefined && (
          <div className={`flex items-center mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="ml-1 text-sm font-medium">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.dataKey}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const genderData = data.demographics.gender.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const ageData = data.demographics.age.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const marketingChannelsData = data.marketingChannels.map((channel, index) => ({
    name: channel.channel.replace('Маркетинг KZ - ', '').replace('Маркетинг KZ', 'KZ'),
    clients: channel.count,
    conversion: channel.conversionRate,
    ltv: channel.avgLTV,
    color: COLORS[index % COLORS.length]
  }));

  const activityData = data.activityLevels.map((level) => ({
    name: level.level,
    count: level.count,
    range: level.range,
    fill: level.color
  }));

  const depositDistribution = data.depositAnalysis.depositDistribution;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего клиентов"
          value={data.totalClients}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Общие депозиты"
          value={`$${(data.depositAnalysis.totalDeposits / 1000000).toFixed(1)}M`}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Активные клиенты"
          value={data.retentionAnalysis.activeClients}
          icon={<Activity className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Конверсия онбординга"
          value={`${data.onboardingStats.conversionRate.toFixed(1)}%`}
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Распределение по полу
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Age Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Возрастные группы
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Marketing Channels Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg lg:col-span-2"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Эффективность маркетинговых каналов
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={marketingChannelsData.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6B7280', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis yAxisId="left" tick={{ fill: '#6B7280' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="clients" fill="#3B82F6" name="Клиенты" />
              <Bar yAxisId="right" dataKey="conversion" fill="#10B981" name="Конверсия %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Уровни активности
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ name, count }) => `${name}: ${count}`}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, _, props) => [
                  `${value} клиентов`, 
                  `${props.payload.name} (${props.payload.range})`
                ]} 
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Deposit Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Анализ депозитов
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={depositDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Client Segments Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Сегментация клиентов
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.segments.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Сегментов</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${data.depositAnalysis.avgDepositPerClient.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Средний депозит</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.retentionAnalysis.avgInactiveDays.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Дней неактивности</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Сегмент
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Клиентов
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Доля
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Средний депозит
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Средняя активность
                </th>
              </tr>
            </thead>
            <tbody>
              {data.segments.slice(0, 10).map((segment, index) => (
                <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {segment.segment}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {segment.count.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {segment.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    ${segment.avgDeposit.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {segment.avgActivity.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Business Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <BusinessInsights data={data} />
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;