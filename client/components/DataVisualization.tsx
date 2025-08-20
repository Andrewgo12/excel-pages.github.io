import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExcelColumn } from "@shared/excel-types";
import { ColumnStats } from "@/utils/statisticalAnalysis";

interface DataVisualizationProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  stats: ColumnStats[];
  selectedColumns: string[];
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  columns,
  stats,
  selectedColumns,
}) => {
  const [selectedChart, setSelectedChart] = React.useState<string>("overview");
  const [xAxis, setXAxis] = React.useState<string>("");
  const [yAxis, setYAxis] = React.useState<string>("");

  // Generate overview charts
  const overviewData = useMemo(() => {
    return {
      dataTypes: Object.entries(
        columns.reduce(
          (acc, col) => {
            acc[col.type] = (acc[col.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([type, count]) => ({ name: type, value: count })),

      completeness: stats
        .map((stat) => ({
          column:
            stat.column.length > 15
              ? stat.column.substring(0, 12) + "..."
              : stat.column,
          completitud: Math.round(
            (stat.count / (stat.count + stat.nullCount)) * 100,
          ),
          valores: stat.count,
          nulos: stat.nullCount,
        }))
        .slice(0, 10),

      uniqueness: stats
        .map((stat) => ({
          column:
            stat.column.length > 15
              ? stat.column.substring(0, 12) + "..."
              : stat.column,
          unicidad: Math.round((stat.uniqueCount / stat.count) * 100),
          unicos: stat.uniqueCount,
          total: stat.count,
        }))
        .slice(0, 10),
    };
  }, [columns, stats]);

  // Generate custom chart data
  const customChartData = useMemo(() => {
    if (!xAxis || !yAxis || !data.length) return [];

    const xColumn = columns.find((col) => col.key === xAxis);
    const yColumn = columns.find((col) => col.key === yAxis);

    if (!xColumn || !yColumn) return [];

    // Group data for categorical x-axis
    if (xColumn.type === "text") {
      const grouped = data.reduce(
        (acc, row) => {
          const xVal = String(row[xAxis] || "Sin valor");
          const yVal = Number(row[yAxis]) || 0;

          if (!acc[xVal]) {
            acc[xVal] = { name: xVal, total: 0, count: 0, values: [] };
          }

          acc[xVal].total += yVal;
          acc[xVal].count += 1;
          acc[xVal].values.push(yVal);

          return acc;
        },
        {} as Record<string, any>,
      );

      return Object.values(grouped)
        .map((group: any) => ({
          name:
            group.name.length > 20
              ? group.name.substring(0, 17) + "..."
              : group.name,
          value:
            yColumn.type === "number"
              ? Math.round((group.total / group.count) * 100) / 100
              : group.count,
          total: group.total,
          count: group.count,
        }))
        .slice(0, 15);
    }

    // Direct mapping for numeric data
    return data
      .map((row, index) => ({
        name: String(row[xAxis] || index),
        x: row[xAxis],
        y: row[yAxis],
        value: Number(row[yAxis]) || 0,
      }))
      .filter((item) => item.x !== null && item.y !== null)
      .slice(0, 50);
  }, [data, xAxis, yAxis, columns]);

  const textColumns = columns.filter(
    (col) => col.type === "text" && selectedColumns.includes(col.key),
  );
  const numericColumns = columns.filter(
    (col) => col.type === "number" && selectedColumns.includes(col.key),
  );
  const dateColumns = columns.filter(
    (col) => col.type === "date" && selectedColumns.includes(col.key),
  );

  const renderChart = () => {
    switch (selectedChart) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Data Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Distribución de Tipos de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={overviewData.dataTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overviewData.dataTypes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Completeness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Completitud de Datos por Columna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData.completeness}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="column"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "completitud" ? `${value}%` : value,
                        name === "completitud"
                          ? "Completitud"
                          : name === "valores"
                            ? "Valores"
                            : "Nulos",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="completitud"
                      fill="#10B981"
                      name="completitud"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Data Uniqueness */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Unicidad de Valores por Columna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData.uniqueness}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="column"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "unicidad" ? `${value}%` : value,
                        name === "unicidad"
                          ? "Unicidad"
                          : name === "unicos"
                            ? "Únicos"
                            : "Total",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="unicidad" fill="#3B82F6" name="unicidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        );

      case "custom":
        if (!xAxis || !yAxis) {
          return (
            <div className="text-center py-8 text-muted-foreground">
              Selecciona columnas para X e Y para generar el gráfico
            </div>
          );
        }

        const xColumn = columns.find((col) => col.key === xAxis);
        const yColumn = columns.find((col) => col.key === yAxis);

        if (xColumn?.type === "text" && yColumn?.type === "number") {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          );
        }

        if (xColumn?.type === "number" && yColumn?.type === "number") {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={customChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis dataKey="y" />
                <Tooltip />
                <Scatter dataKey="y" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          );
        }

        return (
          <div className="text-center py-8 text-muted-foreground">
            Combinación de tipos de datos no soportada para visualización
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedChart} onValueChange={setSelectedChart}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Resumen General</SelectItem>
            <SelectItem value="custom">Gráfico Personalizado</SelectItem>
          </SelectContent>
        </Select>

        {selectedChart === "custom" && (
          <>
            <Select value={xAxis} onValueChange={setXAxis}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Eje X" />
              </SelectTrigger>
              <SelectContent>
                {[...textColumns, ...numericColumns, ...dateColumns].map(
                  (col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select value={yAxis} onValueChange={setYAxis}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Eje Y" />
              </SelectTrigger>
              <SelectContent>
                {numericColumns.map((col) => (
                  <SelectItem key={col.key} value={col.key}>
                    {col.label} ({col.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Charts */}
      <div>{renderChart()}</div>
    </div>
  );
};
