export interface ExcelColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export interface SheetData {
  columns: ExcelColumn[];
  rows: Record<string, any>[];
}

export interface ExcelData {
  columns: ExcelColumn[];
  rows: Record<string, any>[];
  sheetNames: string[];
  activeSheet: string;
  sheetsData?: Record<string, SheetData>;
}

export interface FilterCondition {
  id: string;
  column: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'not_equals' | 'starts_with' | 'ends_with';
  value: string | number | Date;
  secondValue?: string | number | Date; // For 'between' operator
}

export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export interface ColumnConfiguration {
  id: string;
  name: string;
  selectedColumns: string[];
  created: Date;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalRows: number;
}
