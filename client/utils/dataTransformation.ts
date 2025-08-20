import { ExcelColumn } from "@shared/excel-types";

export interface DataCleaningResult {
  cleanedData: Record<string, any>[];
  report: {
    originalRows: number;
    cleanedRows: number;
    removedRows: number;
    modifiedCells: number;
    duplicatesRemoved: number;
    nullsHandled: number;
    outliersCorrected: number;
  };
  issues: DataQualityIssue[];
}

export interface DataQualityIssue {
  type: "duplicate" | "missing" | "outlier" | "inconsistent" | "invalid_format";
  severity: "low" | "medium" | "high";
  column: string;
  rowIndex: number;
  originalValue: any;
  suggestedValue?: any;
  description: string;
}

export interface TransformationConfig {
  handleMissingValues:
    | "remove"
    | "fill_mean"
    | "fill_median"
    | "fill_mode"
    | "fill_custom"
    | "interpolate";
  customFillValue?: any;
  removeDuplicates: boolean;
  handleOutliers: "remove" | "cap" | "transform" | "ignore";
  outlierMethod: "zscore" | "iqr";
  outlierThreshold: number;
  normalizeText: boolean;
  standardizeFormats: boolean;
  validateDataTypes: boolean;
  createDerivedColumns: boolean;
}

export interface DerivedColumnRule {
  newColumnName: string;
  sourceColumns: string[];
  operation:
    | "sum"
    | "average"
    | "concat"
    | "difference"
    | "ratio"
    | "conditional"
    | "formula";
  parameters: Record<string, any>;
  dataType: "number" | "text" | "date" | "boolean";
}

// Missing value detection and handling
export const detectMissingValues = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
): Record<string, { count: number; percentage: number; indices: number[] }> => {
  const missingReport: Record<
    string,
    { count: number; percentage: number; indices: number[] }
  > = {};

  columns.forEach((column) => {
    const missing = data
      .map((row, index) => ({ value: row[column.key], index }))
      .filter(
        (item) =>
          item.value === null ||
          item.value === undefined ||
          item.value === "" ||
          (typeof item.value === "string" && item.value.trim() === "") ||
          (typeof item.value === "string" &&
            item.value.toLowerCase() === "null") ||
          (typeof item.value === "string" &&
            item.value.toLowerCase() === "n/a") ||
          (typeof item.value === "string" && item.value.toLowerCase() === "na"),
      );

    missingReport[column.key] = {
      count: missing.length,
      percentage: (missing.length / data.length) * 100,
      indices: missing.map((item) => item.index),
    };
  });

  return missingReport;
};

// Fill missing values with different strategies
export const fillMissingValues = (
  data: Record<string, any>[],
  column: string,
  strategy: "mean" | "median" | "mode" | "custom" | "interpolate",
  customValue?: any,
): Record<string, any>[] => {
  const columnData = data
    .map((row) => row[column])
    .filter(
      (val) =>
        val !== null &&
        val !== undefined &&
        val !== "" &&
        val !== "null" &&
        val !== "n/a" &&
        val !== "na",
    );

  let fillValue: any;

  switch (strategy) {
    case "mean":
      const numbers = columnData
        .filter((val) => !isNaN(Number(val)))
        .map(Number);
      fillValue =
        numbers.length > 0
          ? numbers.reduce((a, b) => a + b, 0) / numbers.length
          : 0;
      break;

    case "median":
      const sortedNumbers = columnData
        .filter((val) => !isNaN(Number(val)))
        .map(Number)
        .sort((a, b) => a - b);
      fillValue =
        sortedNumbers.length > 0
          ? sortedNumbers[Math.floor(sortedNumbers.length / 2)]
          : 0;
      break;

    case "mode":
      const frequency: Record<string, number> = {};
      columnData.forEach((val) => {
        frequency[String(val)] = (frequency[String(val)] || 0) + 1;
      });
      fillValue = Object.keys(frequency).reduce(
        (a, b) => (frequency[a] > frequency[b] ? a : b),
        "",
      );
      break;

    case "custom":
      fillValue = customValue;
      break;

    case "interpolate":
      // Linear interpolation for numeric data
      return data.map((row, index) => {
        if (
          row[column] === null ||
          row[column] === undefined ||
          row[column] === ""
        ) {
          const prevIndex = data
            .slice(0, index)
            .findLastIndex(
              (r) =>
                r[column] !== null &&
                r[column] !== undefined &&
                r[column] !== "",
            );
          const nextIndex =
            data
              .slice(index + 1)
              .findIndex(
                (r) =>
                  r[column] !== null &&
                  r[column] !== undefined &&
                  r[column] !== "",
              ) +
            index +
            1;

          if (prevIndex >= 0 && nextIndex < data.length) {
            const prevValue = Number(data[prevIndex][column]);
            const nextValue = Number(data[nextIndex][column]);
            if (!isNaN(prevValue) && !isNaN(nextValue)) {
              const interpolated =
                prevValue +
                ((nextValue - prevValue) * (index - prevIndex)) /
                  (nextIndex - prevIndex);
              return { ...row, [column]: interpolated };
            }
          }
        }
        return row;
      });
  }

  return data.map((row) => {
    if (
      row[column] === null ||
      row[column] === undefined ||
      row[column] === "" ||
      (typeof row[column] === "string" &&
        ["null", "n/a", "na"].includes(row[column].toLowerCase()))
    ) {
      return { ...row, [column]: fillValue };
    }
    return row;
  });
};

