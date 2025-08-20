import * as XLSX from "xlsx";

export const loadCompleteExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        
        const sheetNames = workbook.SheetNames;
        const sheetsData = {};
        let largestSheet = null;
        let largestSheetSize = 0;
        
        // Process each sheet
        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            sheetsData[sheetName] = {
              columns: [],
              rows: []
            };
            return;
          }
          
          // Get headers (first row)
          const headers = jsonData[0] || [];
          const dataRows = jsonData.slice(1);
          
          // Create columns structure
          const columns = headers.map((header, index) => ({
            key: `col_${index}`,
            label: String(header || `Column ${index + 1}`),
            type: inferColumnType(dataRows.map(row => row[index]))
          }));
          
          // Convert rows to object format
          const rows = dataRows.map((row, rowIndex) => {
            const rowObject = { _id: rowIndex };
            headers.forEach((_, colIndex) => {
              rowObject[`col_${colIndex}`] = row[colIndex] || "";
            });
            return rowObject;
          });
          
          sheetsData[sheetName] = { columns, rows };
          
          // Track the largest sheet
          if (rows.length > largestSheetSize) {
            largestSheetSize = rows.length;
            largestSheet = sheetName;
          }
        });
        
        // Use the largest sheet as the main data, or first sheet if all are empty
        const activeSheet = largestSheet || sheetNames[0];
        const mainSheetData = sheetsData[activeSheet] || { columns: [], rows: [] };
        
        // Create analysis object
        const analysis = analyzeMultiSheetStructure(sheetsData, sheetNames);
        
        const result = {
          data: {
            columns: mainSheetData.columns,
            rows: mainSheetData.rows,
            sheetNames,
            activeSheet,
            sheetsData
          },
          analysis
        };
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Error processing Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const inferColumnType = (values) => {
  const nonEmptyValues = values.filter(val => val !== null && val !== undefined && val !== "");
  
  if (nonEmptyValues.length === 0) return "text";
  
  // Check if all values are numbers
  if (nonEmptyValues.every(val => !isNaN(Number(val)) && isFinite(val))) {
    return "number";
  }
  
  // Check if all values are dates
  if (nonEmptyValues.every(val => !isNaN(Date.parse(val)))) {
    return "date";
  }
  
  // Check if all values are booleans
  if (nonEmptyValues.every(val => 
    val === true || val === false || 
    String(val).toLowerCase() === "true" || 
    String(val).toLowerCase() === "false"
  )) {
    return "boolean";
  }
  
  return "text";
};

const analyzeMultiSheetStructure = (sheetsData, sheetNames) => {
  const sheetAnalyses = sheetNames.map(name => {
    const sheet = sheetsData[name];
    return {
      name,
      rowCount: sheet.rows.length,
      columnCount: sheet.columns.length,
      isEmpty: sheet.rows.length === 0,
      hasHeaders: sheet.columns.length > 0,
      dataTypes: sheet.columns.map(col => col.type)
    };
  });
  
  // Detect potential relationships between sheets
  const relationships = [];
  
  // Simple relationship detection based on common column names
  for (let i = 0; i < sheetNames.length; i++) {
    for (let j = i + 1; j < sheetNames.length; j++) {
      const sheet1 = sheetsData[sheetNames[i]];
      const sheet2 = sheetsData[sheetNames[j]];
      
      const commonColumns = sheet1.columns.filter(col1 =>
        sheet2.columns.some(col2 => 
          col1.label.toLowerCase() === col2.label.toLowerCase() ||
          col1.label.toLowerCase().includes('id') && col2.label.toLowerCase().includes('id')
        )
      );
      
      if (commonColumns.length > 0) {
        relationships.push({
          sourceSheet: sheetNames[i],
          targetSheet: sheetNames[j],
          commonColumns: commonColumns.map(col => col.label),
          type: "potential_foreign_key"
        });
      }
    }
  }
  
  // Determine complexity
  const totalRows = sheetAnalyses.reduce((sum, sheet) => sum + sheet.rowCount, 0);
  const totalSheets = sheetNames.length;
  
  let estimatedComplexity = "simple";
  if (totalSheets > 5 || totalRows > 10000 || relationships.length > 3) {
    estimatedComplexity = "very_complex";
  } else if (totalSheets > 3 || totalRows > 5000 || relationships.length > 1) {
    estimatedComplexity = "complex";
  } else if (totalSheets > 1 || totalRows > 1000) {
    estimatedComplexity = "moderate";
  }
  
  // Recommend starting sheet (largest non-empty sheet)
  const nonEmptySheets = sheetAnalyses.filter(sheet => !sheet.isEmpty);
  const recommendedStartSheet = nonEmptySheets.length > 0 
    ? nonEmptySheets.sort((a, b) => b.rowCount - a.rowCount)[0].name
    : sheetNames[0];
  
  return {
    sheetAnalyses,
    relationships,
    estimatedComplexity,
    recommendedStartSheet,
    processingTime: Date.now() % 1000 // Simple placeholder
  };
};

export const optimizeSheetForDisplay = (sheetData, maxRows = 5000) => {
  if (sheetData.rows.length <= maxRows) {
    return sheetData;
  }
  
  // Take first maxRows for display
  return {
    columns: sheetData.columns,
    rows: sheetData.rows.slice(0, maxRows)
  };
};

export { analyzeMultiSheetStructure };
