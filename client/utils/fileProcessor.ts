import { ExcelData } from "@shared/excel-types";
import { loadCompleteExcelFile, MultiSheetAnalysis } from "./multiSheetExcel";
import { parseCSV, detectCSVDelimiter, CSVParseResult } from "./csvParser";
import { convertJSONToTable, parseJSONLines, detectJSONFormat, JSONToTableResult } from "./jsonToTable";
import { parseTextFile, parseTSV, parsePipeDelimited, TextParseResult } from "./textParser";

export interface FileProcessorResult {
  data: ExcelData;
  analysis?: MultiSheetAnalysis;
  warnings: string[];
  metadata: {
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    detectedFormat: string;
    processingTime: number;
    stats: {
      totalRows: number;
      totalColumns: number;
      [key: string]: any;
    };
  };
}

export interface ProcessingOptions {
  maxRows?: number;
  sampleSize?: number;
  encoding?: string;
  autoDetectDelimiter?: boolean;
  hasHeader?: boolean;
  delimiter?: string;
  jsonOptions?: {
    maxDepth?: number;
    arrayHandling?: "separate_rows" | "join_string" | "count_only";
    objectHandling?: "flatten" | "stringify" | "separate_columns";
  };
}

// Main file processor function
export const processFile = async (
  file: File,
  options: ProcessingOptions = {}
): Promise<FileProcessorResult> => {
  const startTime = Date.now();
  
  try {
    // Detect file format
    const format = detectFileFormat(file);
    
    let result: FileProcessorResult;
    
    switch (format) {
      case "excel":
        result = await processExcelFile(file, options);
        break;
      case "csv":
        result = await processCSVFile(file, options);
        break;
      case "json":
        result = await processJSONFile(file, options);
        break;
      case "jsonl":
        result = await processJSONLFile(file, options);
        break;
      case "tsv":
        result = await processTSVFile(file, options);
        break;
      case "txt":
        result = await processTextFile(file, options);
        break;
      case "pipe":
        result = await processPipeDelimitedFile(file, options);
        break;
      default:
        throw new Error(`Formato de archivo no soportado: ${format}`);
    }

    // Add common metadata
    result.metadata = {
      ...result.metadata,
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: format,
      processingTime: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    throw new Error(`Error procesando archivo: ${error}`);
  }
};

// File format detection
const detectFileFormat = (file: File): string => {
  const filename = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Excel files
  if (filename.endsWith(".xlsx") || filename.endsWith(".xls") ||
      mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return "excel";
  }

  // CSV files
  if (filename.endsWith(".csv") || mimeType === "text/csv") {
    return "csv";
  }

  // TSV files
  if (filename.endsWith(".tsv") || filename.endsWith(".tab")) {
    return "tsv";
  }

  // JSON files
  if (filename.endsWith(".json") || mimeType === "application/json") {
    return "json";
  }

  // JSON Lines
  if (filename.endsWith(".jsonl") || filename.endsWith(".ndjson") || filename.endsWith(".ldjson")) {
    return "jsonl";
  }

  // Text files with specific patterns
  if (filename.includes("pipe") || filename.includes(".psv")) {
    return "pipe";
  }

  // Generic text files
  if (filename.endsWith(".txt") || filename.endsWith(".dat") || 
      mimeType.startsWith("text/") || mimeType === "application/octet-stream") {
    return "txt";
  }

  // Default to text for unknown formats
  return "txt";
};

// Process Excel files
const processExcelFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const { data, analysis } = await loadCompleteExcelFile(file);
  
  // Apply row limit if specified
  if (options.maxRows && data.rows.length > options.maxRows) {
    data.rows = data.rows.slice(0, options.maxRows);
  }

  return {
    data,
    analysis,
    warnings: [],
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "excel",
      processingTime: 0, // Will be set by main function
      stats: {
        totalRows: data.rows.length,
        totalColumns: data.columns.length,
        totalSheets: data.sheetNames.length,
        complexity: analysis?.estimatedComplexity,
        relationships: analysis?.relationships.length || 0,
      },
    },
  };
};

// Process CSV files
const processCSVFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  // Auto-detect delimiter if needed
  let delimiter = options.delimiter;
  if (options.autoDetectDelimiter !== false && !delimiter) {
    const text = await readFileSample(file, 1024);
    delimiter = detectCSVDelimiter(text);
  }

  const result = await parseCSV(file, {
    delimiter,
    hasHeader: options.hasHeader,
    encoding: options.encoding,
    maxRows: options.maxRows,
    sampleSize: options.sampleSize,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "csv",
      processingTime: 0,
      stats: {
        ...result.stats,
        delimiter,
        hasHeader: options.hasHeader ?? true,
      },
    },
  };
};

// Process JSON files
const processJSONFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const result = await convertJSONToTable(file, {
    maxRows: options.maxRows,
    ...options.jsonOptions,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "json",
      processingTime: 0,
      stats: {
        ...result.stats,
        jsonOptions: options.jsonOptions,
      },
    },
  };
};

// Process JSON Lines files
const processJSONLFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const result = await parseJSONLines(file, {
    maxRows: options.maxRows,
    ...options.jsonOptions,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "jsonl",
      processingTime: 0,
      stats: {
        ...result.stats,
        jsonOptions: options.jsonOptions,
      },
    },
  };
};

