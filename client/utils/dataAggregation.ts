import { ExcelColumn } from '@shared/excel-types';

export interface AggregationRule {
  id: string;
  groupByColumn: string;
  aggregateColumn: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'std' | 'distinct';
  label?: string;
}

export interface AggregatedResult {
  group: string;
  value: number;
  count: number;
  originalRows: Record<string, any>[];
}

export interface AggregationSummary {
  rule: AggregationRule;
  results: AggregatedResult[];
  totalGroups: number;
  totalRows: number;
}

export const aggregateData = (
  data: Record<string, any>[],
  rule: AggregationRule
): AggregationSummary => {
  // Group data by the specified column
  const groups = data.reduce((acc, row) => {
    const groupKey = String(row[rule.groupByColumn] || 'Sin valor');
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(row);
    return acc;
  }, {} as Record<string, Record<string, any>[]>);

  // Calculate aggregation for each group
  const results: AggregatedResult[] = Object.entries(groups).map(([groupKey, groupRows]) => {
    const values = groupRows
      .map(row => row[rule.aggregateColumn])
      .filter(val => val !== null && val !== undefined && val !== '')
      .map(val => Number(val))
      .filter(val => !isNaN(val));

    let aggregatedValue: number;

    switch (rule.function) {
      case 'sum':
        aggregatedValue = values.reduce((sum, val) => sum + val, 0);
        break;
      case 'avg':
        aggregatedValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
        break;
      case 'count':
        aggregatedValue = values.length;
        break;
      case 'min':
        aggregatedValue = values.length > 0 ? Math.min(...values) : 0;
        break;
      case 'max':
        aggregatedValue = values.length > 0 ? Math.max(...values) : 0;
        break;
      case 'median':
        if (values.length === 0) {
          aggregatedValue = 0;
        } else {
          const sorted = [...values].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          aggregatedValue = sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
        }
        break;
      case 'std':
        if (values.length <= 1) {
          aggregatedValue = 0;
        } else {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          aggregatedValue = Math.sqrt(variance);
        }
        break;
      case 'distinct':
        const uniqueValues = new Set(
          groupRows.map(row => row[rule.aggregateColumn]).filter(val => val !== null && val !== undefined && val !== '')
        );
        aggregatedValue = uniqueValues.size;
        break;
      default:
        aggregatedValue = 0;
    }

    return {
      group: groupKey,
      value: Math.round(aggregatedValue * 100) / 100,
      count: groupRows.length,
      originalRows: groupRows
    };
  });

  // Sort results by value descending
  results.sort((a, b) => b.value - a.value);

  return {
    rule,
    results,
    totalGroups: results.length,
    totalRows: data.length
  };
};

export const createPivotTable = (
  data: Record<string, any>[],
  rowColumn: string,
  columnColumn: string,
  valueColumn: string,
  aggregationFunction: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): Record<string, any>[] => {
  // Get unique values for rows and columns
  const rowValues = [...new Set(data.map(row => String(row[rowColumn] || 'Sin valor')))];
  const colValues = [...new Set(data.map(row => String(row[columnColumn] || 'Sin valor')))];

  // Create pivot table
  const pivotData: Record<string, any>[] = [];

  rowValues.forEach(rowVal => {
    const pivotRow: Record<string, any> = { [rowColumn]: rowVal };

    colValues.forEach(colVal => {
      // Find matching rows
      const matchingRows = data.filter(
        row => String(row[rowColumn] || 'Sin valor') === rowVal && 
               String(row[columnColumn] || 'Sin valor') === colVal
      );

      if (matchingRows.length === 0) {
        pivotRow[colVal] = 0;
        return;
      }

      // Get values for aggregation
      const values = matchingRows
        .map(row => Number(row[valueColumn]))
        .filter(val => !isNaN(val));

      let aggregatedValue: number;
      switch (aggregationFunction) {
        case 'sum':
          aggregatedValue = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          aggregatedValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'min':
          aggregatedValue = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          aggregatedValue = values.length > 0 ? Math.max(...values) : 0;
          break;
        default:
          aggregatedValue = 0;
      }

      pivotRow[colVal] = Math.round(aggregatedValue * 100) / 100;
    });

    pivotData.push(pivotRow);
  });

  return pivotData;
};

export const getAggregationFunctionLabel = (func: string): string => {
  switch (func) {
    case 'sum': return 'Suma';
    case 'avg': return 'Promedio';
    case 'count': return 'Conteo';
    case 'min': return 'Mínimo';
    case 'max': return 'Máximo';
    case 'median': return 'Mediana';
    case 'std': return 'Desv. Estándar';
    case 'distinct': return 'Valores Únicos';
    default: return func;
  }
};

export const formatAggregatedValue = (value: number, func: string): string => {
  if (func === 'count' || func === 'distinct') {
    return value.toString();
  }
  return value.toLocaleString('es-ES', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 2 
  });
};

// Quick aggregation functions for column summaries
export const getColumnAggregations = (
  data: Record<string, any>[],
  columnKey: string,
  columnType: string
): Record<string, number> => {
  const values = data
    .map(row => row[columnKey])
    .filter(val => val !== null && val !== undefined && val !== '');

  if (columnType === 'number') {
    const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
    
    if (numericValues.length === 0) return {};

    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const sorted = [...numericValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];

    return {
      count: numericValues.length,
      sum: Math.round(sum * 100) / 100,
      avg: Math.round((sum / numericValues.length) * 100) / 100,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      median: Math.round(median * 100) / 100
    };
  }

  return {
    count: values.length,
    distinct: new Set(values).size
  };
};