// Duplicate detection and removal
export const detectDuplicates = (
  data: Record<string, any>[],
  columns?: string[],
): { duplicateGroups: number[][]; totalDuplicates: number } => {
  const compareColumns =
    columns || Object.keys(data[0] || {}).filter((key) => key !== "_id");
  const groups: Record<string, number[]> = {};

  data.forEach((row, index) => {
    const key = compareColumns.map((col) => String(row[col] || "")).join("|");
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(index);
  });

  const duplicateGroups = Object.values(groups).filter(
    (group) => group.length > 1,
  );
  const totalDuplicates = duplicateGroups.reduce(
    (sum, group) => sum + group.length - 1,
    0,
  );

  return { duplicateGroups, totalDuplicates };
};

export const removeDuplicates = (
  data: Record<string, any>[],
  keepStrategy: "first" | "last" | "mostComplete" = "first",
  columns?: string[],
): Record<string, any>[] => {
  const { duplicateGroups } = detectDuplicates(data, columns);
  const indicesToRemove = new Set<number>();

  duplicateGroups.forEach((group) => {
    let keepIndex = group[0];

    if (keepStrategy === "last") {
      keepIndex = group[group.length - 1];
    } else if (keepStrategy === "mostComplete") {
      // Keep the row with most non-null values
      keepIndex = group.reduce((best, current) => {
        const bestNonNull = Object.values(data[best]).filter(
          (val) => val !== null && val !== undefined && val !== "",
        ).length;
        const currentNonNull = Object.values(data[current]).filter(
          (val) => val !== null && val !== undefined && val !== "",
        ).length;
        return currentNonNull > bestNonNull ? current : best;
      });
    }

    group.forEach((index) => {
      if (index !== keepIndex) {
        indicesToRemove.add(index);
      }
    });
  });

  return data.filter((_, index) => !indicesToRemove.has(index));
};

// Outlier detection and handling
export const detectOutliers = (
  data: Record<string, any>[],
  column: string,
  method: "zscore" | "iqr" = "zscore",
  threshold: number = 3,
): { outliers: number[]; statistics: any } => {
  const values = data
    .map((row, index) => ({ value: Number(row[column]), index }))
    .filter((item) => !isNaN(item.value));

  if (values.length < 3) {
    return { outliers: [], statistics: {} };
  }

  const numbers = values.map((item) => item.value);
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance =
    numbers.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);

  let outliers: number[] = [];

  if (method === "zscore") {
    outliers = values
      .filter((item) => Math.abs((item.value - mean) / stdDev) > threshold)
      .map((item) => item.index);
  } else if (method === "iqr") {
    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    outliers = values
      .filter((item) => item.value < lowerBound || item.value > upperBound)
      .map((item) => item.index);
  }

  return {
    outliers,
    statistics: {
      mean,
      stdDev,
      q1: numbers.sort((a, b) => a - b)[Math.floor(numbers.length * 0.25)],
      q3: numbers.sort((a, b) => a - b)[Math.floor(numbers.length * 0.75)],
      method,
      threshold,
    },
  };
};

