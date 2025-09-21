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

  const genderData = data.demographics.gender.map((item) => ({
    ...item,
    color: item.name.includes('Мужчин') || item.name.includes('М') ? '#3B82F6' : 
           item.name.includes('Женщин') || item.name.includes('Ж') ? '#EC4899' : '#6B7280'
  }));

  const ageData = data.demographics.age.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  const activityData = data.activityLevels.map(level => ({
    name: level.level,
    count: level.count,
    range: level.range,
    fill: level.color // Используем цвета из аналитики
  }));

  const depositDistribution = data.depositAnalysis.depositDistribution;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Всего клиентов"
          value={data.totalClients}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Активных клиентов"
          value={data.retentionAnalysis.activeClients}
          icon={<Activity className="h-6 w-6 text-white" />}
          trend={85}
          color="bg-green-500"
        />
        <StatCard
          title="Общее количество депозитов"
          value={data.depositAnalysis.totalDeposits}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
        <StatCard
          title="Риск оттока"
          value={`${data.retentionAnalysis.churnRate.toFixed(1)}%`}
          icon={<Target className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                label={({ name, value, percentage }) => `${name}: ${value} (${percentage}%)`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} клиентов`]} />
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
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Marketing Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Эффективность маркетинговых каналов
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.marketingChannels.slice(0, 10)} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tick={{ fill: '#6B7280' }} />
            <YAxis 
              type="category" 
              dataKey="channel" 
              tick={{ fill: '#6B7280', fontSize: 11 }}
              width={200}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'count' ? `${value} клиентов` : 
                name === 'conversionRate' ? `${value}% конверсия` :
                name === 'avgLTV' ? `${value} LTV` : value
              ]}
            />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" name="Количество клиентов" />
            <Bar dataKey="conversionRate" fill="#10B981" name="Конверсия %" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Activity and Churn Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Уровни активности клиентов
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

        {/* Churn Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Риск оттока клиентов
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.retentionAnalysis.churnRiskDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.retentionAnalysis.churnRiskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} клиентов`]} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Deposit Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Анализ количества депозитов
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={depositDistribution}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
            <YAxis tick={{ fill: '#6B7280' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {depositDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Wealth Segments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Сегменты по размеру портфеля (богатство)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.wealthSegments}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="segment" 
              tick={{ fill: '#6B7280', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fill: '#6B7280' }} />
            <Tooltip 
              formatter={(value, name) => [
                name === 'count' ? `${value} клиентов` : 
                name === 'avgDeposit' ? `Средний сегмент: ${typeof value === 'number' ? value.toFixed(1) : value}` : value
              ]}
            />
            <Legend />
            <Bar dataKey="count" fill="#8B5CF6" name="Количество клиентов" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Business Insights */}
      <BusinessInsights data={data} />
    </div>
  );
};

export default AnalyticsDashboard;