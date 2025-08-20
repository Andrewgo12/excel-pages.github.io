import { ExcelColumn } from '@shared/excel-types';

export interface ValidationRule {
  id: string;
  name: string;
  column: string;
  type: 'required' | 'format' | 'range' | 'unique' | 'enum' | 'pattern' | 'length' | 'date_range';
  parameters: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
  description?: string;
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  column: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rowIndex: number;
  value: any;
  suggestion?: string;
}

export interface QualityReport {
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    warningRows: number;
    qualityScore: number;
  };
  issues: ValidationResult[];
  columnQuality: Record<string, {
    totalValues: number;
    validValues: number;
    errorCount: number;
    warningCount: number;
    qualityScore: number;
  }>;
}

// Validation functions
export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

export const validateEmail = (value: any): boolean => {
  if (!value) return true; // Empty values are handled by required validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(value));
};

export const validatePhone = (value: any): boolean => {
  if (!value) return true;
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
  return phoneRegex.test(String(value));
};

export const validateURL = (value: any): boolean => {
  if (!value) return true;
  try {
    new URL(String(value));
    return true;
  } catch {
    return false;
  }
};

export const validateDateFormat = (value: any, format: string = 'dd/mm/yyyy'): boolean => {
  if (!value) return true;
  
  const dateStr = String(value);
  const date = new Date(dateStr);
  
  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    // Try different formats
    const formats = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/, // dd/mm/yyyy
      /^\d{4}-\d{1,2}-\d{1,2}$/, // yyyy-mm-dd
      /^\d{1,2}-\d{1,2}-\d{4}$/, // dd-mm-yyyy
    ];
    
    return formats.some(regex => regex.test(dateStr));
  }
  
  return true;
};

export const validateNumberRange = (value: any, min?: number, max?: number): boolean => {
  if (!value && value !== 0) return true;
  
  const num = Number(value);
  if (isNaN(num)) return false;
  
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  
  return true;
};

export const validateStringLength = (value: any, min?: number, max?: number): boolean => {
  if (!value) return true;
  
  const str = String(value);
  if (min !== undefined && str.length < min) return false;
  if (max !== undefined && str.length > max) return false;
  
  return true;
};

export const validatePattern = (value: any, pattern: string, flags?: string): boolean => {
  if (!value) return true;
  
  try {
    const regex = new RegExp(pattern, flags);
    return regex.test(String(value));
  } catch {
    return false;
  }
};

export const validateEnum = (value: any, allowedValues: any[]): boolean => {
  if (!value) return true;
  return allowedValues.includes(value);
};

export const validateUnique = (data: Record<string, any>[], column: string, currentIndex: number): boolean => {
  const currentValue = data[currentIndex][column];
  if (!currentValue) return true;
  
  const duplicates = data.filter((row, index) => 
    index !== currentIndex && row[column] === currentValue
  );
  
  return duplicates.length === 0;
};

export const validateDateRange = (value: any, minDate?: string, maxDate?: string): boolean => {
  if (!value) return true;
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  
  if (minDate) {
    const min = new Date(minDate);
    if (!isNaN(min.getTime()) && date < min) return false;
  }
  
  if (maxDate) {
    const max = new Date(maxDate);
    if (!isNaN(max.getTime()) && date > max) return false;
  }
  
  return true;
};