// Process TSV files
const processTSVFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const result = await parseTSV(file, {
    hasHeader: options.hasHeader,
    encoding: options.encoding,
    maxRows: options.maxRows,
    sampleSize: options.sampleSize,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "tsv",
      processingTime: 0,
      stats: {
        ...result.stats,
        delimiter: "\t",
        hasHeader: options.hasHeader ?? true,
      },
    },
  };
};

// Process generic text files
const processTextFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const result = await parseTextFile(file, {
    delimiter: options.delimiter,
    hasHeader: options.hasHeader,
    encoding: options.encoding,
    maxRows: options.maxRows,
    sampleSize: options.sampleSize,
    autoDetectDelimiter: options.autoDetectDelimiter,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "txt",
      processingTime: 0,
      stats: {
        ...result.stats,
        detectedFormat: result.detectedFormat,
      },
    },
  };
};

// Process pipe-delimited files
const processPipeDelimitedFile = async (
  file: File,
  options: ProcessingOptions
): Promise<FileProcessorResult> => {
  const result = await parsePipeDelimited(file, {
    hasHeader: options.hasHeader,
    encoding: options.encoding,
    maxRows: options.maxRows,
    sampleSize: options.sampleSize,
  });

  return {
    data: result.data,
    warnings: result.warnings,
    metadata: {
      originalFilename: file.name,
      fileSize: file.size,
      mimeType: file.type,
      detectedFormat: "pipe",
      processingTime: 0,
      stats: {
        ...result.stats,
        delimiter: "|",
        hasHeader: options.hasHeader ?? true,
      },
    },
  };
};

// Helper function to read file sample
const readFileSample = (file: File, sampleSize: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, sampleSize);
    
    reader.onload = (e) => {
      resolve(e.target?.result as string || "");
    };
    
    reader.onerror = () => reject(new Error("Error reading file sample"));
    reader.readAsText(blob, "UTF-8");
  });
};

// Get supported file formats
export const getSupportedFormats = () => [
  {
    category: "Hojas de Cálculo",
    formats: [
      {
        name: "Excel",
        extensions: [".xlsx", ".xls"],
        mimeTypes: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel"
        ],
        description: "Archivos de Microsoft Excel con soporte multi-hoja",
        features: ["Múltiples hojas", "Tipos detectados", "Relaciones entre hojas"],
      }
    ]
  },
  {
    category: "Texto Delimitado",
    formats: [
      {
        name: "CSV",
        extensions: [".csv"],
        mimeTypes: ["text/csv"],
        description: "Valores separados por comas",
        features: ["Auto-detección de delimitador", "Tipos inferidos", "Codificación flexible"],
      },
      {
        name: "TSV",
        extensions: [".tsv", ".tab"],
        mimeTypes: ["text/tab-separated-values"],
        description: "Valores separados por tabulaciones",
        features: ["Formato estándar", "Headers automáticos", "Tipos inferidos"],
      },
      {
        name: "Texto Delimitado",
        extensions: [".txt", ".dat"],
        mimeTypes: ["text/plain"],
        description: "Archivos de texto con delimitadores personalizados",
        features: ["Auto-detección de formato", "Ancho fijo soportado", "Delimitadores múltiples"],
      }
    ]
  },
  {
    category: "Datos Estructurados",
    formats: [
      {
        name: "JSON",
        extensions: [".json"],
        mimeTypes: ["application/json"],
        description: "JavaScript Object Notation",
        features: ["Objetos anidados", "Arrays manejados", "Metadatos preservados"],
      },
      {
        name: "JSON Lines",
        extensions: [".jsonl", ".ndjson", ".ldjson"],
        mimeTypes: ["application/x-ndjson"],
        description: "JSON delimitado por líneas",
        features: ["Streaming eficiente", "Una entrada por línea", "Gran volumen"],
      }
    ]
  }
];

// Validate file before processing
export const validateFile = (file: File): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check file size (100MB limit)
  if (file.size > 100 * 1024 * 1024) {
    errors.push("El archivo es demasiado grande (máximo 100MB)");
  }
  
  // Check if file is empty
  if (file.size === 0) {
    errors.push("El archivo está vacío");
  }
  
  // Check if format is supported
  const format = detectFileFormat(file);
  const supportedFormats = getSupportedFormats()
    .flatMap(cat => cat.formats)
    .flatMap(fmt => fmt.extensions);
  
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!supportedFormats.includes(fileExtension) && format === "txt") {
    // Allow text files but warn about potential issues
    errors.push("Formato de archivo no reconocido, se intentará procesar como texto");
  }
  
  return {
    valid: errors.length === 0 || (errors.length === 1 && errors[0].includes("no reconocido")),
    errors
  };
};

// Batch processing for multiple files
export const processMultipleFiles = async (
  files: File[],
  options: ProcessingOptions = {}
): Promise<{ results: FileProcessorResult[]; errors: { file: string; error: string }[] }> => {
  const results: FileProcessorResult[] = [];
  const errors: { file: string; error: string }[] = [];
  
  for (const file of files) {
    try {
      const validation = validateFile(file);
      if (!validation.valid) {
        errors.push({ 
          file: file.name, 
          error: validation.errors.join(", ")
        });
        continue;
      }
      
      const result = await processFile(file, options);
      results.push(result);
    } catch (error) {
      errors.push({ 
        file: file.name, 
        error: String(error)
      });
    }
  }
  
  return { results, errors };
};
