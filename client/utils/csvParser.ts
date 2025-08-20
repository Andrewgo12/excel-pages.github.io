import { ExcelData, ExcelColumn } from "@shared/excel-types";

export interface CSVParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  encoding?: string;
  skipEmptyLines?: boolean;
  maxRows?: number;
  sampleSize?: number;
}

export interface CSVParseResult {
  data: ExcelData;
  warnings: string[];
  stats: {
    totalRows: number;
    totalColumns: number;
    emptyRows: number;
    processingTime: number;
  };
}

// Simple CSV parser without external dependencies
export const parseCSV = async (
  file: File,
  options: CSVParseOptions = {},
): Promise<CSVParseResult> => {
  const startTime = Date.now();
  const {
    delimiter = ",",
    hasHeader = true,
    skipEmptyLines = true,
    maxRows,
    sampleSize = 100,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const warnings: string[] = [];

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("No se pudo leer el contenido del archivo"));
          return;
        }

        // Parse CSV content
        const lines = text.split(/\r?\n/);
        let rows: string[][] = [];

        // Simple CSV parsing with quote handling
        for (const line of lines) {
          if (skipEmptyLines && line.trim() === "") continue;

          const row = parseCSVLine(line, delimiter);
          rows.push(row);

          if (maxRows && rows.length >= maxRows) {
            warnings.push(`Archivo limitado a ${maxRows} filas`);
            break;
          }
        }

        if (rows.length === 0) {
          reject(new Error("El archivo CSV está vacío"));
          return;
        }

        // Extract headers
        let headers: string[] = [];
        let dataRows: string[][] = [];

        if (hasHeader && rows.length > 0) {
          headers = rows[0].map(
            (header, index) => header.trim() || `Columna_${index + 1}`,
          );
          dataRows = rows.slice(1);
        } else {
          // Generate column names
          const maxColumns = Math.max(...rows.map((row) => row.length));
          headers = Array.from(
            { length: maxColumns },
            (_, i) => `Columna_${i + 1}`,
          );
          dataRows = rows;
        }

        // Ensure all rows have the same number of columns
        const columnCount = headers.length;
        dataRows = dataRows.map((row) => {
          const normalizedRow = [...row];
          while (normalizedRow.length < columnCount) {
            normalizedRow.push("");
          }
          return normalizedRow.slice(0, columnCount);
        });

        // Infer column types using sample data
        const columns: ExcelColumn[] = headers.map((header, index) => {
          const sampleValues = dataRows
            .slice(0, sampleSize)
            .map((row) => row[index])
            .filter((val) => val && val.trim() !== "");

          const type = inferColumnType(sampleValues);

          return {
            key: `col_${index}`,
            label: header,
            type: type,
          };
        });

        // Convert to ExcelData format
        const dataObjects = dataRows.map((row, rowIndex) => {
          const obj: Record<string, any> = {};

          columns.forEach((column, colIndex) => {
            const rawValue = row[colIndex] || "";
            obj[column.key] = convertValue(rawValue, column.type);
          });

          return obj;
        });

        // Calculate stats
        const emptyRows = dataRows.filter((row) =>
          row.every((cell) => !cell || cell.trim() === ""),
        ).length;

        const result: CSVParseResult = {
          data: {
            columns,
            rows: dataObjects,
            activeSheet: "CSV Data",
            sheetNames: ["CSV Data"],
            sheetsData: {
              "CSV Data": {
                columns,
                rows: dataObjects,
              },
            },
          },
          warnings,
          stats: {
            totalRows: dataObjects.length,
            totalColumns: columns.length,
            emptyRows,
            processingTime: Date.now() - startTime,
          },
        };

        resolve(result);
      } catch (error) {
        reject(new Error(`Error parseando CSV: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsText(file, options.encoding || "UTF-8");
  });
};

// Parse a single CSV line with quote handling
const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current);

  return result;
};

// Infer column type from sample values
const inferColumnType = (
  values: string[],
): "text" | "number" | "date" | "boolean" => {
  if (values.length === 0) return "text";

  // Check for boolean
  const booleanPattern = /^(true|false|yes|no|si|no|verdadero|falso|1|0)$/i;
  if (values.every((val) => booleanPattern.test(val.trim()))) {
    return "boolean";
  }

  // Check for numbers
  const numberPattern = /^-?(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/;
  const euroNumberPattern = /^-?(\d{1,3}(.\d{3})*|\d+)(,\d+)?$/; // European format

  if (
    values.every((val) => {
      const trimmed = val.trim().replace(/[$€£¥]/g, ""); // Remove currency symbols
      return numberPattern.test(trimmed) || euroNumberPattern.test(trimmed);
    })
  ) {
    return "number";
  }

  // Check for dates
  if (
    values.every((val) => {
      const trimmed = val.trim();
      // Common date patterns
      const datePatterns = [
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or DD/MM/YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY or DD-MM-YYYY
        /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
        /^\d{1,2}\/\d{1,2}\/\d{2}$/, // MM/DD/YY
      ];

      return (
        datePatterns.some((pattern) => pattern.test(trimmed)) ||
        !isNaN(Date.parse(trimmed))
      );
    })
  ) {
    return "date";
  }

  return "text";
};

// Convert string value to appropriate type
const convertValue = (
  value: string,
  type: "text" | "number" | "date" | "boolean",
): any => {
  if (!value || value.trim() === "") return null;

  const trimmed = value.trim();

  switch (type) {
    case "number":
      // Handle different number formats
      let cleaned = trimmed.replace(/[$€£¥]/g, ""); // Remove currency

      // European format (1.234,56)
      if (
        cleaned.includes(".") &&
        cleaned.includes(",") &&
        cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
      ) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      }
      // US format with commas (1,234.56)
      else if (cleaned.includes(",")) {
        cleaned = cleaned.replace(/,/g, "");
      }

      const num = parseFloat(cleaned);
      return isNaN(num) ? trimmed : num;

    case "boolean":
      const lowerValue = trimmed.toLowerCase();
      if (["true", "yes", "si", "verdadero", "1"].includes(lowerValue))
        return true;
      if (["false", "no", "falso", "0"].includes(lowerValue)) return false;
      return trimmed;

    case "date":
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? trimmed : date.toISOString().split("T")[0];

    default:
      return trimmed;
  }
};

// Auto-detect CSV delimiter
export const detectCSVDelimiter = (
  text: string,
  sampleLines: number = 5,
): string => {
  const delimiters = [",", ";", "\t", "|"];
  const lines = text.split(/\r?\n/).slice(0, sampleLines);

  let bestDelimiter = ",";
  let maxScore = 0;

  for (const delimiter of delimiters) {
    let score = 0;
    let consistency = 0;
    let columnCounts: number[] = [];

    for (const line of lines) {
      if (line.trim()) {
        const columns = parseCSVLine(line, delimiter);
        columnCounts.push(columns.length);
        score += columns.length;
      }
    }

    // Check consistency (all lines should have similar column count)
    if (columnCounts.length > 1) {
      const avg = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
      const variance =
        columnCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) /
        columnCounts.length;
      consistency = 1 / (1 + variance); // Lower variance = higher consistency
    }

    const finalScore = score * consistency;

    if (finalScore > maxScore) {
      maxScore = finalScore;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
};
