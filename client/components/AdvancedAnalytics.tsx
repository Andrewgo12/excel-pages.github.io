import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { ExcelData, ExcelColumn } from "@shared/excel-types";
import {
  generateAdvancedStats,
  formatCorrelationStrength,
  formatDirection,
  formatTrend,
  AdvancedStats,
  CorrelationResult,
  OutlierResult,
} from "@/utils/advancedStatistics";

interface AdvancedAnalyticsProps {
  data: ExcelData;
  filteredData: Record<string, any>[];
  selectedColumns: string[];
  onClose: () => void;
  onHighlightOutliers?: (outliers: OutlierResult[]) => void;
}

export function AdvancedAnalytics({
  data,
  filteredData,
  selectedColumns,
  onClose,
  onHighlightOutliers,
}: AdvancedAnalyticsProps) {
  const [selectedCorrelation, setSelectedCorrelation] =
    useState<CorrelationResult | null>(null);
  const [outlierMethod, setOutlierMethod] = useState<"zscore" | "iqr">(
    "zscore",
  );
  const [showOutlierDetails, setShowOutlierDetails] = useState<
    Record<string, boolean>
  >({});

  // Calculate advanced statistics
  const advancedStats = useMemo(() => {
    if (!data || filteredData.length === 0) return null;
    return generateAdvancedStats(filteredData, data.columns);
  }, [data, filteredData]);

  const numericColumns = useMemo(
    () =>
      data.columns.filter(
        (col) => col.type === "number" && selectedColumns.includes(col.key),
      ),
    [data.columns, selectedColumns],
  );

  if (!advancedStats) {
    return (
      <Card>
        <CardHeader className="p-responsive">
          <CardTitle className="text-responsive-lg flex items-center justify-between">
            <div className="flex items-center gap-responsive-sm">
              <BarChart3 className="h-responsive-input w-responsive-input text-primary" />
              Análisis Avanzado
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
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos numéricos suficientes para el análisis avanzado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const toggleOutlierDetails = (column: string) => {
    setShowOutlierDetails((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  return (
    <Card>
      <CardHeader className="p-responsive">
        <CardTitle className="text-responsive-lg flex items-center justify-between">
          <div className="flex items-center gap-responsive-sm">
            <BarChart3 className="h-responsive-input w-responsive-input text-primary" />
            Análisis Avanzado
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
        <Tabs defaultValue="correlations" className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-responsive-xs">
            <TabsTrigger value="correlations" className="text-responsive-xs">
              Correlaciones
            </TabsTrigger>
            <TabsTrigger value="outliers" className="text-responsive-xs">
              Outliers
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-responsive-xs">
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="distribution" className="text-responsive-xs">
              Distribución
            </TabsTrigger>
          </TabsList>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-responsive">
            <div className="flex items-center justify-between">
              <h3 className="text-responsive-base font-medium">
                Análisis de Correlaciones
              </h3>
              <Badge variant="outline" className="text-responsive-xs">
                {advancedStats.correlations.length} pares analizados
              </Badge>
            </div>

            {advancedStats.correlations.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-responsive-sm">
                  No se encontraron correlaciones significativas entre las
                  columnas numéricas seleccionadas.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-responsive-sm">
                  {advancedStats.correlations
                    .filter((corr) => Math.abs(corr.correlation) > 0.1) // Only show meaningful correlations
                    .map((correlation, index) => (
                      <Card
                        key={index}
                        className="border-l-4 border-l-primary/20"
                      >
                        <CardContent className="p-responsive-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-responsive-sm">
                              <Badge
                                variant={
                                  correlation.strength === "very_strong" ||
                                  correlation.strength === "strong"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-responsive-xs"
                              >
                                {formatCorrelationStrength(
                                  correlation.strength,
                                )}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-responsive-xs ${correlation.direction === "positive" ? "border-green-500 text-green-700" : "border-red-500 text-red-700"}`}
                              >
                                {formatDirection(correlation.direction)}
                              </Badge>
                            </div>
                            <span className="text-responsive-sm font-mono font-medium">
                              {correlation.correlation.toFixed(3)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-responsive-sm">
                            <span className="font-medium">
                              {correlation.column1}
                            </span>
                            <span className="text-muted-foreground">↔</span>
                            <span className="font-medium">
                              {correlation.column2}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-responsive-sm">
                            <Progress
                              value={Math.abs(correlation.correlation) * 100}
                              className="flex-1 h-2"
                            />
                            <span className="text-responsive-xs text-muted-foreground">
                              {(
                                Math.abs(correlation.correlation) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>

                          {correlation.significance < 0.05 && (
                            <div className="mt-1 text-responsive-xs text-green-600">
                              ✓ Estadísticamente significativa
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Outliers Tab */}
          <TabsContent value="outliers" className="space-y-responsive">
            <div className="flex items-center justify-between">
              <h3 className="text-responsive-base font-medium">
                Detección de Outliers
              </h3>
              <div className="flex items-center gap-responsive-sm">
                <Select
                  value={outlierMethod}
                  onValueChange={(value: "zscore" | "iqr") =>
                    setOutlierMethod(value)
                  }
                >
                  <SelectTrigger className="w-32 control-responsive">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zscore">Z-Score</SelectItem>
                    <SelectItem value="iqr">IQR</SelectItem>
                  </SelectContent>
                </Select>
                {onHighlightOutliers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onHighlightOutliers(advancedStats.outliers)}
                    className="button-responsive gap-1"
                  >
                    <Target className="h-responsive-input w-responsive-input" />
                    Resaltar
                  </Button>
                )}
              </div>
            </div>

            {advancedStats.outliers.length === 0 ? (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription className="text-responsive-sm">
                  No se detectaron outliers significativos en las columnas
                  analizadas.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-responsive-sm">
                  {advancedStats.outliers.map((outlierResult, index) => (
                    <Card key={index}>
                      <CardContent className="p-responsive-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-responsive-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-responsive-sm font-medium">
                              {outlierResult.column}
                            </span>
                          </div>
                          <div className="flex items-center gap-responsive-sm">
                            <Badge
                              variant="destructive"
                              className="text-responsive-xs"
                            >
                              {outlierResult.totalOutliers} outliers
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-responsive-xs"
                            >
                              {outlierResult.outlierPercentage.toFixed(1)}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleOutlierDetails(outlierResult.column)
                              }
                              className="h-6 w-6 p-0"
                            >
                              {showOutlierDetails[outlierResult.column] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Progress
                          value={Math.min(outlierResult.outlierPercentage, 100)}
                          className="h-2 mb-2"
                        />

                        {showOutlierDetails[outlierResult.column] && (
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {outlierResult.outliers
                              .slice(0, 10)
                              .map((outlier, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-responsive-xs bg-muted/30 rounded px-2 py-1"
                                >
                                  <span>Fila {outlier.rowIndex + 1}</span>
                                  <span className="font-mono">
                                    {outlier.value}
                                  </span>
                                  {outlier.method === "zscore" && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Z: {outlier.zScore.toFixed(2)}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            {outlierResult.outliers.length > 10 && (
                              <div className="text-responsive-xs text-muted-foreground text-center">
                                ... y {outlierResult.outliers.length - 10} más
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-responsive">
            <div className="flex items-center justify-between">
              <h3 className="text-responsive-base font-medium">
                Análisis de Tendencias
              </h3>
              <Badge variant="outline" className="text-responsive-xs">
                {advancedStats.trendAnalysis.length} columnas
              </Badge>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-responsive-sm">
                {advancedStats.trendAnalysis.map((trend, index) => (
                  <Card key={index}>
                    <CardContent className="p-responsive-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-responsive-sm">
                          {trend.trend === "increasing" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : trend.trend === "decreasing" ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-responsive-sm font-medium">
                            {trend.column}
                          </span>
                        </div>
                        <Badge
                          variant={
                            trend.trend === "increasing"
                              ? "default"
                              : trend.trend === "decreasing"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-responsive-xs"
                        >
                          {formatTrend(trend.trend)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-responsive-sm">
                        <span className="text-responsive-xs text-muted-foreground">
                          Confianza:
                        </span>
                        <Progress
                          value={trend.confidence * 100}
                          className="flex-1 h-2"
                        />
                        <span className="text-responsive-xs font-mono">
                          {(trend.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-responsive">
            <div className="flex items-center justify-between">
              <h3 className="text-responsive-base font-medium">
                Análisis de Distribución
              </h3>
              <Badge variant="outline" className="text-responsive-xs">
                Tests de Normalidad
              </Badge>
            </div>

            <ScrollArea className="h-80">
              <div className="space-y-responsive-sm">
                {advancedStats.normalityTests.map((test, index) => (
                  <Card key={index}>
                    <CardContent className="p-responsive-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-responsive-sm font-medium">
                          {test.column}
                        </span>
                        <Badge
                          variant={test.isNormal ? "default" : "secondary"}
                          className="text-responsive-xs"
                        >
                          {test.isNormal ? "Normal" : "No Normal"}
                        </Badge>
                      </div>

                      {test.shapiroWilk && (
                        <div className="flex items-center gap-responsive-sm">
                          <span className="text-responsive-xs text-muted-foreground">
                            Estadístico:
                          </span>
                          <Progress
                            value={test.shapiroWilk * 100}
                            className="flex-1 h-2"
                          />
                          <span className="text-responsive-xs font-mono">
                            {test.shapiroWilk.toFixed(3)}
                          </span>
                        </div>
                      )}

                      <div className="mt-1 text-responsive-xs text-muted-foreground">
                        {test.isNormal
                          ? "✓ Distribución aproximadamente normal"
                          : "⚠ Distribución no normal - considerar transformaciones"}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