export const handleOutliers = (
  data: Record<string, any>[],
  column: string,
  outlierIndices: number[],
  method: "remove" | "cap" | "transform",
): Record<string, any>[] => {
  if (method === "remove") {
    return data.filter((_, index) => !outlierIndices.includes(index));
  }

  const values = data
    .map((row) => Number(row[column]))
    .filter((val) => !isNaN(val));
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.map((row, index) => {
    if (outlierIndices.includes(index)) {
      const value = Number(row[column]);

      if (method === "cap") {
        const cappedValue =
          value < lowerBound
            ? lowerBound
            : value > upperBound
              ? upperBound
              : value;
        return { ...row, [column]: cappedValue };
      } else if (method === "transform") {
        // Log transformation for positive values
        const transformedValue = value > 0 ? Math.log(value) : value;
        return { ...row, [column]: transformedValue };
      }
    }
    return row;
  });
};

// Text normalization
export const normalizeText = (
  data: Record<string, any>[],
  columns: string[],
): Record<string, any>[] => {
  return data.map((row) => {
    const newRow = { ...row };
    columns.forEach((column) => {
      if (typeof row[column] === "string") {
        newRow[column] = row[column]
          .trim()
          .replace(/\s+/g, " ") // Multiple spaces to single space
          .replace(/[^\w\s]/gi, "") // Remove special characters
          .toLowerCase();
      }
    });
    return newRow;
  });
};

// Data type validation and correction
export const validateAndCorrectDataTypes = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
): { correctedData: Record<string, any>[]; issues: DataQualityIssue[] } => {
  const issues: DataQualityIssue[] = [];
  const correctedData = data.map((row, rowIndex) => {
    const newRow = { ...row };

    columns.forEach((column) => {
      const value = row[column.key];

      if (value !== null && value !== undefined && value !== "") {
        switch (column.type) {
          case "number":
            const numValue = Number(value);
            if (isNaN(numValue) && typeof value === "string") {
              // Try to extract number from string
              const match = value.match(/[-+]?(\d+\.?\d*|\.\d+)/);
              if (match) {
                newRow[column.key] = Number(match[0]);
                issues.push({
                  type: "invalid_format",
                  severity: "medium",
                  column: column.key,
                  rowIndex,
                  originalValue: value,
                  suggestedValue: Number(match[0]),
                  description: `Extracted number from text: "${value}" → ${Number(match[0])}`,
                });
              }
            }
            break;

          case "date":
            if (!(value instanceof Date) && typeof value === "string") {
              const dateValue = new Date(value);
              if (!isNaN(dateValue.getTime())) {
                newRow[column.key] = dateValue;
              } else {
                issues.push({
                  type: "invalid_format",
                  severity: "high",
                  column: column.key,
                  rowIndex,
                  originalValue: value,
                  description: `Invalid date format: "${value}"`,
                });
              }
            }
            break;

          case "boolean":
            if (typeof value === "string") {
              const lowerValue = value.toLowerCase();
              if (["true", "1", "yes", "y", "sí", "s"].includes(lowerValue)) {
                newRow[column.key] = true;
              } else if (["false", "0", "no", "n"].includes(lowerValue)) {
                newRow[column.key] = false;
              }
            }
            break;
        }
      }
    });

    return newRow;
  });

  return { correctedData, issues };
};

