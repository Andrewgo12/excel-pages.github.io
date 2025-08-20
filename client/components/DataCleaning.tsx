import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Database,
  AlertTriangle,
  CheckCircle,
  X,
  Play,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  Copy,
  Filter,
} from "lucide-react";
import { ExcelData, ExcelColumn } from "@shared/excel-types";
import {
  cleanData,
  detectMissingValues,
  detectDuplicates,
  detectOutliers,
  createDerivedColumn,
  TransformationConfig,
  DerivedColumnRule,
  DataCleaningResult,
  DataQualityIssue,
} from "@/utils/dataTransformation";

interface DataCleaningProps {
  data: ExcelData;
  filteredData: Record<string, any>[];
  selectedColumns: string[];
  onClose: () => void;
  onApplyCleanedData?: (cleanedData: Record<string, any>[]) => void;
}

export function DataCleaning({
  data,
  filteredData,
  selectedColumns,
  onClose,
  onApplyCleanedData,
}: DataCleaningProps) {
  const [config, setConfig] = useState<TransformationConfig>({
    handleMissingValues: "fill_mean",
    removeDuplicates: true,
    handleOutliers: "cap",
    outlierMethod: "zscore",
    outlierThreshold: 3,
    normalizeText: false,
    standardizeFormats: true,
    validateDataTypes: true,
    createDerivedColumns: false,
  });

  const [customFillValue, setCustomFillValue] = useState<string>("");
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningResult, setCleaningResult] =
    useState<DataCleaningResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Derived column configuration
  const [newColumnName, setNewColumnName] = useState("");
  const [derivedColumnRules, setDerivedColumnRules] = useState<
    DerivedColumnRule[]
  >([]);
  const [currentRule, setCurrentRule] = useState<Partial<DerivedColumnRule>>({
    operation: "sum",
    sourceColumns: [],
    parameters: {},
  });

  // Data quality analysis
  const dataQuality = useMemo(() => {
    const missingValues = detectMissingValues(filteredData, data.columns);
    const { totalDuplicates } = detectDuplicates(filteredData);

    const numericColumns = data.columns.filter((col) => col.type === "number");
    let totalOutliers = 0;

    numericColumns.forEach((col) => {
      const { outliers } = detectOutliers(
        filteredData,
        col.key,
        config.outlierMethod,
        config.outlierThreshold,
      );
      totalOutliers += outliers.length;
    });

    return {
      totalRows: filteredData.length,
      missingValues,
      totalDuplicates,
      totalOutliers,
      completeness:
        Object.values(missingValues).reduce(
          (sum, mv) => sum + (100 - mv.percentage),
          0,
        ) / data.columns.length,
    };
  }, [
    filteredData,
    data.columns,
    config.outlierMethod,
    config.outlierThreshold,
  ]);

  const handleCleanData = async () => {
    setIsCleaning(true);

    try {
      const result = cleanData(
        filteredData,
        { ...config, customFillValue },
        data.columns.filter((col) => selectedColumns.includes(col.key)),
      );

      setCleaningResult(result);
      setShowPreview(true);
    } catch (error) {
      console.error("Error cleaning data:", error);
    } finally {
      setIsCleaning(false);
    }
  };

  const applyCleanedData = () => {
    if (cleaningResult && onApplyCleanedData) {
      onApplyCleanedData(cleaningResult.cleanedData);
      onClose();
    }
  };

  const addDerivedColumn = () => {
    if (
      newColumnName &&
      currentRule.operation &&
      currentRule.sourceColumns &&
      currentRule.sourceColumns.length > 0
    ) {
      const rule: DerivedColumnRule = {
        newColumnName,
        sourceColumns: currentRule.sourceColumns,
        operation: currentRule.operation,
        parameters: currentRule.parameters || {},
        dataType: "number", // Default, can be made configurable
      };

      setDerivedColumnRules([...derivedColumnRules, rule]);
      setNewColumnName("");
      setCurrentRule({ operation: "sum", sourceColumns: [], parameters: {} });
    }
  };

  const updateConfig = (key: keyof TransformationConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader className="p-responsive">
        <CardTitle className="text-responsive-lg flex items-center justify-between">
          <div className="flex items-center gap-responsive-sm">
            <Sparkles className="h-responsive-input w-responsive-input text-primary" />
            Limpieza y Transformación de Datos
            <Badge variant="secondary" className="text-responsive-xs">
              {filteredData.length.toLocaleString()} registros
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="button-responsive"
          >
            <X className="h-responsive-input w-responsive-input" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-responsive">
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-responsive-xs">
            <TabsTrigger value="analysis" className="text-responsive-xs">
              Análisis
            </TabsTrigger>
            <TabsTrigger value="cleaning" className="text-responsive-xs">
              Limpieza
            </TabsTrigger>
            <TabsTrigger value="derived" className="text-responsive-xs">
              Columnas Derivadas
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-responsive-xs"
              disabled={!cleaningResult}
            >
              Resultados
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-responsive">
            <div className="space-y-responsive">
              <h3 className="text-responsive-base font-medium">
                Calidad de Datos
              </h3>

              {/* Overall Quality Score */}
              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-responsive-sm">
                      Completitud General
                    </span>
                    <Badge
                      variant={
                        dataQuality.completeness > 90
                          ? "default"
                          : dataQuality.completeness > 70
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-responsive-xs"
                    >
                      {dataQuality.completeness.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={dataQuality.completeness} className="h-2" />
                </CardContent>
              </Card>

              {/* Issues Summary */}
              <div className="grid grid-cols-3 gap-responsive-sm">
                <Card>
                  <CardContent className="p-responsive-sm text-center">
                    <div className="text-responsive-lg font-bold text-orange-600">
                      {Object.values(dataQuality.missingValues)
                        .reduce((sum, mv) => sum + mv.count, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Valores Faltantes
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-responsive-sm text-center">
                    <div className="text-responsive-lg font-bold text-red-600">
                      {dataQuality.totalDuplicates}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Filas Duplicadas
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-responsive-sm text-center">
                    <div className="text-responsive-lg font-bold text-purple-600">
                      {dataQuality.totalOutliers}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Outliers Detectados
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Missing Values by Column */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-base">
                    Valores Faltantes por Columna
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm">
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {Object.entries(dataQuality.missingValues)
                        .filter(([_, mv]) => mv.count > 0)
                        .map(([column, mv]) => (
                          <div
                            key={column}
                            className="flex items-center justify-between"
                          >
                            <span className="text-responsive-sm">{column}</span>
                            <div className="flex items-center gap-responsive-sm">
                              <Progress
                                value={mv.percentage}
                                className="w-20 h-2"
                              />
                              <Badge
                                variant="outline"
                                className="text-responsive-xs"
                              >
                                {mv.count} ({mv.percentage.toFixed(1)}%)
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cleaning Configuration Tab */}
          <TabsContent value="cleaning" className="space-y-responsive">
            <div className="space-y-responsive">
              <h3 className="text-responsive-base font-medium">
                Configuración de Limpieza
              </h3>

              {/* Missing Values Handling */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-sm">
                    Manejo de Valores Faltantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div>
                    <Label className="text-responsive-xs">Estrategia</Label>
                    <Select
                      value={config.handleMissingValues}
                      onValueChange={(value: any) =>
                        updateConfig("handleMissingValues", value)
                      }
                    >
                      <SelectTrigger className="control-responsive mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remove">Eliminar filas</SelectItem>
                        <SelectItem value="fill_mean">
                          Llenar con promedio
                        </SelectItem>
                        <SelectItem value="fill_median">
                          Llenar con mediana
                        </SelectItem>
                        <SelectItem value="fill_mode">
                          Llenar con moda
                        </SelectItem>
                        <SelectItem value="fill_custom">
                          Valor personalizado
                        </SelectItem>
                        <SelectItem value="interpolate">
                          Interpolación
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {config.handleMissingValues === "fill_custom" && (
                    <div>
                      <Label className="text-responsive-xs">
                        Valor personalizado
                      </Label>
                      <Input
                        value={customFillValue}
                        onChange={(e) => setCustomFillValue(e.target.value)}
                        placeholder="Ingrese el valor de relleno"
                        className="control-responsive mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Duplicates */}
              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="removeDuplicates"
                      checked={config.removeDuplicates}
                      onCheckedChange={(checked) =>
                        updateConfig("removeDuplicates", !!checked)
                      }
                    />
                    <Label
                      htmlFor="removeDuplicates"
                      className="text-responsive-sm"
                    >
                      Eliminar filas duplicadas
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Outliers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-sm">
                    Manejo de Outliers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div>
                    <Label className="text-responsive-xs">Estrategia</Label>
                    <Select
                      value={config.handleOutliers}
                      onValueChange={(value: any) =>
                        updateConfig("handleOutliers", value)
                      }
                    >
                      <SelectTrigger className="control-responsive mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ignore">Ignorar</SelectItem>
                        <SelectItem value="remove">Eliminar</SelectItem>
                        <SelectItem value="cap">Limitar valores</SelectItem>
                        <SelectItem value="transform">Transformar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-responsive-xs">
                      Método de detección
                    </Label>
                    <Select
                      value={config.outlierMethod}
                      onValueChange={(value: any) =>
                        updateConfig("outlierMethod", value)
                      }
                    >
                      <SelectTrigger className="control-responsive mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zscore">Z-Score</SelectItem>
                        <SelectItem value="iqr">IQR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-responsive-xs">
                      Umbral: {config.outlierThreshold}
                    </Label>
                    <Slider
                      value={[config.outlierThreshold]}
                      onValueChange={(value) =>
                        updateConfig("outlierThreshold", value[0])
                      }
                      min={1}
                      max={5}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Text and Format Options */}
              <Card>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="normalizeText"
                      checked={config.normalizeText}
                      onCheckedChange={(checked) =>
                        updateConfig("normalizeText", !!checked)
                      }
                    />
                    <Label
                      htmlFor="normalizeText"
                      className="text-responsive-sm"
                    >
                      Normalizar texto (minúsculas, espacios)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validateDataTypes"
                      checked={config.validateDataTypes}
                      onCheckedChange={(checked) =>
                        updateConfig("validateDataTypes", !!checked)
                      }
                    />
                    <Label
                      htmlFor="validateDataTypes"
                      className="text-responsive-sm"
                    >
                      Validar y corregir tipos de datos
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-responsive-sm">
                <Button
                  onClick={handleCleanData}
                  disabled={isCleaning}
                  className="flex-1 gap-1"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="h-responsive-input w-responsive-input animate-spin" />
                      Limpiando...
                    </>
                  ) : (
                    <>
                      <Play className="h-responsive-input w-responsive-input" />
                      Limpiar Datos
                    </>
                  )}
                </Button>

                {cleaningResult && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="gap-1"
                  >
                    <Eye className="h-responsive-input w-responsive-input" />
                    {showPreview ? "Ocultar" : "Vista Previa"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Derived Columns Tab */}
          <TabsContent value="derived" className="space-y-responsive">
            <div className="space-y-responsive">
              <h3 className="text-responsive-base font-medium">
                Crear Columnas Derivadas
              </h3>

              {/* New Column Configuration */}
              <Card>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div>
                    <Label className="text-responsive-xs">
                      Nombre de nueva columna
                    </Label>
                    <Input
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Nombre de la columna"
                      className="control-responsive mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-responsive-xs">Operación</Label>
                    <Select
                      value={currentRule.operation}
                      onValueChange={(value: any) =>
                        setCurrentRule((prev) => ({
                          ...prev,
                          operation: value,
                        }))
                      }
                    >
                      <SelectTrigger className="control-responsive mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Suma</SelectItem>
                        <SelectItem value="average">Promedio</SelectItem>
                        <SelectItem value="concat">Concatenar</SelectItem>
                        <SelectItem value="difference">Diferencia</SelectItem>
                        <SelectItem value="ratio">Razón</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-responsive-xs">
                      Columnas fuente
                    </Label>
                    <div className="mt-1 max-h-32 overflow-y-auto border rounded p-2">
                      {selectedColumns.map((columnKey) => {
                        const column = data.columns.find(
                          (c) => c.key === columnKey,
                        );
                        return (
                          <div
                            key={columnKey}
                            className="flex items-center space-x-2 py-1"
                          >
                            <Checkbox
                              id={columnKey}
                              checked={currentRule.sourceColumns?.includes(
                                columnKey,
                              )}
                              onCheckedChange={(checked) => {
                                const newColumns = checked
                                  ? [
                                      ...(currentRule.sourceColumns || []),
                                      columnKey,
                                    ]
                                  : (currentRule.sourceColumns || []).filter(
                                      (c) => c !== columnKey,
                                    );
                                setCurrentRule((prev) => ({
                                  ...prev,
                                  sourceColumns: newColumns,
                                }));
                              }}
                            />
                            <Label
                              htmlFor={columnKey}
                              className="text-responsive-xs cursor-pointer"
                            >
                              {column?.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={addDerivedColumn}
                    disabled={
                      !newColumnName || !currentRule.sourceColumns?.length
                    }
                    className="w-full gap-1"
                  >
                    <Copy className="h-responsive-input w-responsive-input" />
                    Agregar Columna
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Derived Columns */}
              {derivedColumnRules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-responsive-sm">
                      Columnas a Crear
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-responsive-sm">
                    <div className="space-y-2">
                      {derivedColumnRules.map((rule, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border rounded p-2"
                        >
                          <div>
                            <div className="text-responsive-sm font-medium">
                              {rule.newColumnName}
                            </div>
                            <div className="text-responsive-xs text-muted-foreground">
                              {rule.operation} de{" "}
                              {rule.sourceColumns.join(", ")}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDerivedColumnRules((prev) =>
                                prev.filter((_, i) => i !== index),
                              )
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-responsive">
            {cleaningResult && (
              <div className="space-y-responsive">
                <div className="flex items-center justify-between">
                  <h3 className="text-responsive-base font-medium">
                    Resultados de Limpieza
                  </h3>
                  <Button onClick={applyCleanedData} className="gap-1">
                    <CheckCircle className="h-responsive-input w-responsive-input" />
                    Aplicar Cambios
                  </Button>
                </div>

                {/* Cleaning Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-responsive-sm">
                      Reporte de Limpieza
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-responsive-sm">
                    <div className="grid grid-cols-2 gap-responsive text-responsive-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Filas originales:
                        </span>
                        <div className="font-medium">
                          {cleaningResult.report.originalRows.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Filas limpiadas:
                        </span>
                        <div className="font-medium">
                          {cleaningResult.report.cleanedRows.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Filas eliminadas:
                        </span>
                        <div className="font-medium text-red-600">
                          {cleaningResult.report.removedRows}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Celdas modificadas:
                        </span>
                        <div className="font-medium text-blue-600">
                          {cleaningResult.report.modifiedCells}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Duplicados eliminados:
                        </span>
                        <div className="font-medium text-orange-600">
                          {cleaningResult.report.duplicatesRemoved}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Valores nulos corregidos:
                        </span>
                        <div className="font-medium text-green-600">
                          {cleaningResult.report.nullsHandled}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Issues Found */}
                {cleaningResult.issues.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-responsive-sm">
                        Problemas Detectados y Corregidos
                        <Badge
                          variant="secondary"
                          className="ml-2 text-responsive-xs"
                        >
                          {cleaningResult.issues.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-responsive-sm">
                      <ScrollArea className="h-40">
                        <div className="space-y-2">
                          {cleaningResult.issues
                            .slice(0, 20)
                            .map((issue, index) => (
                              <Alert key={index} className="p-2">
                                <AlertTriangle className="h-3 w-3" />
                                <AlertDescription className="text-responsive-xs">
                                  <strong>{issue.column}</strong> (Fila{" "}
                                  {issue.rowIndex + 1}): {issue.description}
                                </AlertDescription>
                              </Alert>
                            ))}
                          {cleaningResult.issues.length > 20 && (
                            <div className="text-center text-responsive-xs text-muted-foreground">
                              ... y {cleaningResult.issues.length - 20}{" "}
                              problemas más
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
