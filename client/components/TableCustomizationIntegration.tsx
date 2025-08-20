import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableCustomizationPanel } from "./TableCustomizationPanel";
import { CustomizableTable } from "./CustomizableTable";
import {
  TableCustomization,
  DEFAULT_TABLE_CUSTOMIZATION,
  generateTableStyles,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";
import { Settings, Palette, Eye, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface TableCustomizationIntegrationProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
  filteredAndSortedData: Record<string, any>[];
  paginatedData: Record<string, any>[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  columnFilters: Record<string, string>;
  onSort: (columnKey: string) => void;
  onColumnFiltersChange: (filters: Record<string, string>) => void;
  pagination: {
    page: number;
    pageSize: number;
    totalRows: number;
  };
}

export const TableCustomizationIntegration: React.FC<
  TableCustomizationIntegrationProps
> = ({
  data,
  columns,
  selectedColumns,
  filteredAndSortedData,
  paginatedData,
  sortColumn,
  sortDirection,
  columnFilters,
  onSort,
  onColumnFiltersChange,
  pagination,
}) => {
  const [tableCustomization, setTableCustomization] =
    useState<TableCustomization>(DEFAULT_TABLE_CUSTOMIZATION);
  const [isCustomizationPanelOpen, setIsCustomizationPanelOpen] =
    useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load saved customization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("current-table-customization");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTableCustomization({
          ...DEFAULT_TABLE_CUSTOMIZATION,
          ...parsed,
          updatedAt: new Date(parsed.updatedAt || Date.now()),
        });
      } catch (e) {
        console.error("Error loading table customization:", e);
      }
    }
  }, []);

  // Save customization to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "current-table-customization",
      JSON.stringify(tableCustomization),
    );
  }, [tableCustomization]);

  // Apply table styles to the global CSS
  useEffect(() => {
    const styles = generateTableStyles(tableCustomization);
    const styleId = "table-customization-styles";

    // Remove existing styles
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new styles
    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = `
      .customizable-table {
        ${Object.entries(styles)
          .map(([key, value]) => `${key}: ${value};`)
          .join("\n        ")}
      }
      
      .customizable-table th {
        font-family: var(--header-font-family);
        font-size: var(--header-font-size);
        font-weight: var(--header-font-weight);
        font-style: var(--header-font-style);
        line-height: var(--header-line-height);
        background-color: var(--header-bg);
        color: var(--header-text);
        border-color: var(--header-border);
        padding: var(--cell-padding-top) var(--cell-padding-right) var(--cell-padding-bottom) var(--cell-padding-left);
      }
      
      .customizable-table td {
        font-family: var(--cell-font-family);
        font-size: var(--cell-font-size);
        font-weight: var(--cell-font-weight);
        font-style: var(--cell-font-style);
        line-height: var(--cell-line-height);
        background-color: var(--table-bg);
        color: var(--table-text);
        border-color: var(--table-border);
        padding: var(--cell-padding-top) var(--cell-padding-right) var(--cell-padding-bottom) var(--cell-padding-left);
      }
      
      .customizable-table tr:hover td {
        background-color: var(--table-hover) !important;
      }
      
      .customizable-table tr:nth-child(even) td {
        background-color: var(--table-striped);
      }
      
      ${
        tableCustomization.showShadows
          ? `
      .customizable-table {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      `
          : ""
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [tableCustomization]);

  const resetCustomization = () => {
    setTableCustomization(DEFAULT_TABLE_CUSTOMIZATION);
    localStorage.removeItem("current-table-customization");
    toast.success("Personalización restablecida");
  };

  const renderCustomHeader = (column: ExcelColumn) => (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-colors"
        onClick={() => onSort(column.key)}
      >
        <span className="font-medium">{column.label}</span>
        <Badge variant="secondary" className="text-xs">
          {column.type}
        </Badge>
        {sortColumn === column.key && (
          <span className="text-xs text-primary">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
      <Input
        placeholder={`Filtrar ${column.label}...`}
        value={columnFilters[column.key] || ""}
        className="h-7 text-xs"
        onChange={(e) => {
          e.stopPropagation();
          onColumnFiltersChange({
            ...columnFilters,
            [column.key]: e.target.value,
          });
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  const renderCustomCell = (
    value: any,
    column: ExcelColumn,
    row: Record<string, any>,
  ) => (
    <div className="truncate" title={String(value || "")}>
      {column.type === "boolean" ? (
        <Badge variant={value ? "default" : "secondary"} className="text-xs">
          {value ? "Sí" : "No"}
        </Badge>
      ) : column.type === "number" ? (
        <span className="font-mono">
          {typeof value === "number" ? value.toLocaleString("es-ES") : value}
        </span>
      ) : column.type === "date" ? (
        <span>{value || ""}</span>
      ) : (
        <span>{String(value || "")}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Customization Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizationPanelOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Personalizar Tabla
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Vista normal" : "Vista previa"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetCustomization}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="h-4 w-4" />
          <span>Estilo: {tableCustomization.name}</span>
          {tableCustomization.theme !== "light" && (
            <Badge variant="outline" className="text-xs">
              {tableCustomization.theme}
            </Badge>
          )}
        </div>
      </div>

      {/* Customizable Table */}
      <div className="relative">
        {isPreviewMode ? (
          <CustomizableTable
            data={paginatedData}
            columns={columns}
            selectedColumns={selectedColumns}
            customization={tableCustomization}
            renderHeader={renderCustomHeader}
            renderCell={renderCustomCell}
            onSort={onSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            pagination={pagination}
            className="customizable-table"
          />
        ) : (
          <CustomizableTable
            data={paginatedData}
            columns={columns}
            selectedColumns={selectedColumns}
            customization={tableCustomization}
            renderHeader={renderCustomHeader}
            renderCell={renderCustomCell}
            onSort={onSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            pagination={pagination}
            onRowClick={(row, index) => {
              console.log("Row clicked:", row, index);
            }}
            onCellClick={(value, column, row) => {
              console.log("Cell clicked:", value, column.label, row);
            }}
            className="customizable-table"
          />
        )}

        {/* Virtualization indicator */}
        {tableCustomization.virtualization &&
          filteredAndSortedData.length >
            tableCustomization.virtualizationThreshold && (
            <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
              Virtualización activa
            </div>
          )}
      </div>

      {/* Table Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
            {Math.min(
              pagination.page * pagination.pageSize,
              filteredAndSortedData.length,
            )}{" "}
            de {filteredAndSortedData.length.toLocaleString()} filas
          </span>
          {tableCustomization.showStriping && (
            <span>
              Rayas cada {tableCustomization.stripingInterval} fila
              {tableCustomization.stripingInterval > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {tableCustomization.showShadows && (
            <Badge variant="outline" className="text-xs">
              Sombras
            </Badge>
          )}
          {tableCustomization.showHoverEffects && (
            <Badge variant="outline" className="text-xs">
              Hover
            </Badge>
          )}
          {tableCustomization.stickyHeader && (
            <Badge variant="outline" className="text-xs">
              Header fijo
            </Badge>
          )}
        </div>
      </div>

      {/* Customization Panel */}
      <TableCustomizationPanel
        isOpen={isCustomizationPanelOpen}
        customization={tableCustomization}
        columns={columns}
        selectedColumns={selectedColumns}
        onCustomizationChange={setTableCustomization}
        onClose={() => setIsCustomizationPanelOpen(false)}
      />
    </div>
  );
};
