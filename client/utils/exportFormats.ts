import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExcelColumn } from '@shared/excel-types';

export interface ExportOptions {
  filename?: string;
  selectedColumns?: string[];
  includeHeaders?: boolean;
  includeStats?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  dateFormat?: string;
  numberFormat?: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
}

// CSV Export
export const exportToCSV = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
): ExportResult => {
  try {
    const {
      filename = 'data-export.csv',
      selectedColumns = columns.map(c => c.key),
      includeHeaders = true
    } = options;

    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    let csvContent = '';
    
    // Add headers
    if (includeHeaders) {
      const headers = filteredColumns.map(col => `"${col.label}"`);
      csvContent += headers.join(',') + '\n';
    }
    
    // Add data rows
    data.forEach(row => {
      const values = filteredColumns.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        
        // Handle different data types
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }
        
        return `"${String(value)}"`;
      });
      
      csvContent += values.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: `Archivo CSV exportado: ${link.download}`,
      filename: link.download
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar CSV: ${error}`
    };
  }
};

// JSON Export
export const exportToJSON = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
): ExportResult => {
  try {
    const {
      filename = 'data-export.json',
      selectedColumns = columns.map(c => c.key),
      includeStats = false
    } = options;

    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    // Prepare export data
    const exportData = data.map(row => {
      const filteredRow: Record<string, any> = {};
      filteredColumns.forEach(col => {
        filteredRow[col.key] = row[col.key];
      });
      return filteredRow;
    });
    
    // Prepare metadata
    const metadata = {
      exportDate: new Date().toISOString(),
      totalRows: data.length,
      totalColumns: filteredColumns.length,
      columns: filteredColumns.map(col => ({
        key: col.key,
        label: col.label,
        type: col.type
      }))
    };
    
    // Create final JSON structure
    const jsonStructure = {
      metadata,
      data: exportData,
      ...(includeStats && {
        statistics: {
          rowCount: data.length,
          columnCount: filteredColumns.length,
          nonEmptyValues: exportData.reduce((sum, row) => {
            return sum + Object.values(row).filter(val => val !== null && val !== undefined && val !== '').length;
          }, 0)
        }
      })
    };
    
    const jsonContent = JSON.stringify(jsonStructure, null, 2);
    
    // Create and download file
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: `Archivo JSON exportado: ${link.download}`,
      filename: link.download
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar JSON: ${error}`
    };
  }
};

// Excel Export (Enhanced)
export const exportToExcel = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
): ExportResult => {
  try {
    const {
      filename = 'data-export.xlsx',
      selectedColumns = columns.map(c => c.key),
      includeHeaders = true,
      includeStats = false
    } = options;

    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    // Prepare main data
    const exportData = data.map(row => {
      const exportRow: Record<string, any> = {};
      filteredColumns.forEach(col => {
        exportRow[col.label] = row[col.key];
      });
      return exportRow;
    });
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Add main data sheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    
    // Add statistics sheet if requested
    if (includeStats) {
      const statsData = filteredColumns.map(col => {
        const values = data.map(row => row[col.key]).filter(val => val !== null && val !== undefined && val !== '');
        
        const stats: Record<string, any> = {
          'Columna': col.label,
          'Tipo': col.type,
          'Total de valores': values.length,
          'Valores únicos': new Set(values).size,
          'Valores nulos': data.length - values.length
        };
        
        if (col.type === 'number') {
          const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
          if (numericValues.length > 0) {
            stats['Suma'] = numericValues.reduce((sum, val) => sum + val, 0);
            stats['Promedio'] = stats['Suma'] / numericValues.length;
            stats['Mínimo'] = Math.min(...numericValues);
            stats['Máximo'] = Math.max(...numericValues);
          }
        }
        
        return stats;
      });
      
      const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');
    }
    
    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([
      { 'Propiedad': 'Fecha de exportación', 'Valor': new Date().toLocaleString('es-ES') },
      { 'Propiedad': 'Total de filas', 'Valor': data.length },
      { 'Propiedad': 'Total de columnas', 'Valor': filteredColumns.length },
      { 'Propiedad': 'Columnas exportadas', 'Valor': filteredColumns.map(c => c.label).join(', ') }
    ]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadatos');
    
    // Download file
    XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    
    return {
      success: true,
      message: `Archivo Excel exportado: ${filename}`,
      filename: filename
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar Excel: ${error}`
    };
  }
};

// PDF Export
export const exportToPDF = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
): ExportResult => {
  try {
    const {
      filename = 'data-export.pdf',
      selectedColumns = columns.map(c => c.key),
      includeHeaders = true,
      includeStats = false,
      pageOrientation = 'landscape'
    } = options;

    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    // Create PDF document
    const doc = new jsPDF({
      orientation: pageOrientation,
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(16);
    doc.text('Reporte de Datos - Excel Data Explorer', 20, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Fecha de exportación: ${new Date().toLocaleString('es-ES')}`, 20, 30);
    doc.text(`Total de filas: ${data.length}`, 20, 35);
    doc.text(`Total de columnas: ${filteredColumns.length}`, 20, 40);
    
    // Prepare table data
    const headers = filteredColumns.map(col => col.label);
    const tableData = data.slice(0, 1000).map(row => // Limit to 1000 rows for PDF
      filteredColumns.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';
        
        // Format values based on type
        if (col.type === 'number' && typeof value === 'number') {
          return value.toLocaleString('es-ES');
        }
        
        return String(value);
      })
    );
    
    // Add main data table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 50,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 50, left: 20, right: 20 },
      tableWidth: 'auto',
      columnStyles: filteredColumns.reduce((styles, col, index) => {
        styles[index] = { cellWidth: 'auto' };
        return styles;
      }, {} as any)
    });
    
    // Add statistics page if requested
    if (includeStats) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Estadísticas por Columna', 20, 20);
      
      const statsData = filteredColumns.map(col => {
        const values = data.map(row => row[col.key]).filter(val => val !== null && val !== undefined && val !== '');
        
        const stats = [
          col.label,
          col.type,
          values.length.toString(),
          new Set(values).size.toString(),
          (data.length - values.length).toString()
        ];
        
        if (col.type === 'number') {
          const numericValues = values.map(val => Number(val)).filter(val => !isNaN(val));
          if (numericValues.length > 0) {
            const sum = numericValues.reduce((sum, val) => sum + val, 0);
            const avg = sum / numericValues.length;
            stats.push(
              sum.toLocaleString('es-ES'),
              avg.toLocaleString('es-ES'),
              Math.min(...numericValues).toLocaleString('es-ES'),
              Math.max(...numericValues).toLocaleString('es-ES')
            );
          }
        }
        
        return stats;
      });
      
      const statsHeaders = ['Columna', 'Tipo', 'Valores', 'Únicos', 'Nulos'];
      if (filteredColumns.some(col => col.type === 'number')) {
        statsHeaders.push('Suma', 'Promedio', 'Mínimo', 'Máximo');
      }
      
      autoTable(doc, {
        head: [statsHeaders],
        body: statsData,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] }
      });
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por Excel Data Explorer`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Download file
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    doc.save(finalFilename);
    
    return {
      success: true,
      message: `Archivo PDF exportado: ${finalFilename}`,
      filename: finalFilename
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar PDF: ${error}`
    };
  }
};

