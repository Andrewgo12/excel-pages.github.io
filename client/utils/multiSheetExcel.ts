import * as XLSX from "xlsx";
import { ExcelData, ExcelColumn, SheetData } from "@shared/excel-types";

export interface SheetAnalysis {
  name: string;
  rowCount: number;
  columnCount: number;
  tableRegions: TableRegion[];
  dataTypes: Record<string, string>;
  summary: string;
  isEmpty: boolean;
  hasHeaders: boolean;
  estimatedSize: string;
}

export interface TableRegion {
  id: string;
  name: string;
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  columnHeaders: string[];
  rowCount: number;
  confidence: number; // 0-1, how confident we are this is a table
}

export interface SheetRelationship {
  sourceSheet: string;
  targetSheet: string;
  sourceColumn: string;
  targetColumn: string;
  matchType: "exact" | "partial" | "fuzzy";
  matchCount: number;
  matchPercentage: number;
  relationship: "one_to_one" | "one_to_many" | "many_to_many";
  confidence: number;
}

export interface MultiSheetAnalysis {
  totalSheets: number;
  totalRows: number;
  totalColumns: number;
  sheetAnalyses: SheetAnalysis[];
  relationships: SheetRelationship[];
  estimatedComplexity: "simple" | "moderate" | "complex" | "very_complex";
  recommendedStartSheet: string;
  processingTime: number;
}

// Enhanced Excel loader that processes all sheets
export const loadCompleteExcelFile = async (
  file: File,
): Promise<{ data: ExcelData; analysis: MultiSheetAnalysis }> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        const workbook = XLSX.read(fileData, { type: "binary" });

        // Process all sheets
        const sheetsData: Record<string, SheetData> = {};
        const sheetAnalyses: SheetAnalysis[] = [];
        let totalRows = 0;
        let totalColumns = 0;

        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON with header detection
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            // Empty sheet
            sheetAnalyses.push({
              name: sheetName,
              rowCount: 0,
              columnCount: 0,
              tableRegions: [],
              dataTypes: {},
              summary: "Hoja vacía",
              isEmpty: true,
              hasHeaders: false,
              estimatedSize: "0 KB",
            });
            return;
          }

          // Detect table regions and headers
          const analysis = analyzeSheetStructure(jsonData, sheetName);
          sheetAnalyses.push(analysis);

          // Process the main table region (usually the first/largest one)
          const mainRegion = analysis.tableRegions[0];
          if (mainRegion) {
            const headers = mainRegion.columnHeaders;
            const rows = jsonData
              .slice(mainRegion.startRow + 1, mainRegion.endRow + 1)
              .map((row: any[], index) => {
                const rowData: Record<string, any> = {
                  _id: `${sheetName}_${index}`,
                };
                headers.forEach((header, colIndex) => {
                  const cellValue = row[mainRegion.startCol + colIndex];
                  rowData[header] = cellValue !== undefined ? cellValue : "";
                });
                return rowData;
              })
              .filter((row) => Object.values(row).some((val) => val !== "")); // Remove empty rows

            const columns: ExcelColumn[] = headers.map((header) => ({
              key: header,
              label: header,
              type: inferColumnType(rows, header),
            }));

            sheetsData[sheetName] = {
              columns,
              rows,
            };

            totalRows += rows.length;
            totalColumns = Math.max(totalColumns, columns.length);
          }
        });

        // Determine recommended start sheet
        const recommendedStartSheet = determineRecommendedSheet(sheetAnalyses);

        // Analyze relationships between sheets
        const relationships = analyzeSheetRelationships(sheetsData);

        // Calculate complexity
        const complexity = calculateComplexity(sheetAnalyses, relationships);

        // Build the main ExcelData object using the recommended sheet
        const activeSheetData = sheetsData[recommendedStartSheet];
        const excelData: ExcelData = {
          columns: activeSheetData?.columns || [],
          rows: activeSheetData?.rows || [],
          sheetNames: workbook.SheetNames,
          activeSheet: recommendedStartSheet,
          sheetsData,
        };

        const analysis: MultiSheetAnalysis = {
          totalSheets: workbook.SheetNames.length,
          totalRows,
          totalColumns,
          sheetAnalyses,
          relationships,
          estimatedComplexity: complexity,
          recommendedStartSheet,
          processingTime: Date.now() - startTime,
        };

        resolve({ data: excelData, analysis });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Error reading file"));
    reader.readAsBinaryString(file);
  });
};

