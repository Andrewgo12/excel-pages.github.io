import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TextAlignment,
  ColumnCustomization,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Columns3,
  Table,
  Settings,
} from "lucide-react";

interface AlignmentControlsProps {
  columns: ExcelColumn[];
  selectedColumns: string[];
  globalAlignment: TextAlignment;
  headerAlignment: TextAlignment;
  columnAlignments: Record<string, TextAlignment>;
  onGlobalAlignmentChange: (alignment: TextAlignment) => void;
  onHeaderAlignmentChange: (alignment: TextAlignment) => void;
  onColumnAlignmentChange: (
    columnKey: string,
    alignment: TextAlignment,
  ) => void;
  onApplyToAllColumns: (alignment: TextAlignment) => void;
  onResetAlignments: () => void;
}

const HORIZONTAL_ALIGNMENTS = [
  {
    value: "left",
    label: "Izquierda",
    icon: AlignLeft,
    description: "Alinear texto a la izquierda",
  },
  {
    value: "center",
    label: "Centrado",
    icon: AlignCenter,
    description: "Centrar texto horizontalmente",
  },
  {
    value: "right",
    label: "Derecha",
    icon: AlignRight,
    description: "Alinear texto a la derecha",
  },
  {
    value: "justify",
    label: "Justificado",
    icon: AlignJustify,
    description: "Justificar texto en ambos lados",
  },
] as const;

const VERTICAL_ALIGNMENTS = [
  {
    value: "top",
    label: "Arriba",
    icon: AlignVerticalJustifyStart,
    description: "Alinear contenido en la parte superior",
  },
  {
    value: "middle",
    label: "Centro",
    icon: AlignVerticalJustifyCenter,
    description: "Centrar contenido verticalmente",
  },
  {
    value: "bottom",
    label: "Abajo",
    icon: AlignVerticalJustifyEnd,
    description: "Alinear contenido en la parte inferior",
  },
] as const;

