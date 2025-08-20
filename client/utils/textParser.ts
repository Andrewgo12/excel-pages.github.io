import { ExcelData, ExcelColumn } from "@shared/excel-types";

export interface TextParseOptions {
  delimiter?: string;
  hasHeader?: boolean;
  encoding?: string;
  skipEmptyLines?: boolean;
  maxRows?: number;
  trimWhitespace?: boolean;
  fixedWidth?: boolean;
  columnWidths?: number[];
  autoDetectDelimiter?: boolean;
  sampleSize?: number;
}

export interface TextParseResult {
  data: ExcelData;
  warnings: string[];
  detectedFormat: {
    delimiter: string;
    hasHeader: boolean;
    encoding: string;
    isFixedWidth: boolean;
  };
  stats: {
    totalRows: number;
    totalColumns: number;
    emptyRows: number;
    processingTime: number;
  };
}

export const parseTextFile = async (
  file: File,
  options: TextParseOptions = {}
): Promise<TextParseResult> => {
  const startTime = Date.now();
  const warnings: string[] = [];

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("No se pudo leer el contenido del archivo"));
          return;
        }

        const lines = text.split(/\r?\n/);
        if (lines.length === 0) {
          reject(new Error("El archivo está vacío"));
          return;
        }

        // Auto-detect format if needed
        const detectedFormat = detectTextFormat(text, options);
        
        const {
          delimiter = detectedFormat.delimiter,
          hasHeader = detectedFormat.hasHeader,
          skipEmptyLines = true,
          maxRows,
          trimWhitespace = true,
          fixedWidth = detectedFormat.isFixedWidth,
          columnWidths,
          sampleSize = 100,
        } = options;

        let processedLines = lines;
        
        // Skip empty lines if requested
        if (skipEmptyLines) {
          processedLines = lines.filter(line => line.trim() !== "");
        }

        // Limit rows if specified
        if (maxRows && processedLines.length > maxRows) {
          processedLines = processedLines.slice(0, maxRows);
          warnings.push(`Archivo limitado a ${maxRows} filas`);
        }

        let rows: string[][];
        
        if (fixedWidth && columnWidths) {
          rows = parseFixedWidthText(processedLines, columnWidths, trimWhitespace);
        } else {
          rows = parseDelimitedText(processedLines, delimiter, trimWhitespace);
        }

        if (rows.length === 0) {
          reject(new Error("No se encontraron datos válidos"));
          return;
        }

        // Extract headers
        let headers: string[] = [];
        let dataRows: string[][] = [];

        if (hasHeader && rows.length > 0) {
          headers = rows[0].map((header, index) => 
            header.trim() || `Columna_${index + 1}`
          );
          dataRows = rows.slice(1);
        } else {
          // Generate column names
          const maxColumns = Math.max(...rows.map(row => row.length));
          headers = Array.from({ length: maxColumns }, (_, i) => `Columna_${i + 1}`);
          dataRows = rows;
        }

        // Ensure consistent column count
        const columnCount = headers.length;
        dataRows = dataRows.map(row => {
          const normalizedRow = [...row];
          while (normalizedRow.length < columnCount) {
            normalizedRow.push("");
          }
          return normalizedRow.slice(0, columnCount);
        });

        // Infer column types
        const columns: ExcelColumn[] = headers.map((header, index) => {
          const sampleValues = dataRows
            .slice(0, sampleSize)
            .map(row => row[index])
            .filter(val => val && val.trim() !== "");

          const type = inferColumnType(sampleValues);
          
          return {
            key: `col_${index}`,
            label: header,
            type: type,
          };
        });

        // Convert to ExcelData format
        const dataObjects = dataRows.map(row => {
          const obj: Record<string, any> = {};
          
          columns.forEach((column, colIndex) => {
            const rawValue = row[colIndex] || "";
            obj[column.key] = convertValue(rawValue, column.type);
          });

          return obj;
        });

        // Calculate stats
        const emptyRows = dataRows.filter(row => 
          row.every(cell => !cell || cell.trim() === "")
        ).length;

        const result: TextParseResult = {
          data: {
            columns,
            rows: dataObjects,
            activeSheet: "Text Data",
            sheetNames: ["Text Data"],
            sheetsData: {
              "Text Data": {
                columns,
                rows: dataObjects,
              }
            }
          },
          warnings,
          detectedFormat: {
            delimiter,
            hasHeader,
            encoding: options.encoding || "UTF-8",
            isFixedWidth: fixedWidth,
          },
          stats: {
            totalRows: dataObjects.length,
            totalColumns: columns.length,
            emptyRows,
            processingTime: Date.now() - startTime,
          }
        };

        resolve(result);
      } catch (error) {
        reject(new Error(`Error parseando archivo de texto: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsText(file, options.encoding || "UTF-8");
  });
};

// Parse delimited text (CSV, TSV, etc.)
const parseDelimitedText = (
  lines: string[],
  delimiter: string,
  trimWhitespace: boolean
): string[][] => {
  return lines.map(line => {
    let columns: string[];
    
    if (delimiter === "\t") {
      // Tab-separated - simple split
      columns = line.split("\t");
    } else {
      // Use more sophisticated parsing for other delimiters
      columns = parseDelimitedLine(line, delimiter);
    }

    return trimWhitespace ? columns.map(col => col.trim()) : columns;
  });
};

// Parse fixed-width text
const parseFixedWidthText = (
  lines: string[],
  columnWidths: number[],
  trimWhitespace: boolean
): string[][] => {
  return lines.map(line => {
    const columns: string[] = [];
    let position = 0;
    
    for (const width of columnWidths) {
      const column = line.substring(position, position + width);
      columns.push(trimWhitespace ? column.trim() : column);
      position += width;
    }
    
    return columns;
  });
};

// Parse a delimited line with quote handling
const parseDelimitedLine = (line: string, delimiter: string): string[] => {
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

// Detect text format
const detectTextFormat = (text: string, options: TextParseOptions) => {
  const lines = text.split(/\r?\n/).slice(0, 10); // Sample first 10 lines
  const nonEmptyLines = lines.filter(line => line.trim());
  
  if (nonEmptyLines.length === 0) {
    return {
      delimiter: ",",
      hasHeader: false,
      isFixedWidth: false,
    };
  }

  // Auto-detect delimiter if requested
  let delimiter = options.delimiter || ",";
  if (options.autoDetectDelimiter !== false) {
    delimiter = detectDelimiter(nonEmptyLines);
  }

  // Check if it might be fixed-width
  const isFixedWidth = detectFixedWidth(nonEmptyLines);

  // Try to detect if first line is a header
  const hasHeader = detectHeader(nonEmptyLines, delimiter);

  return {
    delimiter,
    hasHeader,
    isFixedWidth,
  };
};

// Auto-detect delimiter
const detectDelimiter = (lines: string[]): string => {
  const delimiters = ["\t", ",", ";", "|", " "];
  let bestDelimiter = ",";
  let maxScore = 0;

  for (const delimiter of delimiters) {
    let score = 0;
    const columnCounts: number[] = [];

    for (const line of lines) {
      if (line.trim()) {
        const columns = delimiter === " " 
          ? line.split(/\s+/) 
          : parseDelimitedLine(line, delimiter);
        columnCounts.push(columns.length);
        score += columns.length;
      }
    }

    // Check consistency
    if (columnCounts.length > 1) {
      const avg = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
      const variance = columnCounts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / columnCounts.length;
      const consistency = 1 / (1 + variance);
      
      const finalScore = score * consistency;
      
      if (finalScore > maxScore) {
        maxScore = finalScore;
        bestDelimiter = delimiter;
      }
    }
  }

  return bestDelimiter;
};

// Detect if text is fixed-width format
const detectFixedWidth = (lines: string[]): boolean => {
  if (lines.length < 2) return false;

  // Check if all lines have similar length and appear to have columns at fixed positions
  const lineLengths = lines.map(line => line.length);
  const avgLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;
  const lengthVariance = lineLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lineLengths.length;

  // If lines have very similar lengths, it might be fixed-width
  if (lengthVariance < 10) {
    // Look for patterns of spaces that might indicate column boundaries
    const firstLine = lines[0];
    let spacePositions: number[] = [];
    
    for (let i = 0; i < firstLine.length; i++) {
      if (firstLine[i] === " " && firstLine[i + 1] !== " ") {
        spacePositions.push(i);
      }
    }

    // If we found multiple potential column boundaries, it's likely fixed-width
    return spacePositions.length >= 2;
  }

  return false;
};

// Detect if first line is likely a header
const detectHeader = (lines: string[], delimiter: string): boolean => {
  if (lines.length < 2) return false;

  const firstRow = parseDelimitedLine(lines[0], delimiter);
  const secondRow = parseDelimitedLine(lines[1], delimiter);

  if (firstRow.length !== secondRow.length) return false;

  // Check if first row has more text-like values and second row has more data-like values
  let headerScore = 0;
  
  for (let i = 0; i < firstRow.length; i++) {
    const firstValue = firstRow[i].trim();
    const secondValue = secondRow[i].trim();

    // Header likely if first value is text and second is number/date
    if (isNaN(Number(firstValue)) && !isNaN(Number(secondValue))) {
      headerScore++;
    }
    
    // Header likely if first value has no numbers and second has numbers
    if (!/\d/.test(firstValue) && /\d/.test(secondValue)) {
      headerScore++;
    }

    // Header likely if first value is shorter and looks like a label
    if (firstValue.length < secondValue.length && firstValue.length < 20) {
      headerScore++;
    }
  }

  return headerScore >= Math.ceil(firstRow.length * 0.3); // 30% threshold
};

// Infer column type from sample values (same as CSV parser)
const inferColumnType = (values: string[]): "text" | "number" | "date" | "boolean" => {
  if (values.length === 0) return "text";

  // Check for boolean
  const booleanPattern = /^(true|false|yes|no|si|no|verdadero|falso|1|0)$/i;
  if (values.every(val => booleanPattern.test(val.trim()))) {
    return "boolean";
  }

  // Check for numbers
  const numberPattern = /^-?(\d{1,3}(,\d{3})*|\d+)(\.\d+)?$/;
  const euroNumberPattern = /^-?(\d{1,3}(.\d{3})*|\d+)(,\d+)?$/;
  
  if (values.every(val => {
    const trimmed = val.trim().replace(/[$€£¥]/g, "");
    return numberPattern.test(trimmed) || euroNumberPattern.test(trimmed);
  })) {
    return "number";
  }

  // Check for dates
  if (values.every(val => {
    const trimmed = val.trim();
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{2}$/,
    ];
    
    return datePatterns.some(pattern => pattern.test(trimmed)) || 
           !isNaN(Date.parse(trimmed));
  })) {
    return "date";
  }

  return "text";
};

// Convert string value to appropriate type (same as CSV parser)
const convertValue = (value: string, type: "text" | "number" | "date" | "boolean"): any => {
  if (!value || value.trim() === "") return null;

  const trimmed = value.trim();

  switch (type) {
    case "number":
      let cleaned = trimmed.replace(/[$€£¥]/g, "");
      
      if (cleaned.includes(".") && cleaned.includes(",") && 
          cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
        cleaned = cleaned.replace(/\./g, "").replace(",", ".");
      } else if (cleaned.includes(",")) {
        cleaned = cleaned.replace(/,/g, "");
      }
      
      const num = parseFloat(cleaned);
      return isNaN(num) ? trimmed : num;

    case "boolean":
      const lowerValue = trimmed.toLowerCase();
      if (["true", "yes", "si", "verdadero", "1"].includes(lowerValue)) return true;
      if (["false", "no", "falso", "0"].includes(lowerValue)) return false;
      return trimmed;

    case "date":
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? trimmed : date.toISOString().split('T')[0];

    default:
      return trimmed;
  }
};

// Parse TSV (Tab-Separated Values) specifically
export const parseTSV = (file: File, options: Omit<TextParseOptions, 'delimiter'> = {}) => {
  return parseTextFile(file, { ...options, delimiter: "\t" });
};

// Parse pipe-delimited files
export const parsePipeDelimited = (file: File, options: Omit<TextParseOptions, 'delimiter'> = {}) => {
  return parseTextFile(file, { ...options, delimiter: "|" });
};