// XML Export
export const exportToXML = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  options: ExportOptions = {}
): ExportResult => {
  try {
    const {
      filename = 'data-export.xml',
      selectedColumns = columns.map(c => c.key)
    } = options;

    const filteredColumns = columns.filter(col => selectedColumns.includes(col.key));
    
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<dataset>\n';
    
    // Add metadata
    xmlContent += '  <metadata>\n';
    xmlContent += `    <exportDate>${new Date().toISOString()}</exportDate>\n`;
    xmlContent += `    <totalRows>${data.length}</totalRows>\n`;
    xmlContent += `    <totalColumns>${filteredColumns.length}</totalColumns>\n`;
    xmlContent += '    <columns>\n';
    
    filteredColumns.forEach(col => {
      xmlContent += `      <column key="${col.key}" type="${col.type}">${col.label}</column>\n`;
    });
    
    xmlContent += '    </columns>\n';
    xmlContent += '  </metadata>\n';
    
    // Add data
    xmlContent += '  <data>\n';
    
    data.forEach((row, index) => {
      xmlContent += `    <row id="${index + 1}">\n`;
      
      filteredColumns.forEach(col => {
        const value = row[col.key];
        const escapedValue = String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        
        xmlContent += `      <${col.key}>${escapedValue}</${col.key}>\n`;
      });
      
      xmlContent += '    </row>\n';
    });
    
    xmlContent += '  </data>\n';
    xmlContent += '</dataset>';
    
    // Create and download file
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.xml') ? filename : `${filename}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      message: `Archivo XML exportado: ${link.download}`,
      filename: link.download
    };
  } catch (error) {
    return {
      success: false,
      message: `Error al exportar XML: ${error}`
    };
  }
};

// Get export format info
export const getExportFormatInfo = () => [
  {
    key: 'csv',
    name: 'CSV',
    description: 'Archivo de valores separados por comas',
    extension: '.csv',
    mimeType: 'text/csv',
    features: ['Compatible con Excel', 'Ligero', 'Universal']
  },
  {
    key: 'excel',
    name: 'Excel',
    description: 'Archivo de Excel con múltiples hojas',
    extension: '.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    features: ['Múltiples hojas', 'Formato nativo', 'Estadísticas incluidas']
  },
  {
    key: 'json',
    name: 'JSON',
    description: 'Formato de intercambio de datos JavaScript',
    extension: '.json',
    mimeType: 'application/json',
    features: ['Estructura preservada', 'Metadatos incluidos', 'APIs friendly']
  },
  {
    key: 'pdf',
    name: 'PDF',
    description: 'Documento PDF para reportes',
    extension: '.pdf',
    mimeType: 'application/pdf',
    features: ['Listo para imprimir', 'Formato profesional', 'No editable']
  },
  {
    key: 'xml',
    name: 'XML',
    description: 'Formato de datos estructurados XML',
    extension: '.xml',
    mimeType: 'application/xml',
    features: ['Estructura jerárquica', 'Metadatos incluidos', 'Estándar web']
  }
];
