import { ExcelColumn } from '@shared/excel-types';

export interface ColumnStats {
  column: string;
  type: string;
  count: number;
  nullCount: number;
  uniqueCount: number;
  // For numeric columns
  sum?: number;
  mean?: number;
  median?: number;
  mode?: any;
  min?: number;
  max?: number;
  stdDev?: number;
  variance?: number;
  // For text columns
  avgLength?: number;
  maxLength?: number;
  minLength?: number;
  // For date columns
  minDate?: Date;
  maxDate?: Date;
  dateRange?: number; // days
  // Top values
  topValues: Array<{ value: any; count: number; percentage: number }>;
}

export interface DatasetStats {
  totalRows: number;
  totalColumns: number;
  completenessScore: number; // Percentage of non-null values
  duplicateRows: number;
  columnStats: ColumnStats[];
}

export const calculateColumnStats = (
  data: Record<string, any>[],
  column: ExcelColumn
): ColumnStats => {
  const values = data.map(row => row[column.key]).filter(val => val !== null && val !== undefined && val !== '');
  const allValues = data.map(row => row[column.key]);
  
  const count = values.length;
  const nullCount = allValues.length - count;
  const uniqueValues = [...new Set(values)];
  const uniqueCount = uniqueValues.length;

  // Calculate frequency distribution
  const frequency: Record<string, number> = {};
  values.forEach(val => {
    const key = String(val);
    frequency[key] = (frequency[key] || 0) + 1;
  });

  const topValues = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([value, count]) => ({
      value: isNaN(Number(value)) ? value : Number(value),
      count,
      percentage: Math.round((count / values.length) * 100 * 10) / 10
    }));

  const stats: ColumnStats = {
    column: column.key,
    type: column.type,
    count,
    nullCount,
    uniqueCount,
    topValues
  };

  // Type-specific calculations
  if (column.type === 'number') {
    const numericValues = values
      .map(val => Number(val))
      .filter(val => !isNaN(val));
    
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      
      // Calculate median
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];

      // Calculate mode
      const mode = topValues[0]?.value;

      // Calculate standard deviation
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
      const stdDev = Math.sqrt(variance);

      stats.sum = Math.round(sum * 100) / 100;
      stats.mean = Math.round(mean * 100) / 100;
      stats.median = Math.round(median * 100) / 100;
      stats.mode = mode;
      stats.min = Math.min(...numericValues);
      stats.max = Math.max(...numericValues);
      stats.stdDev = Math.round(stdDev * 100) / 100;
      stats.variance = Math.round(variance * 100) / 100;
    }
  }

  if (column.type === 'text') {
    const textValues = values.map(val => String(val));
    if (textValues.length > 0) {
      const lengths = textValues.map(val => val.length);
      stats.avgLength = Math.round(lengths.reduce((acc, len) => acc + len, 0) / lengths.length * 100) / 100;
      stats.maxLength = Math.max(...lengths);
      stats.minLength = Math.min(...lengths);
    }
  }

  if (column.type === 'date') {
    const dateValues = values
      .map(val => {
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? null : parsed;
      })
      .filter(date => date !== null) as Date[];
    
    if (dateValues.length > 0) {
      const sortedDates = [...dateValues].sort((a, b) => a.getTime() - b.getTime());
      stats.minDate = sortedDates[0];
      stats.maxDate = sortedDates[sortedDates.length - 1];
      stats.dateRange = Math.ceil((stats.maxDate.getTime() - stats.minDate.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  return stats;
};

export const calculateDatasetStats = (
  data: Record<string, any>[],
  columns: ExcelColumn[]
): DatasetStats => {
  const totalRows = data.length;
  const totalColumns = columns.length;
  
  // Calculate completeness
  let totalCells = 0;
  let filledCells = 0;
  
  data.forEach(row => {
    columns.forEach(col => {
      totalCells++;
      const value = row[col.key];
      if (value !== null && value !== undefined && value !== '') {
        filledCells++;
      }
    });
  });
  
  const completenessScore = totalCells > 0 ? Math.round((filledCells / totalCells) * 100 * 10) / 10 : 0;
  
  // Calculate duplicate rows
  const rowStrings = data.map(row => 
    columns.map(col => String(row[col.key] || '')).join('|')
  );
  const uniqueRowStrings = new Set(rowStrings);
  const duplicateRows = rowStrings.length - uniqueRowStrings.size;
  
  // Calculate column statistics
  const columnStats = columns.map(column => calculateColumnStats(data, column));
  
  return {
    totalRows,
    totalColumns,
    completenessScore,
    duplicateRows,
    columnStats
  };
};

export const formatStatValue = (value: any, type?: string): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (type === 'number') {
    return typeof value === 'number' ? value.toLocaleString('es-ES') : String(value);
  }
  
  if (type === 'percentage') {
    return `${value}%`;
  }
  
  if (type === 'date' && value instanceof Date) {
    return value.toLocaleDateString('es-ES');
  }
  
  return String(value);
};

export const generateColumnSummary = (stats: ColumnStats): string => {
  const summaryParts: string[] = [];
  
  summaryParts.push(`${stats.count} valores`);
  
  if (stats.nullCount > 0) {
    summaryParts.push(`${stats.nullCount} nulos`);
  }
  
  summaryParts.push(`${stats.uniqueCount} únicos`);
  
  if (stats.type === 'number' && stats.mean !== undefined) {
    summaryParts.push(`promedio: ${formatStatValue(stats.mean, 'number')}`);
  }
  
  if (stats.type === 'text' && stats.avgLength !== undefined) {
    summaryParts.push(`long. promedio: ${stats.avgLength} caracteres`);
  }
  
  if (stats.type === 'date' && stats.dateRange !== undefined) {
    summaryParts.push(`rango: ${stats.dateRange} días`);
  }
  
  return summaryParts.join(' • ');
};