// Analyze the structure of a single sheet
const analyzeSheetStructure = (
  jsonData: any[][],
  sheetName: string,
): SheetAnalysis => {
  const rowCount = jsonData.length;
  const columnCount = Math.max(...jsonData.map((row) => row.length));

  // Detect table regions
  const tableRegions = detectTableRegions(jsonData);

  // Analyze data types
  const dataTypes: Record<string, string> = {};
  if (tableRegions.length > 0) {
    const mainRegion = tableRegions[0];
    mainRegion.columnHeaders.forEach((header, index) => {
      const columnData = jsonData
        .slice(mainRegion.startRow + 1, mainRegion.endRow + 1)
        .map((row) => row[mainRegion.startCol + index])
        .filter((val) => val !== undefined && val !== null && val !== "");

      dataTypes[header] = inferColumnTypeFromArray(columnData);
    });
  }

  // Generate summary
  let summary = `${rowCount.toLocaleString()} filas`;
  if (tableRegions.length > 0) {
    summary += `, ${tableRegions.length} tabla${tableRegions.length > 1 ? "s" : ""}`;
  }

  // Estimate size
  const estimatedSize = estimateSheetSize(jsonData);

  return {
    name: sheetName,
    rowCount,
    columnCount,
    tableRegions,
    dataTypes,
    summary,
    isEmpty: rowCount === 0,
    hasHeaders: tableRegions.some((region) => region.confidence > 0.7),
    estimatedSize,
  };
};

// Detect table regions within a sheet
const detectTableRegions = (jsonData: any[][]): TableRegion[] => {
  const regions: TableRegion[] = [];

  if (jsonData.length === 0) return regions;

  // Simple algorithm: look for rectangular regions with headers
  for (let startRow = 0; startRow < Math.min(jsonData.length, 10); startRow++) {
    const row = jsonData[startRow];
    if (!row || row.length === 0) continue;

    // Check if this row could be headers
    const nonEmptyHeaders = row.filter(
      (cell) => cell !== undefined && cell !== null && cell !== "",
    );

    if (nonEmptyHeaders.length < 2) continue; // Need at least 2 columns

    // Find the extent of this table
    let endRow = startRow;
    let hasData = false;

    for (let checkRow = startRow + 1; checkRow < jsonData.length; checkRow++) {
      const dataRow = jsonData[checkRow];
      if (!dataRow) break;

      const nonEmptyData = dataRow.filter(
        (cell) => cell !== undefined && cell !== null && cell !== "",
      );

      if (nonEmptyData.length === 0) {
        // Empty row might be end of table
        if (hasData) break;
      } else {
        hasData = true;
        endRow = checkRow;
      }

      // Stop if we've gone too far without data
      if (checkRow - endRow > 5) break;
    }

    if (hasData && endRow > startRow) {
      const startCol = 0;
      const endCol =
        Math.max(
          ...jsonData.slice(startRow, endRow + 1).map((row) => row.length),
        ) - 1;

      regions.push({
        id: `table_${startRow}_${startCol}`,
        name: `Tabla ${regions.length + 1}`,
        startRow,
        endRow,
        startCol,
        endCol,
        columnHeaders: row
          .slice(startCol, endCol + 1)
          .map((h) => String(h || `Col${startCol + row.indexOf(h)}`)),
        rowCount: endRow - startRow,
        confidence: calculateTableConfidence(
          jsonData,
          startRow,
          endRow,
          startCol,
          endCol,
        ),
      });

      // Skip ahead to avoid overlapping regions
      startRow = endRow + 1;
    }
  }

  return regions.sort((a, b) => b.confidence - a.confidence);
};

