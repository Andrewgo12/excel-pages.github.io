import { ExcelColumn } from '@shared/excel-types';

export interface TransformationRule {
  id: string;
  name: string;
  type: 'replace' | 'calculate' | 'format' | 'split' | 'merge' | 'duplicate' | 'remove';
  sourceColumns: string[];
  targetColumn: string;
  parameters: Record<string, any>;
  preview?: boolean;
}

export interface BulkOperation {
  id: string;
  name: string;
  type: 'delete' | 'update' | 'duplicate' | 'export';
  filters: any[];
  parameters: Record<string, any>;
}

// Text transformations
export const applyTextTransformation = (
  value: any,
  operation: 'uppercase' | 'lowercase' | 'capitalize' | 'trim' | 'replace',
  parameters?: Record<string, any>
): string => {
  const text = String(value || '');
  
  switch (operation) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'trim':
      return text.trim();
    case 'replace':
      if (!parameters?.search) return text;
      const regex = parameters.useRegex 
        ? new RegExp(parameters.search, parameters.flags || 'g')
        : new RegExp(parameters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      return text.replace(regex, parameters.replace || '');
    default:
      return text;
  }
};

// Number transformations
export const applyNumberTransformation = (
  value: any,
  operation: 'round' | 'ceil' | 'floor' | 'abs' | 'multiply' | 'add' | 'subtract' | 'divide',
  parameters?: Record<string, any>
): number => {
  const num = Number(value) || 0;
  
  switch (operation) {
    case 'round':
      const decimals = parameters?.decimals || 0;
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    case 'ceil':
      return Math.ceil(num);
    case 'floor':
      return Math.floor(num);
    case 'abs':
      return Math.abs(num);
    case 'multiply':
      return num * (parameters?.value || 1);
    case 'add':
      return num + (parameters?.value || 0);
    case 'subtract':
      return num - (parameters?.value || 0);
    case 'divide':
      const divisor = parameters?.value || 1;
      return divisor !== 0 ? num / divisor : num;
    default:
      return num;
  }
};

// Date transformations
export const applyDateTransformation = (
  value: any,
  operation: 'format' | 'addDays' | 'addMonths' | 'addYears' | 'extractYear' | 'extractMonth' | 'extractDay',
  parameters?: Record<string, any>
): string | number => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  
  switch (operation) {
    case 'format':
      const format = parameters?.format || 'es-ES';
      return date.toLocaleDateString(format);
    case 'addDays':
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + (parameters?.days || 0));
      return newDate.toLocaleDateString('es-ES');
    case 'addMonths':
      const newDateM = new Date(date);
      newDateM.setMonth(date.getMonth() + (parameters?.months || 0));
      return newDateM.toLocaleDateString('es-ES');
    case 'addYears':
      const newDateY = new Date(date);
      newDateY.setFullYear(date.getFullYear() + (parameters?.years || 0));
      return newDateY.toLocaleDateString('es-ES');
    case 'extractYear':
      return date.getFullYear();
    case 'extractMonth':
      return date.getMonth() + 1;
    case 'extractDay':
      return date.getDate();
    default:
      return value;
  }
};

// Apply transformation rule to data
export const applyTransformationRule = (
  data: Record<string, any>[],
  rule: TransformationRule,
  columns: ExcelColumn[]
): Record<string, any>[] => {
  return data.map(row => {
    const newRow = { ...row };
    
    switch (rule.type) {
      case 'replace':
        if (rule.sourceColumns.length > 0) {
          const sourceCol = rule.sourceColumns[0];
          const column = columns.find(c => c.key === sourceCol);
          
          if (column?.type === 'text') {
            newRow[rule.targetColumn] = applyTextTransformation(
              row[sourceCol],
              rule.parameters.operation,
              rule.parameters
            );
          } else if (column?.type === 'number') {
            newRow[rule.targetColumn] = applyNumberTransformation(
              row[sourceCol],
              rule.parameters.operation,
              rule.parameters
            );
          } else if (column?.type === 'date') {
            newRow[rule.targetColumn] = applyDateTransformation(
              row[sourceCol],
              rule.parameters.operation,
              rule.parameters
            );
          }
        }
        break;
        
      case 'calculate':
        if (rule.sourceColumns.length >= 2) {
          const val1 = Number(row[rule.sourceColumns[0]]) || 0;
          const val2 = Number(row[rule.sourceColumns[1]]) || 0;
          
          switch (rule.parameters.operation) {
            case 'add':
              newRow[rule.targetColumn] = val1 + val2;
              break;
            case 'subtract':
              newRow[rule.targetColumn] = val1 - val2;
              break;
            case 'multiply':
              newRow[rule.targetColumn] = val1 * val2;
              break;
            case 'divide':
              newRow[rule.targetColumn] = val2 !== 0 ? val1 / val2 : 0;
              break;
            case 'percentage':
              newRow[rule.targetColumn] = val2 !== 0 ? Math.round((val1 / val2) * 100 * 100) / 100 : 0;
              break;
          }
        }
        break;
        
      case 'split':
        if (rule.sourceColumns.length > 0) {
          const sourceValue = String(row[rule.sourceColumns[0]] || '');
          const delimiter = rule.parameters.delimiter || ' ';
          const parts = sourceValue.split(delimiter);
          const partIndex = rule.parameters.partIndex || 0;
          
          if (parts.length > partIndex) {
            newRow[rule.targetColumn] = parts[partIndex].trim();
          }
        }
        break;
        
      case 'merge':
        if (rule.sourceColumns.length > 0) {
          const separator = rule.parameters.separator || ' ';
          const mergedValue = rule.sourceColumns
            .map(col => String(row[col] || ''))
            .filter(val => val.trim() !== '')
            .join(separator);
          newRow[rule.targetColumn] = mergedValue;
        }
        break;
        
      case 'format':
        if (rule.sourceColumns.length > 0) {
          const sourceValue = row[rule.sourceColumns[0]];
          const column = columns.find(c => c.key === rule.sourceColumns[0]);
          
          if (column?.type === 'number') {
            const num = Number(sourceValue);
            if (!isNaN(num)) {
              newRow[rule.targetColumn] = num.toLocaleString(
                rule.parameters.locale || 'es-ES',
                {
                  minimumFractionDigits: rule.parameters.decimals || 0,
                  maximumFractionDigits: rule.parameters.decimals || 2
                }
              );
            }
          } else if (column?.type === 'date') {
            const date = new Date(sourceValue);
            if (!isNaN(date.getTime())) {
              newRow[rule.targetColumn] = date.toLocaleDateString(
                rule.parameters.locale || 'es-ES',
                rule.parameters.dateOptions || {}
              );
            }
          }
        }
        break;
    }
    
    return newRow;
  });
};