// Apply validation rules to data
export const validateData = (
  data: Record<string, any>[],
  rules: ValidationRule[],
  columns: ExcelColumn[]
): QualityReport => {
  const issues: ValidationResult[] = [];
  const columnQuality: Record<string, any> = {};
  
  // Initialize column quality tracking
  columns.forEach(col => {
    columnQuality[col.key] = {
      totalValues: 0,
      validValues: 0,
      errorCount: 0,
      warningCount: 0,
      qualityScore: 100
    };
  });
  
  // Validate each row
  data.forEach((row, rowIndex) => {
    rules.forEach(rule => {
      const value = row[rule.column];
      let isValid = true;
      let message = '';
      let suggestion = '';
      
      // Update total values count
      if (columnQuality[rule.column]) {
        columnQuality[rule.column].totalValues++;
      }
      
      switch (rule.type) {
        case 'required':
          isValid = validateRequired(value);
          message = isValid ? '' : `Valor requerido en ${rule.column}`;
          suggestion = 'Proporciona un valor para este campo';
          break;
          
        case 'format':
          switch (rule.parameters.format) {
            case 'email':
              isValid = validateEmail(value);
              message = isValid ? '' : `Formato de email inválido: ${value}`;
              suggestion = 'Usa el formato: usuario@dominio.com';
              break;
            case 'phone':
              isValid = validatePhone(value);
              message = isValid ? '' : `Formato de teléfono inválido: ${value}`;
              suggestion = 'Usa el formato: +34 123 456 789';
              break;
            case 'url':
              isValid = validateURL(value);
              message = isValid ? '' : `URL inválida: ${value}`;
              suggestion = 'Usa el formato: https://ejemplo.com';
              break;
            case 'date':
              isValid = validateDateFormat(value, rule.parameters.dateFormat);
              message = isValid ? '' : `Formato de fecha inválido: ${value}`;
              suggestion = 'Usa el formato: DD/MM/YYYY';
              break;
          }
          break;
          
        case 'range':
          isValid = validateNumberRange(value, rule.parameters.min, rule.parameters.max);
          if (!isValid) {
            if (rule.parameters.min !== undefined && rule.parameters.max !== undefined) {
              message = `Valor ${value} fuera del rango ${rule.parameters.min}-${rule.parameters.max}`;
              suggestion = `El valor debe estar entre ${rule.parameters.min} y ${rule.parameters.max}`;
            } else if (rule.parameters.min !== undefined) {
              message = `Valor ${value} menor que el mínimo ${rule.parameters.min}`;
              suggestion = `El valor debe ser mayor o igual a ${rule.parameters.min}`;
            } else if (rule.parameters.max !== undefined) {
              message = `Valor ${value} mayor que el máximo ${rule.parameters.max}`;
              suggestion = `El valor debe ser menor o igual a ${rule.parameters.max}`;
            }
          }
          break;
          
        case 'length':
          isValid = validateStringLength(value, rule.parameters.min, rule.parameters.max);
          if (!isValid) {
            const length = String(value || '').length;
            if (rule.parameters.min !== undefined && rule.parameters.max !== undefined) {
              message = `Longitud ${length} fuera del rango ${rule.parameters.min}-${rule.parameters.max} caracteres`;
              suggestion = `Debe tener entre ${rule.parameters.min} y ${rule.parameters.max} caracteres`;
            } else if (rule.parameters.min !== undefined) {
              message = `Texto demasiado corto: ${length} caracteres (mínimo ${rule.parameters.min})`;
              suggestion = `Debe tener al menos ${rule.parameters.min} caracteres`;
            } else if (rule.parameters.max !== undefined) {
              message = `Texto demasiado largo: ${length} caracteres (máximo ${rule.parameters.max})`;
              suggestion = `Debe tener máximo ${rule.parameters.max} caracteres`;
            }
          }
          break;
          
        case 'pattern':
          isValid = validatePattern(value, rule.parameters.pattern, rule.parameters.flags);
          message = isValid ? '' : `Valor ${value} no coincide con el patrón requerido`;
          suggestion = rule.parameters.suggestion || 'Revisa el formato requerido';
          break;
          
        case 'enum':
          isValid = validateEnum(value, rule.parameters.allowedValues);
          message = isValid ? '' : `Valor ${value} no está en la lista de valores permitidos`;
          suggestion = `Valores permitidos: ${rule.parameters.allowedValues.join(', ')}`;
          break;
          
        case 'unique':
          isValid = validateUnique(data, rule.column, rowIndex);
          message = isValid ? '' : `Valor duplicado: ${value}`;
          suggestion = 'Este valor debe ser único en la columna';
          break;
          
        case 'date_range':
          isValid = validateDateRange(value, rule.parameters.minDate, rule.parameters.maxDate);
          if (!isValid) {
            message = `Fecha ${value} fuera del rango permitido`;
            suggestion = `La fecha debe estar entre ${rule.parameters.minDate || 'inicio'} y ${rule.parameters.maxDate || 'fin'}`;
          }
          break;
      }
      
      // Update quality tracking
      if (columnQuality[rule.column]) {
        if (isValid) {
          columnQuality[rule.column].validValues++;
        } else {
          if (rule.severity === 'error') {
            columnQuality[rule.column].errorCount++;
          } else if (rule.severity === 'warning') {
            columnQuality[rule.column].warningCount++;
          }
        }
      }
      
      // Add issue if validation failed
      if (!isValid) {
        issues.push({
          ruleId: rule.id,
          ruleName: rule.name,
          column: rule.column,
          severity: rule.severity,
          message,
          rowIndex,
          value,
          suggestion
        });
      }
    });
  });
  
  // Calculate quality scores
  Object.keys(columnQuality).forEach(column => {
    const quality = columnQuality[column];
    if (quality.totalValues > 0) {
      const errorPenalty = (quality.errorCount / quality.totalValues) * 100;
      const warningPenalty = (quality.warningCount / quality.totalValues) * 50;
      quality.qualityScore = Math.max(0, 100 - errorPenalty - warningPenalty);
    }
  });
  
  // Calculate overall quality
  const totalIssues = issues.length;
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const validRows = data.length - new Set(issues.filter(i => i.severity === 'error').map(i => i.rowIndex)).size;
  const warningRows = new Set(issues.filter(i => i.severity === 'warning').map(i => i.rowIndex)).size;
  
  const qualityScore = data.length > 0 
    ? Math.max(0, 100 - ((errorCount / data.length) * 100) - ((warningCount / data.length) * 30))
    : 100;
  
  return {
    summary: {
      totalRows: data.length,
      validRows,
      invalidRows: data.length - validRows,
      warningRows,
      qualityScore: Math.round(qualityScore)
    },
    issues,
    columnQuality
  };
};

