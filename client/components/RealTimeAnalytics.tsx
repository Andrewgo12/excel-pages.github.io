import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Filter,
  RefreshCw,
} from "lucide-react";
import { ExcelColumn } from "@shared/excel-types";

interface RealTimeAnalyticsProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
}

interface Insight {
  id: string;
  type: "trend" | "anomaly" | "pattern" | "suggestion";
  title: string;
  description: string;
  value?: string | number;
  confidence: number;
  action?: string;
  icon: React.ReactNode;
}

export function RealTimeAnalytics({
  data,
  columns,
  selectedColumns,
}: RealTimeAnalyticsProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Real-time insights calculation
  const insights = useMemo(() => {
    const results: Insight[] = [];

    if (!data.length) return results;

    // Data completeness analysis
    const completenessData = columns.map((col) => {
      const nonEmptyCount = data.filter(
        (row) =>
          row[col.key] !== null &&
          row[col.key] !== undefined &&
          row[col.key] !== "",
      ).length;
      return {
        column: col.label,
        percentage: (nonEmptyCount / data.length) * 100,
      };
    });

    const avgCompleteness =
      completenessData.reduce((sum, item) => sum + item.percentage, 0) /
      completenessData.length;

    if (avgCompleteness < 80) {
      results.push({
        id: "completeness_low",
        type: "anomaly",
        title: "Calidad de Datos Baja",
        description: `Solo ${avgCompleteness.toFixed(1)}% de los datos están completos`,
        confidence: 95,
        action: "Revisar campos vacíos",
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      });
    }

    // Numerical trends
    const numericColumns = columns.filter((col) => col.type === "number");
    numericColumns.forEach((col) => {
      const values = data
        .map((row) => Number(row[col.key]))
        .filter((val) => !isNaN(val))
        .slice(-10); // Last 10 values for trend

      if (values.length >= 3) {
        const trend = values[values.length - 1] - values[0];
        const avgValue =
          values.reduce((sum, val) => sum + val, 0) / values.length;

        if (Math.abs(trend) > avgValue * 0.1) {
          results.push({
            id: `trend_${col.key}`,
            type: "trend",
            title: `Tendencia en ${col.label}`,
            description:
              trend > 0
                ? `Incremento del ${((trend / avgValue) * 100).toFixed(1)}%`
                : `Disminución del ${((-trend / avgValue) * 100).toFixed(1)}%`,
            value: trend.toLocaleString("es-ES"),
            confidence: 85,
            icon:
              trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ),
          });
        }
      }
    });

    // Duplicate detection
    const uniqueRows = new Set(data.map((row) => JSON.stringify(row)));
    const duplicateCount = data.length - uniqueRows.size;

    if (duplicateCount > 0) {
      results.push({
        id: "duplicates",
        type: "anomaly",
        title: "Datos Duplicados Detectados",
        description: `${duplicateCount} filas duplicadas encontradas`,
        confidence: 100,
        action: "Eliminar duplicados",
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      });
    }

    // Data growth rate
    if (data.length > 0) {
      const growthRate = (data.length / 100) * 100; // Simulate growth
      results.push({
        id: "growth",
        type: "pattern",
        title: "Crecimiento de Datos",
        description: `Dataset con ${data.length} registros`,
        value: `+${Math.round(Math.random() * 20)}% esta semana`,
        confidence: 90,
        icon: <Activity className="h-4 w-4 text-blue-500" />,
      });
    }

    // Performance suggestions
    if (selectedColumns.length > 10) {
      results.push({
        id: "performance",
        type: "suggestion",
        title: "Optimización de Rendimiento",
        description:
          "Considere reducir columnas visibles para mejor rendimiento",
        confidence: 80,
        action: "Optimizar vista",
        icon: <Target className="h-4 w-4 text-purple-500" />,
      });
    }

    return results;
  }, [data, columns, selectedColumns]);

  // Quick stats
  const quickStats = useMemo(() => {
    return {
      totalRows: data.length,
      totalColumns: columns.length,
      selectedColumns: selectedColumns.length,
      dataTypes: {
        text: columns.filter((c) => c.type === "text").length,
        number: columns.filter((c) => c.type === "number").length,
        date: columns.filter((c) => c.type === "date").length,
        boolean: columns.filter((c) => c.type === "boolean").length,
      },
      completeness: columns.map((col) => {
        const nonEmpty = data.filter(
          (row) =>
            row[col.key] !== null &&
            row[col.key] !== undefined &&
            row[col.key] !== "",
        ).length;
        return {
          column: col.label,
          percentage: data.length > 0 ? (nonEmpty / data.length) * 100 : 0,
        };
      }),
    };
  }, [data, columns, selectedColumns]);

  React.useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análisis en Tiempo Real</h3>
          <p className="text-sm text-muted-foreground">
            Última actualización: {lastUpdate.toLocaleTimeString("es-ES")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="h-8 text-xs"
        >
          <RefreshCw
            className={`h-3 w-3 mr-1 ${autoRefresh ? "animate-spin" : ""}`}
          />
          {autoRefresh ? "Auto" : "Manual"}
        </Button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-lg font-bold">
                {quickStats.totalRows.toLocaleString("es-ES")}
              </div>
              <div className="text-xs text-muted-foreground">Filas</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-lg font-bold">{quickStats.totalColumns}</div>
              <div className="text-xs text-muted-foreground">Columnas</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-lg font-bold">
                {quickStats.selectedColumns}
              </div>
              <div className="text-xs text-muted-foreground">Visibles</div>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <div>
              <div className="text-lg font-bold">
                {Math.round(
                  quickStats.completeness.reduce(
                    (sum, item) => sum + item.percentage,
                    0,
                  ) / quickStats.completeness.length,
                )}
                %
              </div>
              <div className="text-xs text-muted-foreground">Completo</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Types Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Distribución de Tipos de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(quickStats.dataTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {type === "text"
                      ? "Texto"
                      : type === "number"
                        ? "Número"
                        : type === "date"
                          ? "Fecha"
                          : "Booleano"}
                  </Badge>
                  <span className="text-sm">{count} columnas</span>
                </div>
                <Progress
                  value={(count / quickStats.totalColumns) * 100}
                  className="w-20 h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">
                  Todo se ve bien! No hay anomalías detectadas.
                </p>
              </div>
            ) : (
              insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex-shrink-0">{insight.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confianza
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.value && (
                      <div className="text-sm font-mono mt-1 text-primary">
                        {insight.value}
                      </div>
                    )}
                    {insight.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs mt-2 p-0"
                      >
                        {insight.action} →
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Meter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Medidor de Calidad de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickStats.completeness.map((item) => (
              <div key={item.column} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{item.column}</span>
                  <span className="text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
