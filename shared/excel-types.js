/**
 * @typedef {Object} ExcelColumn
 * @property {string} key
 * @property {string} label
 * @property {"text"|"number"|"date"|"boolean"} type
 */

/**
 * @typedef {Object} SheetData
 * @property {ExcelColumn[]} columns
 * @property {Record<string, any>[]} rows
 */

/**
 * @typedef {Object} ExcelData
 * @property {ExcelColumn[]} columns
 * @property {Record<string, any>[]} rows
 * @property {string[]} sheetNames
 * @property {string} activeSheet
 * @property {Record<string, SheetData>} [sheetsData]
 */

/**
 * @typedef {Object} FilterCondition
 * @property {string} id
 * @property {string} column
 * @property {"equals"|"contains"|"greater"|"less"|"between"|"not_equals"|"starts_with"|"ends_with"} operator
 * @property {string|number|Date} value
 * @property {string|number|Date} [secondValue] - For 'between' operator
 */

/**
 * @typedef {Object} FilterGroup
 * @property {string} id
 * @property {"AND"|"OR"} logic
 * @property {FilterCondition[]} conditions
 */

/**
 * @typedef {Object} ColumnConfiguration
 * @property {string} id
 * @property {string} name
 * @property {string[]} selectedColumns
 * @property {Date} created
 */

/**
 * @typedef {Object} PaginationConfig
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalRows
 */