// Calculate confidence that a region is actually a table
const calculateTableConfidence = (
  jsonData: any[][],
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
): number => {
  let confidence = 0.5; // Base confidence

  // Check if headers look like headers (text, not numbers)
  const headers = jsonData[startRow];
  if (headers) {
    const textHeaders = headers
      .slice(startCol, endCol + 1)
      .filter(
        (h) => typeof h === "string" && h.length > 0 && isNaN(Number(h)),
      ).length;
    confidence += (textHeaders / (endCol - startCol + 1)) * 0.3;
  }

  // Check data consistency
  let consistentRows = 0;
  const expectedColumns = endCol - startCol + 1;

  for (let row = startRow + 1; row <= endRow; row++) {
    const dataRow = jsonData[row];
    if (dataRow) {
      const nonEmptyData = dataRow
        .slice(startCol, endCol + 1)
        .filter(
          (cell) => cell !== undefined && cell !== null && cell !== "",
        ).length;

      if (nonEmptyData >= expectedColumns * 0.5) {
        // At least 50% filled
        consistentRows++;
      }
    }
  }

  if (endRow - startRow > 0) {
    confidence += (consistentRows / (endRow - startRow)) * 0.2;
  }

  return Math.min(confidence, 1);
};

// Analyze relationships between sheets
const analyzeSheetRelationships = (
  sheetsData: Record<string, SheetData>,
): SheetRelationship[] => {
  const relationships: SheetRelationship[] = [];
  const sheetNames = Object.keys(sheetsData);

  // Compare each pair of sheets
  for (let i = 0; i < sheetNames.length; i++) {
    for (let j = i + 1; j < sheetNames.length; j++) {
      const sourceSheet = sheetNames[i];
      const targetSheet = sheetNames[j];
      const sourceData = sheetsData[sourceSheet];
      const targetData = sheetsData[targetSheet];

      if (!sourceData || !targetData) continue;

      // Compare each column in source with each column in target
      sourceData.columns.forEach((sourceCol) => {
        targetData.columns.forEach((targetCol) => {
          const relationship = analyzeColumnRelationship(
            sourceData.rows,
            sourceCol.key,
            targetData.rows,
            targetCol.key,
          );

          if (relationship.matchPercentage > 0.1) {
            // At least 10% match
            relationships.push({
              sourceSheet,
              targetSheet,
              sourceColumn: sourceCol.key,
              targetColumn: targetCol.key,
              ...relationship,
            });
          }
        });
      });
    }
  }

  return relationships.sort((a, b) => b.confidence - a.confidence);
};

// Analyze relationship between two columns
const analyzeColumnRelationship = (
  sourceRows: Record<string, any>[],
  sourceColumn: string,
  targetRows: Record<string, any>[],
  targetColumn: string,
) => {
  const sourceValues = sourceRows
    .map((row) => String(row[sourceColumn] || ""))
    .filter((v) => v !== "");
  const targetValues = targetRows
    .map((row) => String(row[targetColumn] || ""))
    .filter((v) => v !== "");

  if (sourceValues.length === 0 || targetValues.length === 0) {
    return {
      matchType: "exact" as const,
      matchCount: 0,
      matchPercentage: 0,
      relationship: "one_to_one" as const,
      confidence: 0,
    };
  }

  // Count exact matches
  const sourceSet = new Set(sourceValues);
  const targetSet = new Set(targetValues);
  const intersection = new Set([...sourceSet].filter((x) => targetSet.has(x)));

  const matchCount = intersection.size;
  const matchPercentage =
    (matchCount / Math.max(sourceSet.size, targetSet.size)) * 100;

  // Determine relationship type
  let relationship: "one_to_one" | "one_to_many" | "many_to_many" =
    "one_to_one";

  if (matchCount > 0) {
    const sourceUnique = sourceSet.size;
    const targetUnique = targetSet.size;

    if (sourceUnique === targetUnique && matchCount === sourceUnique) {
      relationship = "one_to_one";
    } else if (sourceUnique < targetUnique) {
      relationship = "one_to_many";
    } else {
      relationship = "many_to_many";
    }
  }

  const confidence = matchPercentage / 100;

  return {
    matchType: "exact" as const,
    matchCount,
    matchPercentage,
    relationship,
    confidence,
  };
};

