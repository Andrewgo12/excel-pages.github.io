import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TableCustomization,
  generateTableStyles,
  getColumnCustomization,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";

interface CustomizableTableProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
  customization: TableCustomization;
  className?: string;
  onRowClick?: (row: Record<string, any>, index: number) => void;
  onCellClick?: (
    value: any,
    column: ExcelColumn,
    row: Record<string, any>,
  ) => void;
  renderCell?: (
    value: any,
    column: ExcelColumn,
    row: Record<string, any>,
  ) => React.ReactNode;
  renderHeader?: (column: ExcelColumn) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    totalRows: number;
  };
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string) => void;
  stripedRows?: boolean;
}

export const CustomizableTable: React.FC<CustomizableTableProps> = ({
  data,
  columns,
  selectedColumns,
  customization,
  className,
  onRowClick,
  onCellClick,
  renderCell,
  renderHeader,
  pagination,
  sortColumn,
  sortDirection,
  onSort,
  stripedRows = true,
}) => {
  const visibleColumns = useMemo(
    () => columns.filter((col) => selectedColumns.includes(col.key)),
    [columns, selectedColumns],
  );

  const tableStyles = useMemo(
    () => generateTableStyles(customization),
    [customization],
  );

  const getCellAlignment = (column: ExcelColumn) => {
    const columnCustomization = getColumnCustomization(
      customization,
      column.key,
    );
    return columnCustomization.alignment || customization.defaultAlignment;
  };

  const getCellStyle = (column: ExcelColumn, isHeader = false) => {
    const columnCustomization = getColumnCustomization(
      customization,
      column.key,
    );
    const alignment =
      columnCustomization.alignment ||
      (isHeader
        ? customization.headerAlignment
        : customization.defaultAlignment);
    const colorScheme = isHeader
      ? customization.headerColorScheme
      : customization.colorScheme;
    const font = isHeader ? customization.headerFont : customization.cellFont;

    return {
      textAlign: alignment.horizontal as any,
      verticalAlign: alignment.vertical as any,
      fontFamily: columnCustomization.fontSettings?.family || font.family,
      fontSize: `${columnCustomization.fontSettings?.size || font.size}px`,
      fontWeight: columnCustomization.fontSettings?.weight || font.weight,
      fontStyle: columnCustomization.fontSettings?.style || font.style,
      lineHeight:
        columnCustomization.fontSettings?.lineHeight || font.lineHeight,
      backgroundColor: isHeader ? colorScheme.background : undefined,
      color: isHeader ? colorScheme.text : undefined,
      borderStyle: customization.borderSettings.style,
      borderWidth: `${customization.borderSettings.width}px`,
      borderColor: customization.borderSettings.color,
      padding: `${customization.spacing.padding.top}px ${customization.spacing.padding.right}px ${customization.spacing.padding.bottom}px ${customization.spacing.padding.left}px`,
      width: columnCustomization.width
        ? `${columnCustomization.width}px`
        : undefined,
      minWidth: columnCustomization.minWidth
        ? `${columnCustomization.minWidth}px`
        : undefined,
      maxWidth: columnCustomization.maxWidth
        ? `${columnCustomization.maxWidth}px`
        : undefined,
    };
  };

  const getRowStyle = (rowIndex: number) => {
    const isStriped =
      customization.showStriping &&
      customization.alternateRowColors &&
      rowIndex % customization.stripingInterval === 0;

    return {
      backgroundColor: isStriped
        ? customization.colorScheme.striped
        : customization.colorScheme.background,
      color: customization.colorScheme.text,
    };
  };

  const formatCellValue = (value: any, column: ExcelColumn) => {
    const columnCustomization = getColumnCustomization(
      customization,
      column.key,
    );

    if (value === null || value === undefined || value === "") {
      return "";
    }

    switch (columnCustomization.formatter) {
      case "currency":
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(Number(value) || 0);

      case "percentage":
        return `${(Number(value) * 100).toFixed(2)}%`;

      case "number":
        return new Intl.NumberFormat("es-ES").format(Number(value) || 0);

      case "date":
        try {
          return new Date(value).toLocaleDateString("es-ES");
        } catch {
          return String(value);
        }

      case "datetime":
        try {
          return new Date(value).toLocaleString("es-ES");
        } catch {
          return String(value);
        }

      case "custom":
        if (columnCustomization.customFormatter) {
          try {
            // Simple template replacement for custom formatters
            return columnCustomization.customFormatter.replace(
              /\{value\}/g,
              String(value),
            );
          } catch {
            return String(value);
          }
        }
        return String(value);

      default:
        // Type-based formatting
        switch (column.type) {
          case "number":
            return isNaN(Number(value))
              ? String(value)
              : Number(value).toLocaleString("es-ES");
          case "boolean":
            return value ? "Sí" : "No";
          case "date":
            try {
              return new Date(value).toLocaleDateString("es-ES");
            } catch {
              return String(value);
            }
          default:
            return String(value);
        }
    }
  };

  const tableContainerClass = cn(
    "relative w-full overflow-auto",
    customization.showShadows && "shadow-lg",
    customization.responsive && "table-responsive",
    className,
  );

  const tableClass = cn(
    "w-full caption-bottom text-sm",
    customization.stickyHeader &&
      "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10",
  );

  return (
    <div
      className={tableContainerClass}
      style={{
        ...tableStyles,
        borderRadius: `${customization.borderSettings.radius}px`,
        margin: `${customization.spacing.margin.top}px ${customization.spacing.margin.right}px ${customization.spacing.margin.bottom}px ${customization.spacing.margin.left}px`,
      }}
    >
      <Table className={tableClass}>
        <TableHeader>
          <TableRow
            style={{
              backgroundColor: customization.headerColorScheme.background,
              borderBottomStyle: customization.borderSettings.style,
              borderBottomWidth: `${customization.borderSettings.width}px`,
              borderBottomColor: customization.borderSettings.color,
            }}
          >
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                style={getCellStyle(column, true)}
                className={cn(
                  customization.stickyHeader && "sticky top-0 z-10",
                  onSort &&
                    "cursor-pointer hover:bg-opacity-80 transition-colors",
                )}
                onClick={() => onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {renderHeader ? (
                    renderHeader(column)
                  ) : (
                    <>
                      <span>{column.label}</span>
                      {sortColumn === column.key && (
                        <span className="text-xs">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              style={getRowStyle(rowIndex)}
              className={cn(
                customization.showHoverEffects &&
                  "hover:opacity-80 transition-all duration-200",
                onRowClick && "cursor-pointer",
              )}
              onClick={() => onRowClick?.(row, rowIndex)}
              onMouseEnter={(e) => {
                if (customization.showHoverEffects) {
                  e.currentTarget.style.backgroundColor =
                    customization.colorScheme.hover;
                }
              }}
              onMouseLeave={(e) => {
                if (customization.showHoverEffects) {
                  const isStriped =
                    customization.showStriping &&
                    customization.alternateRowColors &&
                    rowIndex % customization.stripingInterval === 0;
                  e.currentTarget.style.backgroundColor = isStriped
                    ? customization.colorScheme.striped
                    : customization.colorScheme.background;
                }
              }}
            >
              {visibleColumns.map((column) => {
                const value = row[column.key];
                const formattedValue = formatCellValue(value, column);

                return (
                  <TableCell
                    key={column.key}
                    style={getCellStyle(column, false)}
                    className={cn(
                      onCellClick && "cursor-pointer",
                      "transition-colors duration-200",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCellClick?.(value, column, row);
                    }}
                  >
                    {renderCell ? (
                      renderCell(value, column, row)
                    ) : (
                      <div className="truncate" title={String(formattedValue)}>
                        {formattedValue}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Virtual scrolling support for large datasets */}
      {customization.virtualization &&
        data.length > customization.virtualizationThreshold && (
          <div className="absolute bottom-2 right-2 bg-muted/80 text-xs px-2 py-1 rounded">
            Virtualización activa ({data.length.toLocaleString()} filas)
          </div>
        )}
    </div>
  );
};

// Enhanced table hook for easier integration
export const useCustomizableTable = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  selectedColumns: string[],
  customization: TableCustomization,
) => {
  const tableProps = useMemo(
    () => ({
      data,
      columns,
      selectedColumns,
      customization,
    }),
    [data, columns, selectedColumns, customization],
  );

  const styles = useMemo(
    () => generateTableStyles(customization),
    [customization],
  );

  return {
    tableProps,
    styles,
    CustomizableTable,
  };
};

// Export both the component and the hook
export default CustomizableTable;
