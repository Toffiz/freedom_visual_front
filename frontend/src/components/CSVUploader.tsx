import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import type { ClientData } from '../types/analytics';

interface CSVUploaderProps {
  onDataLoaded: (data: ClientData[]) => void;
  onClose: () => void;
}

interface ParseResult {
  success: boolean;
  data?: ClientData[];
  error?: string;
  rowCount?: number;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoaded, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setParseResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const validatedData = validateData(results.data);
          setParseResult({
            success: true,
            data: validatedData,
            rowCount: validatedData.length
          });
        } catch (error) {
          setParseResult({
            success: false,
            error: error instanceof Error ? error.message : 'Неизвестная ошибка'
          });
        } finally {
          setUploading(false);
        }
      },
      error: (error) => {
        setParseResult({
          success: false,
          error: `Ошибка парсинга CSV: ${error.message}`
        });
        setUploading(false);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const handleLoadData = () => {
    if (parseResult?.success && parseResult.data) {
      onDataLoaded(parseResult.data);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Загрузка данных клиентов
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {!parseResult && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} />
          <motion.div
            animate={uploading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: uploading ? Infinity : 0 }}
          >
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          
          {uploading ? (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Обработка файла...
            </p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Перетащите CSV файл сюда или нажмите для выбора
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Поддерживаются только CSV файлы с данными клиентов
              </p>
            </>
          )}
        </div>
      )}

      {parseResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {parseResult.success ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  Файл успешно загружен!
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                Обработано записей: <span className="font-bold">{parseResult.rowCount?.toLocaleString()}</span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleLoadData}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Анализировать данные</span>
                </button>
                <button
                  onClick={() => setParseResult(null)}
                  className="btn-secondary"
                >
                  Загрузить другой файл
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Ошибка обработки файла
                </h3>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {parseResult.error}
              </p>
              <button
                onClick={() => setParseResult(null)}
                className="btn-secondary"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default CSVUploader;