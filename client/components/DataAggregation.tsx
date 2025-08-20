import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExcelColumn } from "@shared/excel-types";
import {
  aggregateData,
  createPivotTable,
  getAggregationFunctionLabel,
  formatAggregatedValue,
  getColumnAggregations,
  AggregationRule,
  AggregationSummary,
} from "@/utils/dataAggregation";
import { Plus, X, Calculator, Table2 } from "lucide-react";

interface DataAggregationProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
}

export const DataAggregation: React.FC<DataAggregationProps> = ({
  data,
  columns,
  selectedColumns,
}) => {
  const [activeTab, setActiveTab] = useState<"quick" | "custom" | "pivot">(
    "quick",
  );
  const [aggregationRules, setAggregationRules] = useState<AggregationRule[]>(
    [],
  );
  const [newRule, setNewRule] = useState<Partial<AggregationRule>>({});

  // Pivot table state
  const [pivotRow, setPivotRow] = useState<string>("");
  const [pivotColumn, setPivotColumn] = useState<string>("");
  const [pivotValue, setPivotValue] = useState<string>("");
  const [pivotFunction, setPivotFunction] = useState<
    "sum" | "avg" | "count" | "min" | "max"
  >("sum");

  const textColumns = columns.filter(
    (col) => col.type === "text" && selectedColumns.includes(col.key),
  );
  const numericColumns = columns.filter(
    (col) => col.type === "number" && selectedColumns.includes(col.key),
  );
  const allSelectedColumns = columns.filter((col) =>
    selectedColumns.includes(col.key),
  );

  // Quick aggregations for each numeric column
  const quickAggregations = useMemo(() => {
    return numericColumns.map((column) => ({
      column: column.key,
      label: column.label,
      aggregations: getColumnAggregations(data, column.key, column.type),
    }));
  }, [data, numericColumns]);

  // Custom aggregation results
  const customAggregations = useMemo(() => {
    return aggregationRules.map((rule) => aggregateData(data, rule));
  }, [data, aggregationRules]);

  // Pivot table data
  const pivotData = useMemo(() => {
    if (!pivotRow || !pivotColumn || !pivotValue) return [];
    return createPivotTable(
      data,
      pivotRow,
      pivotColumn,
      pivotValue,
      pivotFunction,
    );
  }, [data, pivotRow, pivotColumn, pivotValue, pivotFunction]);

  const addAggregationRule = () => {
    if (!newRule.groupByColumn || !newRule.aggregateColumn || !newRule.function)
      return;

    const rule: AggregationRule = {
      id: Date.now().toString(),
      groupByColumn: newRule.groupByColumn,
      aggregateColumn: newRule.aggregateColumn,
      function: newRule.function,
      label:
        newRule.label ||
        `${getAggregationFunctionLabel(newRule.function)} de ${newRule.aggregateColumn} por ${newRule.groupByColumn}`,
    };

    setAggregationRules([...aggregationRules, rule]);
    setNewRule({});
  };

  const removeAggregationRule = (id: string) => {
    setAggregationRules((rules) => rules.filter((r) => r.id !== id));
  };

  const renderQuickAggregations = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-3">
          Resumen Rápido de Columnas Numéricas
        </h4>
        <div className="grid gap-4">
          {quickAggregations.map(({ column, label, aggregations }) => (
            <Card key={column}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  {Object.entries(aggregations).map(([func, value]) => (
                    <div key={func} className="text-center">
                      <div className="text-muted-foreground capitalize">
                        {getAggregationFunctionLabel(func)}
                      </div>
                      <div className="font-medium text-lg">
                        {formatAggregatedValue(value, func)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {numericColumns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay columnas numéricas seleccionadas para mostrar agregaciones
          rápidas
        </div>
      )}
    </div>
  );

  const renderCustomAggregations = () => (
    <div className="space-y-4">
      {/* Add new aggregation rule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva Agregación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Agrupar por</Label>
              <Select
                value={newRule.groupByColumn || ""}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, groupByColumn: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  {allSelectedColumns.map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Columna a agregar</Label>
              <Select
                value={newRule.aggregateColumn || ""}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, aggregateColumn: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  {allSelectedColumns.map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Función</Label>
              <Select
                value={newRule.function || ""}
                onValueChange={(value: any) =>
                  setNewRule({ ...newRule, function: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Función" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Suma</SelectItem>
                  <SelectItem value="avg">Promedio</SelectItem>
                  <SelectItem value="count">Conteo</SelectItem>
                  <SelectItem value="min">Mínimo</SelectItem>
                  <SelectItem value="max">Máximo</SelectItem>
                  <SelectItem value="median">Mediana</SelectItem>
                  <SelectItem value="std">Desv. Estándar</SelectItem>
                  <SelectItem value="distinct">Valores Únicos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={addAggregationRule}
                disabled={
                  !newRule.groupByColumn ||
                  !newRule.aggregateColumn ||
                  !newRule.function
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show aggregation results */}
      {customAggregations.map((aggregation, index) => (
        <Card key={aggregation.rule.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {aggregation.rule.label}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAggregationRule(aggregation.rule.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-muted-foreground">
              {aggregation.totalGroups} grupos • {aggregation.totalRows} filas
              totales
            </div>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{aggregation.rule.groupByColumn}</TableHead>
                    <TableHead>
                      {getAggregationFunctionLabel(aggregation.rule.function)}
                    </TableHead>
                    <TableHead>Filas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregation.results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {result.group}
                      </TableCell>
                      <TableCell>
                        {formatAggregatedValue(
                          result.value,
                          aggregation.rule.function,
                        )}
                      </TableCell>
                      <TableCell>{result.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      ))}

      {customAggregations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No hay agregaciones personalizadas. Agrega una nueva agregación
          arriba.
        </div>
      )}
    </div>
  );

  const renderPivotTable = () => {
    const pivotColumns =
      pivotData.length > 0
        ? Object.keys(pivotData[0]).filter((key) => key !== pivotRow)
        : [];

    return (
      <div className="space-y-4">
        {/* Pivot table configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Configuración de Tabla Dinámica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Filas</Label>
                <Select value={pivotRow} onValueChange={setPivotRow}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar columna" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSelectedColumns.map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Columnas</Label>
                <Select value={pivotColumn} onValueChange={setPivotColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar columna" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSelectedColumns.map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Valores</Label>
                <Select value={pivotValue} onValueChange={setPivotValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar columna" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSelectedColumns.map((col) => (
                      <SelectItem key={col.key} value={col.key}>
                        {col.label} ({col.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Función</Label>
                <Select
                  value={pivotFunction}
                  onValueChange={(value: any) => setPivotFunction(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sum">Suma</SelectItem>
                    <SelectItem value="avg">Promedio</SelectItem>
                    <SelectItem value="count">Conteo</SelectItem>
                    <SelectItem value="min">Mínimo</SelectItem>
                    <SelectItem value="max">Máximo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pivot table results */}
        {pivotData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tabla Dinámica</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background">
                        {pivotRow}
                      </TableHead>
                      {pivotColumns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivotData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="sticky left-0 bg-background font-medium">
                          {row[pivotRow]}
                        </TableCell>
                        {pivotColumns.map((col) => (
                          <TableCell key={col}>
                            {formatAggregatedValue(row[col], pivotFunction)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {(!pivotRow || !pivotColumn || !pivotValue) && (
          <div className="text-center py-8 text-muted-foreground">
            Configura las filas, columnas y valores para generar la tabla
            dinámica
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "quick" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("quick")}
        >
          <Calculator className="h-4 w-4 mr-2" />
          Resumen Rápido
        </Button>
        <Button
          variant={activeTab === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("custom")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregaciones
        </Button>
        <Button
          variant={activeTab === "pivot" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("pivot")}
        >
          <Table2 className="h-4 w-4 mr-2" />
          Tabla Dinámica
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "quick" && renderQuickAggregations()}
      {activeTab === "custom" && renderCustomAggregations()}
      {activeTab === "pivot" && renderPivotTable()}
    </div>
  );
};
