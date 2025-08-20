import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ExcelColumn } from "@shared/excel-types";
import {
  exportToCSV,
  exportToJSON,
  exportToExcel,
  exportToPDF,
  exportToXML,
  getExportFormatInfo,
  ExportOptions,
} from "@/utils/exportFormats";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Code,
  File,
  FileImage,
} from "lucide-react";

interface EnhancedExportProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
  filename?: string;
}

export const EnhancedExport: React.FC<EnhancedExportProps> = ({
  data,
  columns,
  selectedColumns,
  filename = "data-export",
}) => {
  const [exportFormat, setExportFormat] = useState<
    "csv" | "excel" | "json" | "pdf" | "xml"
  >("excel");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    filename: filename,
    selectedColumns: selectedColumns,
    includeHeaders: true,
    includeStats: false,
    pageOrientation: "landscape",
    dateFormat: "es-ES",
    numberFormat: "es-ES",
  });
  const [columnsToExport, setColumnsToExport] =
    useState<string[]>(selectedColumns);
  const [isExporting, setIsExporting] = useState(false);

  const formatInfo = getExportFormatInfo();
  const currentFormatInfo = formatInfo.find((f) => f.key === exportFormat);

  const availableColumns = columns.filter((col) =>
    selectedColumns.includes(col.key),
  );

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        ...exportOptions,
        selectedColumns: columnsToExport,
        filename: exportOptions.filename || filename,
      };

      let result;

      switch (exportFormat) {
        case "csv":
          result = exportToCSV(data, columns, options);
          break;
        case "excel":
          result = exportToExcel(data, columns, options);
          break;
        case "json":
          result = exportToJSON(data, columns, options);
          break;
        case "pdf":
          result = exportToPDF(data, columns, options);
          break;
        case "xml":
          result = exportToXML(data, columns, options);
          break;
        default:
          result = { success: false, message: "Formato no soportado" };
      }

      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Error al exportar: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "json":
        return <Code className="h-4 w-4" />;
      case "pdf":
        return <FileImage className="h-4 w-4" />;
      case "xml":
        return <File className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const previewData = data.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Seleccionar Formato de Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={exportFormat}
            onValueChange={(value: any) => setExportFormat(value)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formatInfo.map((format) => (
                <div key={format.key} className="relative">
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value={format.key} id={format.key} />
                    <label
                      htmlFor={format.key}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getFormatIcon(format.key)}
                        <span className="font-medium">{format.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {format.extension}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {format.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {format.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opciones de Exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Options */}
            <div className="space-y-4">
              <h4 className="font-medium">Configuración General</h4>

              <div>
                <Label>Nombre del archivo</Label>
                <Input
                  value={exportOptions.filename || ""}
                  onChange={(e) =>
                    setExportOptions({
                      ...exportOptions,
                      filename: e.target.value,
                    })
                  }
                  placeholder="nombre-archivo"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Se agregará automáticamente la extensión{" "}
                  {currentFormatInfo?.extension}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHeaders"
                  checked={exportOptions.includeHeaders}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeHeaders: !!checked,
                    })
                  }
                />
                <Label htmlFor="includeHeaders">
                  Incluir encabezados de columna
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeStats"
                  checked={exportOptions.includeStats}
                  onCheckedChange={(checked) =>
                    setExportOptions({
                      ...exportOptions,
                      includeStats: !!checked,
                    })
                  }
                />
                <Label htmlFor="includeStats">
                  Incluir hoja/sección de estadísticas
                </Label>
              </div>

              {exportFormat === "pdf" && (
                <div>
                  <Label>Orientación de página</Label>
                  <Select
                    value={exportOptions.pageOrientation}
                    onValueChange={(value: "portrait" | "landscape") =>
                      setExportOptions({
                        ...exportOptions,
                        pageOrientation: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Vertical</SelectItem>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Column Selection */}
            <div className="space-y-4">
              <h4 className="font-medium">Columnas a Exportar</h4>

              <div className="flex gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setColumnsToExport(availableColumns.map((c) => c.key))
                  }
                >
                  Todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColumnsToExport([])}
                >
                  Ninguna
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColumnsToExport(selectedColumns)}
                >
                  Visibles
                </Button>
              </div>

              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="space-y-2">
                  {availableColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`export-${column.key}`}
                        checked={columnsToExport.includes(column.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setColumnsToExport([
                              ...columnsToExport,
                              column.key,
                            ]);
                          } else {
                            setColumnsToExport(
                              columnsToExport.filter((c) => c !== column.key),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`export-${column.key}`}
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {column.label}
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {column.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="text-xs text-muted-foreground">
                {columnsToExport.length} de {availableColumns.length} columnas
                seleccionadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Vista Previa de Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Formato:</span>
                <div className="font-medium flex items-center gap-1">
                  {getFormatIcon(exportFormat)}
                  {currentFormatInfo?.name}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Filas:</span>
                <div className="font-medium">
                  {data.length.toLocaleString("es-ES")}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Columnas:</span>
                <div className="font-medium">{columnsToExport.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Tamaño estimado:</span>
                <div className="font-medium">
                  {exportFormat === "pdf"
                    ? `${Math.ceil(data.length / 50)} páginas`
                    : `${Math.round((data.length * columnsToExport.length * 10) / 1024)} KB`}
                </div>
              </div>
            </div>

            {columnsToExport.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">
                  Primeras 3 filas de muestra:
                </h5>
                <ScrollArea className="w-full">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b">
                        {columnsToExport.map((colKey) => {
                          const column = columns.find((c) => c.key === colKey);
                          return (
                            <th
                              key={colKey}
                              className="text-left p-2 bg-muted/50"
                            >
                              {column?.label}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b">
                          {columnsToExport.map((colKey) => (
                            <td key={colKey} className="p-2 max-w-32 truncate">
                              {String(row[colKey] || "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleExport}
            disabled={
              isExporting || columnsToExport.length === 0 || data.length === 0
            }
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar como {currentFormatInfo?.name}
              </>
            )}
          </Button>

          {data.length === 0 && (
            <div className="text-center text-muted-foreground mt-2 text-sm">
              No hay datos para exportar
            </div>
          )}

          {columnsToExport.length === 0 && data.length > 0 && (
            <div className="text-center text-muted-foreground mt-2 text-sm">
              Selecciona al menos una columna para exportar
            </div>
          )}

          {exportFormat === "pdf" && data.length > 1000 && (
            <div className="text-center text-orange-600 mt-2 text-sm">
              ⚠️ PDF se limitará a las primeras 1000 filas para mantener el
              rendimiento
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