const ALIGNMENT_PRESETS = [
  {
    name: "Estándar",
    description: "Texto a la izquierda, centrado verticalmente",
    alignment: { horizontal: "left" as const, vertical: "middle" as const },
  },
  {
    name: "Centrado",
    description: "Centrado horizontal y vertical",
    alignment: { horizontal: "center" as const, vertical: "middle" as const },
  },
  {
    name: "Números",
    description: "Números alineados a la derecha",
    alignment: { horizontal: "right" as const, vertical: "middle" as const },
  },
  {
    name: "Títulos",
    description: "Centrado para títulos destacados",
    alignment: { horizontal: "center" as const, vertical: "top" as const },
  },
];

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  columns,
  selectedColumns,
  globalAlignment,
  headerAlignment,
  columnAlignments,
  onGlobalAlignmentChange,
  onHeaderAlignmentChange,
  onColumnAlignmentChange,
  onApplyToAllColumns,
  onResetAlignments,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    "global" | "headers" | "columns"
  >("global");
  const [selectedColumn, setSelectedColumn] = React.useState<string>("");
  const [bulkMode, setBulkMode] = React.useState(false);

  // Get alignment for selected column
  const selectedColumnAlignment = selectedColumn
    ? columnAlignments[selectedColumn] || globalAlignment
    : globalAlignment;

  const updateSelectedColumnAlignment = (updates: Partial<TextAlignment>) => {
    if (selectedColumn) {
      onColumnAlignmentChange(selectedColumn, {
        ...selectedColumnAlignment,
        ...updates,
      });
    }
  };

  const applyPresetToSelected = (alignment: TextAlignment) => {
    if (bulkMode) {
      selectedColumns.forEach((columnKey) => {
        onColumnAlignmentChange(columnKey, alignment);
      });
    } else if (selectedColumn) {
      onColumnAlignmentChange(selectedColumn, alignment);
    }
  };

  const getColumnTypeRecommendation = (column: ExcelColumn): TextAlignment => {
    switch (column.type) {
      case "number":
        return { horizontal: "right", vertical: "middle" };
      case "boolean":
        return { horizontal: "center", vertical: "middle" };
      case "date":
        return { horizontal: "center", vertical: "middle" };
      case "text":
      default:
        return { horizontal: "left", vertical: "middle" };
    }
  };

  const applyTypeBasedAlignment = () => {
    columns.forEach((column) => {
      if (selectedColumns.includes(column.key)) {
        const recommended = getColumnTypeRecommendation(column);
        onColumnAlignmentChange(column.key, recommended);
      }
    });
  };

  const renderAlignmentButtons = (
    currentAlignment: TextAlignment,
    onHorizontalChange: (
      value: "left" | "center" | "right" | "justify",
    ) => void,
    onVerticalChange: (value: "top" | "middle" | "bottom") => void,
  ) => (
    <div className="space-y-4">
      {/* Horizontal Alignment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Alineación horizontal</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {HORIZONTAL_ALIGNMENTS.map((align) => {
            const Icon = align.icon;
            return (
              <Button
                key={align.value}
                variant={
                  currentAlignment.horizontal === align.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => onHorizontalChange(align.value)}
                className="flex flex-col items-center gap-1 h-auto py-3"
                title={align.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{align.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Vertical Alignment */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Alineación vertical</Label>
        <div className="grid grid-cols-3 gap-2">
          {VERTICAL_ALIGNMENTS.map((align) => {
            const Icon = align.icon;
            return (
              <Button
                key={align.value}
                variant={
                  currentAlignment.vertical === align.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => onVerticalChange(align.value)}
                className="flex flex-col items-center gap-1 h-auto py-3"
                title={align.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{align.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === "global" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("global")}
          className="flex-1"
        >
          <Table className="h-4 w-4 mr-2" />
          Global
        </Button>
        <Button
          variant={activeTab === "headers" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("headers")}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Encabezados
        </Button>
        <Button
          variant={activeTab === "columns" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("columns")}
          className="flex-1"
        >
          <Columns3 className="h-4 w-4 mr-2" />
          Columnas
        </Button>
      </div>

      {/* Global Alignment */}
      {activeTab === "global" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alineación Global</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configuración predeterminada para todas las celdas de datos
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderAlignmentButtons(
              globalAlignment,
              (horizontal) =>
                onGlobalAlignmentChange({ ...globalAlignment, horizontal }),
              (vertical) =>
                onGlobalAlignmentChange({ ...globalAlignment, vertical }),
            )}

            <Separator />

            {/* Preset Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Presets rápidos</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALIGNMENT_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => onGlobalAlignmentChange(preset.alignment)}
                    className="h-auto py-2 flex flex-col items-start"
                  >
                    <span className="font-medium">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onResetAlignments}
              className="w-full"
            >
              Restablecer a valores predeterminados
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header Alignment */}
      {activeTab === "headers" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alineación de Encabezados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configuración específica para las filas de encabezado
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderAlignmentButtons(
              headerAlignment,
              (horizontal) =>
                onHeaderAlignmentChange({ ...headerAlignment, horizontal }),
              (vertical) =>
                onHeaderAlignmentChange({ ...headerAlignment, vertical }),
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Presets para encabezados
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onHeaderAlignmentChange({
                      horizontal: "left",
                      vertical: "middle",
                    })
                  }
                >
                  Estándar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onHeaderAlignmentChange({
                      horizontal: "center",
                      vertical: "middle",
                    })
                  }
                >
                  Centrado
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column-Specific Alignment */}
      {activeTab === "columns" && (
        <div className="space-y-4">
          {/* Column Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Seleccionar columna</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una columna para personalizar" />
                </SelectTrigger>
                <SelectContent>
                  {columns
                    .filter((col) => selectedColumns.includes(col.key))
                    .map((column) => (
                      <SelectItem key={column.key} value={column.key}>
                        <div className="flex items-center justify-between w-full">
                          <span>{column.label}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {column.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="bulk-mode"
                  checked={bulkMode}
                  onCheckedChange={setBulkMode}
                />
                <Label htmlFor="bulk-mode" className="text-sm">
                  Aplicar a todas las columnas visibles
                </Label>
              </div>

              {bulkMode && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Los cambios se aplicarán a las {selectedColumns.length}{" "}
                  columnas visibles
                </div>
              )}
            </CardContent>
          </Card>

          {/* Column Alignment Controls */}
          {(selectedColumn || bulkMode) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {bulkMode
                    ? `Alineación para ${selectedColumns.length} columnas`
                    : `Alineación: ${columns.find((c) => c.key === selectedColumn)?.label}`}
                </CardTitle>
                {selectedColumn && !bulkMode && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {columns.find((c) => c.key === selectedColumn)?.type}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {renderAlignmentButtons(
                  selectedColumnAlignment,
                  (horizontal) =>
                    bulkMode
                      ? selectedColumns.forEach((col) =>
                          onColumnAlignmentChange(col, {
                            ...selectedColumnAlignment,
                            horizontal,
                          }),
                        )
                      : updateSelectedColumnAlignment({ horizontal }),
                  (vertical) =>
                    bulkMode
                      ? selectedColumns.forEach((col) =>
                          onColumnAlignmentChange(col, {
                            ...selectedColumnAlignment,
                            vertical,
                          }),
                        )
                      : updateSelectedColumnAlignment({ vertical }),
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Presets rápidos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALIGNMENT_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPresetToSelected(preset.alignment)}
                        className="h-auto py-2 flex flex-col items-start"
                      >
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.description}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={applyTypeBasedAlignment}
                  className="w-full"
                >
                  Aplicar alineación recomendada por tipo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Column Overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Vista general de columnas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {columns
                  .filter((col) => selectedColumns.includes(col.key))
                  .map((column) => {
                    const alignment =
                      columnAlignments[column.key] || globalAlignment;
                    const HorizontalIcon =
                      HORIZONTAL_ALIGNMENTS.find(
                        (a) => a.value === alignment.horizontal,
                      )?.icon || AlignLeft;
                    const VerticalIcon =
                      VERTICAL_ALIGNMENTS.find(
                        (a) => a.value === alignment.vertical,
                      )?.icon || AlignVerticalJustifyCenter;

                    return (
                      <div
                        key={column.key}
                        className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedColumn(column.key)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {column.label}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {column.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <HorizontalIcon className="h-3 w-3 text-muted-foreground" />
                          <VerticalIcon className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