// Determine the recommended starting sheet
const determineRecommendedSheet = (analyses: SheetAnalysis[]): string => {
  if (analyses.length === 0) return "";

  // Score each sheet
  const scored = analyses.map((analysis) => {
    let score = 0;

    // Prefer sheets with data
    if (!analysis.isEmpty) score += 10;

    // Prefer sheets with headers
    if (analysis.hasHeaders) score += 5;

    // Prefer sheets with more rows (but not too many)
    if (analysis.rowCount > 0) {
      if (analysis.rowCount <= 1000) {
        score += Math.min(analysis.rowCount / 100, 5);
      } else {
        score += 5 - Math.min((analysis.rowCount - 1000) / 10000, 3);
      }
    }

    // Prefer sheets with multiple tables
    score += Math.min(analysis.tableRegions.length, 3);

    // Bonus for sheets that look like main data
    if (
      analysis.name.toLowerCase().includes("data") ||
      analysis.name.toLowerCase().includes("main") ||
      analysis.name.toLowerCase().includes("principal")
    ) {
      score += 3;
    }

    return { analysis, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].analysis.name;
};

// Calculate overall complexity
const calculateComplexity = (
  analyses: SheetAnalysis[],
  relationships: SheetRelationship[],
): "simple" | "moderate" | "complex" | "very_complex" => {
  const sheetCount = analyses.length;
  const totalRows = analyses.reduce((sum, a) => sum + a.rowCount, 0);
  const totalTables = analyses.reduce(
    (sum, a) => sum + a.tableRegions.length,
    0,
  );
  const relationshipCount = relationships.filter(
    (r) => r.confidence > 0.3,
  ).length;

  let complexity = 0;

  // Sheet count factor
  if (sheetCount <= 3) complexity += 1;
  else if (sheetCount <= 10) complexity += 2;
  else if (sheetCount <= 25) complexity += 3;
  else complexity += 4;

  // Data volume factor
  if (totalRows <= 1000) complexity += 1;
  else if (totalRows <= 10000) complexity += 2;
  else if (totalRows <= 100000) complexity += 3;
  else complexity += 4;

  // Table structure factor
  if (totalTables <= 5) complexity += 1;
  else if (totalTables <= 15) complexity += 2;
  else if (totalTables <= 30) complexity += 3;
  else complexity += 4;

  // Relationship factor
  if (relationshipCount <= 2) complexity += 1;
  else if (relationshipCount <= 10) complexity += 2;
  else if (relationshipCount <= 25) complexity += 3;
  else complexity += 4;

  // Determine complexity level
  if (complexity <= 4) return "simple";
  else if (complexity <= 8) return "moderate";
  else if (complexity <= 12) return "complex";
  else return "very_complex";
};

// Utility functions
const inferColumnType = (
  rows: Record<string, any>[],
  column: string,
): "text" | "number" | "date" | "boolean" => {
  const sample = rows
    .slice(0, 10)
    .map((row) => row[column])
    .filter((val) => val !== null && val !== undefined && val !== "");

  if (sample.length === 0) return "text";

  if (sample.every((val) => !isNaN(Number(val)))) return "number";
  if (sample.every((val) => !isNaN(Date.parse(val)))) return "date";
  if (
    sample.every(
      (val) =>
        val === true || val === false || val === "true" || val === "false",
    )
  )
    return "boolean";

  return "text";
};

const inferColumnTypeFromArray = (values: any[]): string => {
  if (values.length === 0) return "text";

  const numberCount = values.filter((v) => !isNaN(Number(v))).length;
  const dateCount = values.filter((v) => !isNaN(Date.parse(v))).length;
  const boolCount = values.filter(
    (v) => v === true || v === false || v === "true" || v === "false",
  ).length;

  const total = values.length;

  if (numberCount / total > 0.8) return "number";
  if (dateCount / total > 0.8) return "date";
  if (boolCount / total > 0.8) return "boolean";

  return "text";
};

const estimateSheetSize = (jsonData: any[][]): string => {
  let totalChars = 0;

  jsonData.forEach((row) => {
    row.forEach((cell) => {
      if (cell !== null && cell !== undefined) {
        totalChars += String(cell).length;
      }
    });
  });

  const bytes = totalChars * 2; // Rough estimate

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${Math.round(bytes / (1024 * 1024))} MB`;
};

// Performance optimization utilities
export const optimizeSheetForDisplay = (
  sheetData: SheetData,
  maxRows: number = 1000,
): SheetData => {
  if (sheetData.rows.length <= maxRows) {
    return sheetData;
  }

  // Sample data for large sheets
  const sampleStep = Math.ceil(sheetData.rows.length / maxRows);
  const sampledRows = sheetData.rows.filter(
    (_, index) => index % sampleStep === 0,
  );

  return {
    ...sheetData,
    rows: sampledRows,
  };
};

export const preloadSheet = async (
  sheetData: SheetData,
): Promise<SheetData> => {
  // Pre-process and cache frequently used computations
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sheetData);
    }, 0);
  });
};
