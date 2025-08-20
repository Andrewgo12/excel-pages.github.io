import { ExcelData, ExcelColumn } from "@shared/excel-types";

export interface JSONToTableOptions {
  maxDepth?: number;
  arrayHandling?: "separate_rows" | "join_string" | "count_only";
  objectHandling?: "flatten" | "stringify" | "separate_columns";
  pathSeparator?: string;
  maxRows?: number;
  inferTypes?: boolean;
}

export interface JSONToTableResult {
  data: ExcelData;
  warnings: string[];
  stats: {
    totalRows: number;
    totalColumns: number;
    nestedObjects: number;
    arrays: number;
    processingTime: number;
  };
}

export const convertJSONToTable = async (
  file: File,
  options: JSONToTableOptions = {}
): Promise<JSONToTableResult> => {
  const startTime = Date.now();
  const {
    maxDepth = 3,
    arrayHandling = "separate_rows",
    objectHandling = "flatten",
    pathSeparator = ".",
    maxRows = 10000,
    inferTypes = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("No se pudo leer el contenido del archivo"));
          return;
        }

        let jsonData: any;
        try {
          jsonData = JSON.parse(text);
        } catch (parseError) {
          reject(new Error(`JSON inválido: ${parseError}`));
          return;
        }

        const warnings: string[] = [];
        const stats = {
          totalRows: 0,
          totalColumns: 0,
          nestedObjects: 0,
          arrays: 0,
          processingTime: 0,
        };

        // Normalize JSON to array of objects
        let normalizedData: Record<string, any>[] = [];

        if (Array.isArray(jsonData)) {
          normalizedData = jsonData;
        } else if (typeof jsonData === "object" && jsonData !== null) {
          // Single object - convert to array
          normalizedData = [jsonData];
        } else {
          reject(new Error("El JSON debe ser un objeto o un array de objetos"));
          return;
        }

        if (normalizedData.length === 0) {
          reject(new Error("No hay datos para procesar"));
          return;
        }

        // Limit rows if specified
        if (maxRows && normalizedData.length > maxRows) {
          normalizedData = normalizedData.slice(0, maxRows);
          warnings.push(`Datos limitados a ${maxRows} filas`);
        }

        // Flatten and process data
        const processedData = normalizedData.map((item, index) => {
          if (typeof item !== "object" || item === null) {
            return { value: item };
          }
          
          return flattenObject(item, "", maxDepth, pathSeparator, objectHandling, arrayHandling, stats);
        });

        // Collect all possible column keys
        const allKeys = new Set<string>();
        processedData.forEach(item => {
          Object.keys(item).forEach(key => allKeys.add(key));
        });

        const columnKeys = Array.from(allKeys).sort();

        // Create columns with type inference
        const columns: ExcelColumn[] = columnKeys.map(key => {
          const sampleValues = processedData
            .slice(0, 100) // Sample first 100 rows for type inference
            .map(item => item[key])
            .filter(val => val !== null && val !== undefined && val !== "");

          const type = inferTypes ? inferColumnTypeFromValues(sampleValues) : "text";

          return {
            key: sanitizeColumnKey(key),
            label: formatColumnLabel(key),
            type,
          };
        });

        // Normalize data rows
        const rows = processedData.map(item => {
          const row: Record<string, any> = {};
          columns.forEach(column => {
            const originalKey = columnKeys.find(k => sanitizeColumnKey(k) === column.key);
            if (originalKey) {
              row[column.key] = item[originalKey] ?? null;
            }
          });
          return row;
        });

        stats.totalRows = rows.length;
        stats.totalColumns = columns.length;
        stats.processingTime = Date.now() - startTime;

        const result: JSONToTableResult = {
          data: {
            columns,
            rows,
            activeSheet: "JSON Data",
            sheetNames: ["JSON Data"],
            sheetsData: {
              "JSON Data": {
                columns,
                rows,
              }
            }
          },
          warnings,
          stats,
        };

        resolve(result);
      } catch (error) {
        reject(new Error(`Error procesando JSON: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsText(file, "UTF-8");
  });
};

// Flatten nested objects
const flattenObject = (
  obj: any,
  prefix: string,
  maxDepth: number,
  separator: string,
  objectHandling: string,
  arrayHandling: string,
  stats: any,
  currentDepth: number = 0
): Record<string, any> => {
  const result: Record<string, any> = {};

  if (currentDepth >= maxDepth) {
    // Max depth reached - stringify the object
    result[prefix || "value"] = JSON.stringify(obj);
    return result;
  }

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = null;
    } else if (Array.isArray(value)) {
      stats.arrays++;
      
      switch (arrayHandling) {
        case "join_string":
          result[newKey] = value.map(v => 
            typeof v === "object" ? JSON.stringify(v) : String(v)
          ).join(", ");
          break;
          
        case "count_only":
          result[newKey] = value.length;
          break;
          
        case "separate_rows":
        default:
          // For now, join as string (separate_rows would require restructuring data)
          result[newKey] = value.map(v => 
            typeof v === "object" ? JSON.stringify(v) : String(v)
          ).join(", ");
          break;
      }
    } else if (typeof value === "object") {
      stats.nestedObjects++;
      
      switch (objectHandling) {
        case "stringify":
          result[newKey] = JSON.stringify(value);
          break;
          
        case "separate_columns":
        case "flatten":
        default:
          // Recursively flatten
          const flattened = flattenObject(
            value,
            newKey,
            maxDepth,
            separator,
            objectHandling,
            arrayHandling,
            stats,
            currentDepth + 1
          );
          Object.assign(result, flattened);
          break;
      }
    } else {
      result[newKey] = value;
    }
  }

  return result;
};

// Infer column type from sample values
const inferColumnTypeFromValues = (values: any[]): "text" | "number" | "date" | "boolean" => {
  if (values.length === 0) return "text";

  // Check for boolean
  if (values.every(val => typeof val === "boolean" || 
    (typeof val === "string" && /^(true|false)$/i.test(val)))) {
    return "boolean";
  }

  // Check for numbers
  if (values.every(val => typeof val === "number" || 
    (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== ""))) {
    return "number";
  }

  // Check for dates
  if (values.every(val => {
    if (typeof val === "string") {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }
    return false;
  })) {
    return "date";
  }

  return "text";
};

// Sanitize column key to be valid identifier
const sanitizeColumnKey = (key: string): string => {
  return key
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^(\d)/, "_$1") // Prefix with underscore if starts with number
    .toLowerCase();
};

// Format column label for display
const formatColumnLabel = (key: string): string => {
  return key
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

// Parse JSON Lines format (JSONL)
export const parseJSONLines = async (
  file: File,
  options: JSONToTableOptions = {}
): Promise<JSONToTableResult> => {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          reject(new Error("No se pudo leer el contenido del archivo"));
          return;
        }

        const lines = text.split(/\r?\n/).filter(line => line.trim());
        const jsonObjects: any[] = [];
        const warnings: string[] = [];

        for (let i = 0; i < lines.length; i++) {
          try {
            const obj = JSON.parse(lines[i]);
            jsonObjects.push(obj);
            
            if (options.maxRows && jsonObjects.length >= options.maxRows) {
              warnings.push(`Limitado a ${options.maxRows} líneas`);
              break;
            }
          } catch (parseError) {
            warnings.push(`Error en línea ${i + 1}: JSON inválido`);
          }
        }

        if (jsonObjects.length === 0) {
          reject(new Error("No se encontraron objetos JSON válidos"));
          return;
        }

        // Convert array to table using existing logic
        convertJSONToTable(
          new File([JSON.stringify(jsonObjects)], "jsonl-data.json", { type: "application/json" }),
          options
        ).then(result => {
          result.warnings = [...result.warnings, ...warnings];
          result.stats.processingTime = Date.now() - startTime;
          resolve(result);
        }).catch(reject);

      } catch (error) {
        reject(new Error(`Error procesando JSONL: ${error}`));
      }
    };

    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsText(file, "UTF-8");
  });
};

// Detect JSON format (regular JSON vs JSON Lines)
export const detectJSONFormat = (text: string): "json" | "jsonl" | "unknown" => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  
  // Try to parse as regular JSON first
  try {
    JSON.parse(text);
    return "json";
  } catch {
    // Not valid JSON, check if it's JSONL
    if (lines.length > 1) {
      let validLines = 0;
      for (const line of lines.slice(0, 5)) { // Check first 5 lines
        try {
          JSON.parse(line);
          validLines++;
        } catch {
          // Invalid line
        }
      }
      
      if (validLines >= Math.min(3, lines.length)) {
        return "jsonl";
      }
    }
  }
  
  return "unknown";
};
