import Papa from 'papaparse';
import type { ClientData } from '../types/analytics';

// Function to validate and transform CSV data
const validateData = (data: any[]): ClientData[] => {
  const requiredFields = [
    'original_client_user_id',
    'total_deposit',
    'avg_activity',
    'sex_type_Ж',
    'sex_type_М',
    'age_segment_18-24 лет'
  ];

  if (!data || data.length === 0) {
    throw new Error('Файл пустой или не содержит данных');
  }

  const firstRow = data[0];
  const missingFields = requiredFields.filter(field => !(field in firstRow));
  
  if (missingFields.length > 0) {
    throw new Error(`Отсутствуют обязательные поля: ${missingFields.join(', ')}`);
  }

  return data.map((row, index) => {
    try {
      return {
        ...row,
        original_client_user_id: parseInt(row.original_client_user_id) || 0,
        n_cards: parseInt(row.n_cards) || 0,
        total_deposit: parseFloat(row.total_deposit) || 0,
        withdrawals_total: parseFloat(row.withdrawals_total) || 0,
        ever_withdrawal: parseInt(row.ever_withdrawal) || 0,
        avg_activity: parseFloat(row.avg_activity) || 0,
        avg_ottok_log: parseFloat(row.avg_ottok_log) || 0,
        avg_ottok: parseFloat(row.avg_ottok) || 0,
        avg_velocity: parseFloat(row.avg_velocity) || 0,
        avg_inactive_days: parseFloat(row.avg_inactive_days) || 0,
        client_onboarded_any: row.client_onboarded_any === 'True' || row.client_onboarded_any === true,
        id: parseInt(row.id) || 0,
      } as ClientData;
    } catch (error) {
      throw new Error(`Ошибка в строке ${index + 1}: ${error}`);
    }
  });
};

// Function to load CSV data from public folder
export const loadCSVData = (): Promise<ClientData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse('/super.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const validatedData = validateData(results.data);
          resolve(validatedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Ошибка загрузки CSV: ${error.message}`));
      }
    });
  });
};