// Predefined validation rules templates
export const getValidationTemplates = (): Partial<ValidationRule>[] => [
  {
    name: 'Campo requerido',
    type: 'required',
    severity: 'error',
    description: 'El campo no puede estar vacío',
    parameters: {}
  },
  {
    name: 'Email válido',
    type: 'format',
    severity: 'error',
    description: 'Debe tener formato de email válido',
    parameters: { format: 'email' }
  },
  {
    name: 'Teléfono válido',
    type: 'format',
    severity: 'warning',
    description: 'Debe tener formato de teléfono válido',
    parameters: { format: 'phone' }
  },
  {
    name: 'URL válida',
    type: 'format',
    severity: 'warning',
    description: 'Debe ser una URL válida',
    parameters: { format: 'url' }
  },
  {
    name: 'Fecha válida',
    type: 'format',
    severity: 'error',
    description: 'Debe tener formato de fecha válido',
    parameters: { format: 'date' }
  },
  {
    name: 'Número positivo',
    type: 'range',
    severity: 'error',
    description: 'Debe ser un número mayor que 0',
    parameters: { min: 0 }
  },
  {
    name: 'Texto mínimo',
    type: 'length',
    severity: 'warning',
    description: 'Texto demasiado corto',
    parameters: { min: 3 }
  },
  {
    name: 'Valores únicos',
    type: 'unique',
    severity: 'error',
    description: 'No debe haber valores duplicados',
    parameters: {}
  }
];

// Auto-generate validation rules based on data analysis
export const generateAutoValidationRules = (
  data: Record<string, any>[],
  columns: ExcelColumn[]
): ValidationRule[] => {
  const rules: ValidationRule[] = [];
  
  columns.forEach(column => {
    const values = data.map(row => row[column.key]).filter(val => val !== null && val !== undefined && val !== '');
    
    if (values.length === 0) return;
    
    // Auto-detect email columns
    if (column.type === 'text' && values.some(val => String(val).includes('@'))) {
      const emailCount = values.filter(val => validateEmail(val)).length;
      if (emailCount / values.length > 0.8) {
        rules.push({
          id: `auto-email-${column.key}`,
          name: `Email válido - ${column.label}`,
          column: column.key,
          type: 'format',
          parameters: { format: 'email' },
          severity: 'error',
          description: 'Auto-detectado: formato de email'
        });
      }
    }
    
    // Auto-detect phone columns
    if (column.type === 'text' && column.key.toLowerCase().includes('telefono') || column.key.toLowerCase().includes('phone')) {
      rules.push({
        id: `auto-phone-${column.key}`,
        name: `Teléfono válido - ${column.label}`,
        column: column.key,
        type: 'format',
        parameters: { format: 'phone' },
        severity: 'warning',
        description: 'Auto-detectado: formato de teléfono'
      });
    }
    
    // Auto-detect required fields (high fill rate)
    const fillRate = values.length / data.length;
    if (fillRate > 0.95) {
      rules.push({
        id: `auto-required-${column.key}`,
        name: `Campo requerido - ${column.label}`,
        column: column.key,
        type: 'required',
        parameters: {},
        severity: 'error',
        description: 'Auto-detectado: campo con alta tasa de completitud'
      });
    }
    
    // Auto-detect numeric ranges
    if (column.type === 'number') {
      const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);
        
        // Only add range validation if there's a reasonable range
        if (max - min > 0 && numericValues.every(val => val >= 0)) {
          rules.push({
            id: `auto-range-${column.key}`,
            name: `Rango válido - ${column.label}`,
            column: column.key,
            type: 'range',
            parameters: { min: Math.max(0, min - (max - min) * 0.1), max: max + (max - min) * 0.1 },
            severity: 'warning',
            description: 'Auto-detectado: rango numérico basado en datos existentes'
          });
        }
      }
    }
  });
  
  return rules;
};