// Bulk operations
export const applyBulkDelete = (
  data: Record<string, any>[],
  condition: (row: Record<string, any>) => boolean
): { data: Record<string, any>[]; deletedCount: number } => {
  const filtered = data.filter(row => !condition(row));
  return {
    data: filtered,
    deletedCount: data.length - filtered.length
  };
};

export const applyBulkUpdate = (
  data: Record<string, any>[],
  condition: (row: Record<string, any>) => boolean,
  updates: Record<string, any>
): { data: Record<string, any>[]; updatedCount: number } => {
  let updatedCount = 0;
  
  const updatedData = data.map(row => {
    if (condition(row)) {
      updatedCount++;
      return { ...row, ...updates };
    }
    return row;
  });
  
  return {
    data: updatedData,
    updatedCount
  };
};

export const applyBulkDuplicate = (
  data: Record<string, any>[],
  condition: (row: Record<string, any>) => boolean,
  modifications?: Record<string, any>
): { data: Record<string, any>[]; duplicatedCount: number } => {
  const duplicatedRows: Record<string, any>[] = [];
  
  data.forEach(row => {
    if (condition(row)) {
      const duplicatedRow = {
        ...row,
        _id: Date.now() + Math.random(), // New unique ID
        ...modifications
      };
      duplicatedRows.push(duplicatedRow);
    }
  });
  
  return {
    data: [...data, ...duplicatedRows],
    duplicatedCount: duplicatedRows.length
  };
};

// Data cleaning utilities
export const cleanData = (
  data: Record<string, any>[],
  operations: {
    removeDuplicates?: boolean;
    removeEmptyRows?: boolean;
    trimWhitespace?: boolean;
    fillEmptyValues?: { column: string; value: any }[];
  }
): { data: Record<string, any>[]; cleaned: { duplicates: number; emptyRows: number; trimmed: number; filled: number } } => {
  let result = [...data];
  const cleaned = { duplicates: 0, emptyRows: 0, trimmed: 0, filled: 0 };
  
  // Remove duplicates
  if (operations.removeDuplicates) {
    const seen = new Set();
    const originalLength = result.length;
    result = result.filter(row => {
      const key = Object.entries(row)
        .filter(([k]) => k !== '_id')
        .map(([k, v]) => `${k}:${v}`)
        .sort()
        .join('|');
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    cleaned.duplicates = originalLength - result.length;
  }
  
  // Remove empty rows
  if (operations.removeEmptyRows) {
    const originalLength = result.length;
    result = result.filter(row => {
      const values = Object.entries(row)
        .filter(([k]) => k !== '_id')
        .map(([k, v]) => v);
      return values.some(v => v !== null && v !== undefined && v !== '');
    });
    cleaned.emptyRows = originalLength - result.length;
  }
  
  // Trim whitespace
  if (operations.trimWhitespace) {
    result = result.map(row => {
      const trimmedRow = { ...row };
      Object.keys(trimmedRow).forEach(key => {
        if (typeof trimmedRow[key] === 'string') {
          const original = trimmedRow[key];
          trimmedRow[key] = original.trim();
          if (original !== trimmedRow[key]) {
            cleaned.trimmed++;
          }
        }
      });
      return trimmedRow;
    });
  }
  
  // Fill empty values
  if (operations.fillEmptyValues) {
    result = result.map(row => {
      const filledRow = { ...row };
      operations.fillEmptyValues!.forEach(({ column, value }) => {
        if (filledRow[column] === null || filledRow[column] === undefined || filledRow[column] === '') {
          filledRow[column] = value;
          cleaned.filled++;
        }
      });
      return filledRow;
    });
  }
  
  return { data: result, cleaned };
};

// Generate preview for transformations
export const generateTransformationPreview = (
  data: Record<string, any>[],
  rule: TransformationRule,
  columns: ExcelColumn[],
  sampleSize: number = 5
): { before: any[]; after: any[] } => {
  const sample = data.slice(0, sampleSize);
  const transformed = applyTransformationRule(sample, rule, columns);
  
  return {
    before: sample.map(row => ({
      original: rule.sourceColumns.map(col => row[col]),
      target: row[rule.targetColumn]
    })),
    after: transformed.map(row => ({
      original: rule.sourceColumns.map(col => row[col]),
      target: row[rule.targetColumn]
    }))
  };
};