// Create derived columns
export const createDerivedColumn = (
  data: Record<string, any>[],
  rule: DerivedColumnRule,
): Record<string, any>[] => {
  return data.map((row) => {
    let derivedValue: any;

    switch (rule.operation) {
      case "sum":
        derivedValue = rule.sourceColumns.reduce(
          (sum, col) => sum + (Number(row[col]) || 0),
          0,
        );
        break;

      case "average":
        const validValues = rule.sourceColumns
          .map((col) => Number(row[col]))
          .filter((val) => !isNaN(val));
        derivedValue =
          validValues.length > 0
            ? validValues.reduce((a, b) => a + b, 0) / validValues.length
            : 0;
        break;

      case "concat":
        const separator = rule.parameters.separator || " ";
        derivedValue = rule.sourceColumns
          .map((col) => String(row[col] || ""))
          .join(separator);
        break;

      case "difference":
        if (rule.sourceColumns.length >= 2) {
          derivedValue =
            (Number(row[rule.sourceColumns[0]]) || 0) -
            (Number(row[rule.sourceColumns[1]]) || 0);
        }
        break;

      case "ratio":
        if (rule.sourceColumns.length >= 2) {
          const denominator = Number(row[rule.sourceColumns[1]]) || 1;
          derivedValue =
            (Number(row[rule.sourceColumns[0]]) || 0) / denominator;
        }
        break;

      case "conditional":
        const condition = rule.parameters.condition;
        const trueValue = rule.parameters.trueValue;
        const falseValue = rule.parameters.falseValue;
        // Simple condition evaluation (can be extended)
        derivedValue =
          row[rule.sourceColumns[0]] === condition ? trueValue : falseValue;
        break;

      case "formula":
        // Basic formula evaluation (can be extended with a proper parser)
        try {
          let formula = rule.parameters.formula;
          rule.sourceColumns.forEach((col) => {
            formula = formula.replace(
              new RegExp(`{${col}}`, "g"),
              Number(row[col]) || 0,
            );
          });
          derivedValue = eval(formula); // Note: In production, use a safe formula parser
        } catch (e) {
          derivedValue = null;
        }
        break;

      default:
        derivedValue = null;
    }

    return {
      ...row,
      [rule.newColumnName]: derivedValue,
    };
  });
};

// Main data cleaning function
export const cleanData = (
  data: Record<string, any>[],
  config: TransformationConfig,
  columns: ExcelColumn[],
): DataCleaningResult => {
  let cleanedData = [...data];
  let modifiedCells = 0;
  let duplicatesRemoved = 0;
  let nullsHandled = 0;
  let outliersCorrected = 0;
  const issues: DataQualityIssue[] = [];

  // Handle missing values
  if (config.handleMissingValues !== "remove") {
    columns.forEach((column) => {
      const originalData = [...cleanedData];
      cleanedData = fillMissingValues(
        cleanedData,
        column.key,
        config.handleMissingValues as any,
        config.customFillValue,
      );

      const changes = cleanedData.filter(
        (row, i) => originalData[i][column.key] !== row[column.key],
      ).length;

      nullsHandled += changes;
      modifiedCells += changes;
    });
  }

  // Remove duplicates
  if (config.removeDuplicates) {
    const beforeCount = cleanedData.length;
    cleanedData = removeDuplicates(cleanedData);
    duplicatesRemoved = beforeCount - cleanedData.length;
  }

  // Handle outliers
  if (config.handleOutliers !== "ignore") {
    const numericColumns = columns.filter((col) => col.type === "number");
    numericColumns.forEach((column) => {
      const { outliers } = detectOutliers(
        cleanedData,
        column.key,
        config.outlierMethod,
        config.outlierThreshold,
      );

      if (outliers.length > 0) {
        const beforeCount = cleanedData.length;
        cleanedData = handleOutliers(
          cleanedData,
          column.key,
          outliers,
          config.handleOutliers as any,
        );
        outliersCorrected += beforeCount - cleanedData.length;
      }
    });
  }

  // Normalize text
  if (config.normalizeText) {
    const textColumns = columns
      .filter((col) => col.type === "text")
      .map((col) => col.key);
    if (textColumns.length > 0) {
      cleanedData = normalizeText(cleanedData, textColumns);
      modifiedCells += textColumns.length * cleanedData.length;
    }
  }

  // Validate data types
  if (config.validateDataTypes) {
    const { correctedData, issues: typeIssues } = validateAndCorrectDataTypes(
      cleanedData,
      columns,
    );
    cleanedData = correctedData;
    issues.push(...typeIssues);
    modifiedCells += typeIssues.length;
  }

  return {
    cleanedData,
    report: {
      originalRows: data.length,
      cleanedRows: cleanedData.length,
      removedRows: data.length - cleanedData.length,
      modifiedCells,
      duplicatesRemoved,
      nullsHandled,
      outliersCorrected,
    },
    issues,
  };
};
