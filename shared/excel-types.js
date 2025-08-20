/* shared/excel-types.js
   Converted from shared/excel-types.ts — Type annotations removed.
*/

export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 50,
  totalRows: 0,
};

export const EXCEL_COLUMN_TYPES = ["text", "number", "date", "boolean"];

export const FILTER_OPERATORS = [
  "equals",
  "contains",
  "greater",
  "less",
  "between",
  "not_equals",
  "not_contains",
  "starts_with",
  "ends_with",
  "greater_equal",
  "less_equal",
  "is_empty",
  "is_not_empty",
  "date_today",
  "date_yesterday",
  "date_this_week",
  "date_this_month",
  "date_this_year",
  "date_last_7_days",
  "date_last_30_days",
];

export function isValidOperator(op) {
  return FILTER_OPERATORS.includes(op);
}

export function normalizeRow(row) {
  // Ensure rows are plain objects (no prototype surprises)
  return Object.assign({}, row);
}

export function createEmptySheetData(columns = [], rows = []) {
  return {
    columns,
    rows,
  };
}

export function createExcelData({
  columns = [],
  rows = [],
  sheetNames = [],
  activeSheet = "",
  sheetsData = {},
} = {}) {
  return {
    columns,
    rows,
    sheetNames,
    activeSheet,
    sheetsData,
  };
}
