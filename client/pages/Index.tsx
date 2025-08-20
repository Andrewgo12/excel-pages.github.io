import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  FileSpreadsheet,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download,
  Columns,
  X,
  Plus,
  Search,
  Database,
  BarChart3,
  TrendingUp,
  Grid,
} from "lucide-react";
import {
  ExcelData,
  ExcelColumn,
  FilterCondition,
  FilterGroup,
  PaginationConfig,
} from "@shared/excel-types";
import { generateSampleData } from "@/utils/sampleDataGenerator";
import { generateMultiSheetData } from "@/utils/multiSheetGenerator";
import {
  calculateDatasetStats,
  calculateColumnStats,
  formatStatValue,
  generateColumnSummary,
  DatasetStats,
  ColumnStats,
} from "@/utils/statisticalAnalysis";
import {
  loadCompleteExcelFile,
  MultiSheetAnalysis,
  optimizeSheetForDisplay,
} from "@/utils/multiSheetExcel";
// Lazy loaded components for performance optimization
const DataVisualization = lazy(() =>
  import("@/components/DataVisualization").then((m) => ({
    default: m.DataVisualization,
  })),
);
const DataAggregation = lazy(() =>
  import("@/components/DataAggregation").then((m) => ({
    default: m.DataAggregation,
  })),
);
const ConfigurationManager = lazy(() =>
  import("@/components/ConfigurationManager").then((m) => ({
    default: m.ConfigurationManager,
  })),
);
const BulkOperations = lazy(() =>
  import("@/components/BulkOperations").then((m) => ({
    default: m.BulkOperations,
  })),
);
const EnhancedExport = lazy(() =>
  import("@/components/EnhancedExport").then((m) => ({
    default: m.EnhancedExport,
  })),
);
const DataValidation = lazy(() =>
  import("@/components/DataValidation").then((m) => ({
    default: m.DataValidation,
  })),
);
const DynamicDataForm = lazy(() =>
  import("@/components/DynamicDataForm").then((m) => ({
    default: m.DynamicDataForm,
  })),
);
const RealTimeAnalytics = lazy(() =>
  import("@/components/RealTimeAnalytics").then((m) => ({
    default: m.RealTimeAnalytics,
  })),
);
const AdvancedAnalytics = lazy(() =>
  import("@/components/AdvancedAnalytics").then((m) => ({
    default: m.AdvancedAnalytics,
  })),
);
const MachineLearning = lazy(() =>
  import("@/components/MachineLearning").then((m) => ({
    default: m.MachineLearning,
  })),
);
const DataCleaning = lazy(() =>
  import("@/components/DataCleaning").then((m) => ({
    default: m.DataCleaning,
  })),
);
const FontSettings = lazy(() =>
  import("@/components/FontSettings").then((m) => ({
    default: m.FontSettings,
  })),
);
const SheetNavigator = lazy(() =>
  import("@/components/SheetNavigator").then((m) => ({
    default: m.SheetNavigator,
  })),
);
const UnifiedFileUploader = lazy(() =>
  import("@/components/UnifiedFileUploader").then((m) => ({
    default: m.default,
  })),
);

import { ActionsMenu } from "@/components/ActionsMenu";
import { TableStylesControl } from "@/components/TableStylesControl";
import { CustomizableTable } from "@/components/CustomizableTable";
import {
  TableCustomization,
  DEFAULT_TABLE_CUSTOMIZATION,
} from "@shared/table-customization";

const OPERATORS = [
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "No igual a" },
  { value: "contains", label: "Contiene" },
  { value: "not_contains", label: "No contiene" },
  { value: "starts_with", label: "Comienza con" },
  { value: "ends_with", label: "Termina con" },
  { value: "greater", label: "Mayor que" },
  { value: "greater_equal", label: "Mayor o igual que" },
  { value: "less", label: "Menor que" },
  { value: "less_equal", label: "Menor o igual que" },
  { value: "between", label: "Entre" },
  { value: "is_empty", label: "Está vacío" },
  { value: "is_not_empty", label: "No está vacío" },
  { value: "date_today", label: "Es hoy" },
  { value: "date_yesterday", label: "Es ayer" },
  { value: "date_this_week", label: "Esta semana" },
  { value: "date_this_month", label: "Este mes" },
  { value: "date_this_year", label: "Este año" },
  { value: "date_last_7_days", label: "Últimos 7 días" },
  { value: "date_last_30_days", label: "Últimos 30 días" },
];

export default function Index() {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([]);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 25,
    totalRows: 0,
  });
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  // Panel management - only one panel open at a time
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {},
  );

  // Derived states for panel visibility
  const isColumnSelectorOpen = activePanel === "columnSelector";
  const isFilterOpen = activePanel === "filter";
  const isStatsOpen = activePanel === "stats";
  const isVisualizationOpen = activePanel === "visualization";
  const isAggregationOpen = activePanel === "aggregation";
  const isConfigurationOpen = activePanel === "configuration";
  const isBulkOperationsOpen = activePanel === "bulkOperations";
  const isEnhancedExportOpen = activePanel === "enhancedExport";
  const isDataValidationOpen = activePanel === "dataValidation";
  const isAdvancedSearchOpen = activePanel === "advancedSearch";
  const isDataFormOpen = activePanel === "dataForm";
  const isRealTimeAnalyticsOpen = activePanel === "realTimeAnalytics";
  const isAdvancedAnalyticsOpen = activePanel === "advancedAnalytics";
  const isMachineLearningOpen = activePanel === "machineLearning";
  const isDataCleaningOpen = activePanel === "dataCleaning";
  const isFontSettingsOpen = activePanel === "fontSettings";
  const isSheetNavigatorOpen = activePanel === "sheetNavigator";

  // Helper function to toggle panels
  const togglePanel = (panelName: string) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };
  const [searchMode, setSearchMode] = useState<"normal" | "regex" | "pattern">(
    "normal",
  );
  const [regexError, setRegexError] = useState<string | null>(null);
  const [datasetStats, setDatasetStats] = useState<DatasetStats | null>(null);

  // Multi-sheet management
  const [multiSheetAnalysis, setMultiSheetAnalysis] =
    useState<MultiSheetAnalysis | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [sheetNavigatorOpen, setSheetNavigatorOpen] = useState(false);

  // Table customization
  const [tableCustomization, setTableCustomization] =
    useState<TableCustomization>(DEFAULT_TABLE_CUSTOMIZATION);

  const handleDataLoaded = useCallback((data: ExcelData, metadata?: any) => {
    setExcelData(data);

    // Set multi-sheet analysis if available (from Excel files)
    if (metadata?.analysis) {
      setMultiSheetAnalysis(metadata.analysis);
    } else {
      setMultiSheetAnalysis(null);
    }

    // Show first 8 columns by default
    setSelectedColumns(data.columns.slice(0, 8).map((c) => c.key));
    setPagination((prev) => ({
      ...prev,
      totalRows: data.rows.length,
      page: 1,
    }));

    // Reset filters and search when new file is loaded
    setGlobalSearch("");
    setColumnFilters({});
    setFilterGroups([]);

    // Clear any previous errors
    setFileError(null);
    setIsFileLoading(false);
  }, []);

  const handleFileError = useCallback((error: string) => {
    setFileError(error);
    setIsFileLoading(false);
  }, []);

  const inferColumnType = (
    rows: Record<string, any>[],
    column: string,
  ): "text" | "number" | "date" | "boolean" => {
    const sample = rows
      .slice(0, 10)
      .map((row) => row[column])
      .filter((val) => val !== null && val !== undefined && val !== "");

    if (sample.length === 0) return "text";

    // Check if all values are numbers
    if (sample.every((val) => !isNaN(Number(val)))) return "number";

    // Check if all values are dates
    if (sample.every((val) => !isNaN(Date.parse(val)))) return "date";

    // Check if all values are booleans
    if (
      sample.every(
        (val) =>
          val === true || val === false || val === "true" || val === "false",
      )
    )
      return "boolean";

    return "text";
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const filteredAndSortedData = useMemo(() => {
    if (!excelData) return [];

    let filtered = excelData.rows;

    // Apply global search
    if (globalSearch.trim()) {
      try {
        setRegexError(null);

        if (searchMode === "regex") {
          const regex = new RegExp(globalSearch, "i");
          filtered = filtered.filter((row) =>
            Object.values(row).some((value) => regex.test(String(value || ""))),
          );
        } else if (searchMode === "pattern") {
          // Pattern matching with wildcards (* and ?)
          const pattern = globalSearch
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // Escape special chars
            .replace(/\\\*/g, ".*") // Convert * to .*
            .replace(/\\\?/g, "."); // Convert ? to .
          const regex = new RegExp(pattern, "i");
          filtered = filtered.filter((row) =>
            Object.values(row).some((value) => regex.test(String(value || ""))),
          );
        } else {
          // Normal search
          const searchTerm = globalSearch.toLowerCase();
          filtered = filtered.filter((row) =>
            Object.values(row).some((value) =>
              String(value || "")
                .toLowerCase()
                .includes(searchTerm),
            ),
          );
        }
      } catch (error) {
        setRegexError("Expresión regular inválida");
        // Fall back to normal search
        const searchTerm = globalSearch.toLowerCase();
        filtered = filtered.filter((row) =>
          Object.values(row).some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(searchTerm),
          ),
        );
      }
    }

    // Apply column-specific filters
    if (Object.keys(columnFilters).length > 0) {
      filtered = filtered.filter((row) =>
        Object.entries(columnFilters).every(([column, filterValue]) => {
          if (!filterValue.trim()) return true;
          const value = String(row[column] || "").toLowerCase();
          return value.includes(filterValue.toLowerCase());
        }),
      );
    }

    // Apply advanced filters
    if (filterGroups.length > 0) {
      filtered = filtered.filter((row) => {
        return filterGroups.every((group) => {
          if (group.conditions.length === 0) return true;

          const results = group.conditions.map((condition) => {
            const value = row[condition.column];
            const filterValue = condition.value;
            const valueStr = String(value || "").toLowerCase();
            const filterStr = String(filterValue || "").toLowerCase();

            // Date parsing helper
            const parseDate = (dateStr: string): Date | null => {
              if (!dateStr) return null;
              // Try different date formats
              const formats = [
                () => new Date(dateStr),
                () => {
                  const parts = dateStr.split("/");
                  if (parts.length === 3) {
                    return new Date(
                      parseInt(parts[2]),
                      parseInt(parts[1]) - 1,
                      parseInt(parts[0]),
                    );
                  }
                  return null;
                },
              ];

              for (const format of formats) {
                try {
                  const date = format();
                  if (date && !isNaN(date.getTime())) return date;
                } catch (e) {
                  continue;
                }
              }
              return null;
            };

            const now = new Date();
            const valueDate = parseDate(valueStr);
            const filterDate = parseDate(filterStr);

            switch (condition.operator) {
              case "equals":
                return valueStr === filterStr;
              case "not_equals":
                return valueStr !== filterStr;
              case "contains":
                return valueStr.includes(filterStr);
              case "not_contains":
                return !valueStr.includes(filterStr);
              case "starts_with":
                return valueStr.startsWith(filterStr);
              case "ends_with":
                return valueStr.endsWith(filterStr);
              case "greater":
                return Number(value) > Number(filterValue);
              case "greater_equal":
                return Number(value) >= Number(filterValue);
              case "less":
                return Number(value) < Number(filterValue);
              case "less_equal":
                return Number(value) <= Number(filterValue);
              case "between":
                return (
                  Number(value) >= Number(filterValue) &&
                  Number(value) <= Number(condition.secondValue || filterValue)
                );
              case "is_empty":
                return !value || valueStr === "";
              case "is_not_empty":
                return value && valueStr !== "";

              // Date-specific filters
              case "date_today":
                if (!valueDate) return false;
                return valueDate.toDateString() === now.toDateString();
              case "date_yesterday":
                if (!valueDate) return false;
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return valueDate.toDateString() === yesterday.toDateString();
              case "date_this_week":
                if (!valueDate) return false;
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                return valueDate >= weekStart && valueDate <= now;
              case "date_this_month":
                if (!valueDate) return false;
                return (
                  valueDate.getMonth() === now.getMonth() &&
                  valueDate.getFullYear() === now.getFullYear()
                );
              case "date_this_year":
                if (!valueDate) return false;
                return valueDate.getFullYear() === now.getFullYear();
              case "date_last_7_days":
                if (!valueDate) return false;
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return valueDate >= sevenDaysAgo && valueDate <= now;
              case "date_last_30_days":
                if (!valueDate) return false;
                const thirtyDaysAgo = new Date(now);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return valueDate >= thirtyDaysAgo && valueDate <= now;
              default:
                return true;
            }
          });

          return group.logic === "AND"
            ? results.every((r) => r)
            : results.some((r) => r);
        });
      });
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        let aVal = a[sortColumn];
        let bVal = b[sortColumn];

        // Convert to numbers if possible
        if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
          aVal = Number(aVal);
          bVal = Number(bVal);
        }

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    excelData,
    filterGroups,
    sortColumn,
    sortDirection,
    globalSearch,
    columnFilters,
  ]);

  // Calculate statistics for current filtered data
  const currentStats = useMemo(() => {
    if (!excelData) return null;
    return calculateDatasetStats(filteredAndSortedData, excelData.columns);
  }, [excelData, filteredAndSortedData]);

  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    return filteredAndSortedData.slice(
      startIndex,
      startIndex + pagination.pageSize,
    );
  }, [filteredAndSortedData, pagination]);

  const totalPages = Math.ceil(
    filteredAndSortedData.length / pagination.pageSize,
  );

  const addFilterGroup = () => {
    const newGroup: FilterGroup = {
      id: Date.now().toString(),
      logic: "AND",
      conditions: [],
    };
    setFilterGroups([...filterGroups, newGroup]);
  };

  const addFilterCondition = (groupId: string) => {
    const newCondition: FilterCondition = {
      id: Date.now().toString(),
      column: excelData?.columns[0]?.key || "",
      operator: "contains",
      value: "",
    };

    setFilterGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? { ...group, conditions: [...group.conditions, newCondition] }
          : group,
      ),
    );
  };

  const updateFilterCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>,
  ) => {
    setFilterGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition,
              ),
            }
          : group,
      ),
    );
  };

  const removeFilterCondition = (groupId: string, conditionId: string) => {
    setFilterGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              conditions: group.conditions.filter((c) => c.id !== conditionId),
            }
          : group,
      ),
    );
  };

  const removeFilterGroup = (groupId: string) => {
    setFilterGroups((groups) => groups.filter((g) => g.id !== groupId));
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const exportFilteredData = () => {
    if (!excelData || filteredAndSortedData.length === 0) return;

    const exportData = filteredAndSortedData.map((row) => {
      const exportRow: Record<string, any> = {};
      selectedColumns.forEach((col) => {
        exportRow[col] = row[col];
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    XLSX.writeFile(workbook, "filtered_data.xlsx");
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData();
    setExcelData(sampleData);
    setSelectedColumns(sampleData.columns.slice(0, 8).map((c) => c.key)); // Show first 8 columns
    setPagination((prev) => ({
      ...prev,
      totalRows: sampleData.rows.length,
      page: 1,
    }));
    setGlobalSearch("");
    setColumnFilters({});
    setFilterGroups([]);
  };

  const loadMultiSheetData = () => {
    const multiData = generateMultiSheetData();
    setExcelData(multiData);
    setSelectedColumns(multiData.columns.slice(0, 8).map((c) => c.key));
    setPagination((prev) => ({
      ...prev,
      totalRows: multiData.rows.length,
      page: 1,
    }));
    setGlobalSearch("");
    setColumnFilters({});
    setFilterGroups([]);
  };

  const switchSheet = async (sheetName: string) => {
    if (!excelData?.sheetsData) return;

    const sheetData = excelData.sheetsData[sheetName];
    if (!sheetData) return;

    try {
      // Optimize sheet data for display if it's large
      const optimizedData = optimizeSheetForDisplay(sheetData, 5000);

      const newData = {
        ...excelData,
        activeSheet: sheetName,
        columns: optimizedData.columns,
        rows: optimizedData.rows,
      };

      setExcelData(newData);
      setSelectedColumns(optimizedData.columns.slice(0, 8).map((c) => c.key));
      setPagination((prev) => ({
        ...prev,
        totalRows: optimizedData.rows.length,
        page: 1,
      }));

      // Reset filters and search when switching sheets
      setGlobalSearch("");
      setColumnFilters({});
      setFilterGroups([]);

      // Close sheet navigator if it's open
      if (activePanel === "sheetNavigator") {
        setActivePanel(null);
      }
    } catch (error) {
      console.error("Error switching sheet:", error);
    }
  };

  const getCurrentConfiguration = () => ({
    selectedColumns,
    filterGroups,
    globalSearch,
    searchMode,
    columnFilters,
    sortColumn,
    sortDirection,
    pagination,
  });

  const loadConfiguration = (config: any) => {
    setSelectedColumns(config.config.selectedColumns || []);
    setFilterGroups(config.config.filterGroups || []);
    setGlobalSearch(config.config.globalSearch || "");
    setSearchMode(config.config.searchMode || "normal");
    setColumnFilters(config.config.columnFilters || {});
    setSortColumn(config.config.sortColumn || null);
    setSortDirection(config.config.sortDirection || "asc");
    setPagination((prev) => ({ ...prev, ...config.config.pagination }));
  };

  const handlePreferencesChange = (preferences: any) => {
    // Apply preferences to current state
    if (preferences.defaultPageSize !== pagination.pageSize) {
      setPagination((prev) => ({
        ...prev,
        pageSize: preferences.defaultPageSize,
        page: 1,
      }));
    }

    if (preferences.defaultSearchMode !== searchMode) {
      setSearchMode(preferences.defaultSearchMode);
    }
  };

  const handleDataChange = (newData: Record<string, any>[]) => {
    if (!excelData) return;

    // Update the current sheet data
    const updatedData = {
      ...excelData,
      rows: newData,
    };

    // If we have multiple sheets, update the active sheet's data
    if (excelData.sheetsData) {
      updatedData.sheetsData = {
        ...excelData.sheetsData,
        [excelData.activeSheet]: {
          columns: excelData.columns,
          rows: newData,
        },
      };
    }

    setExcelData(updatedData);
    setPagination((prev) => ({ ...prev, totalRows: newData.length, page: 1 }));
  };

  if (!excelData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              Excel Data Explorer
            </h1>
            <p className="text-muted-foreground mt-1">
              Herramienta interactiva para visualización y exploración de datos
              Excel
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">
                  Cargar Archivo Excel
                </CardTitle>
                <p className="text-muted-foreground">
                  Arrastra y suelta tu archivo Excel (.xlsx) aquí o haz clic
                  para seleccionar
                </p>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                    ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${isFileLoading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <input {...getInputProps()} disabled={isFileLoading} />
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {isFileLoading ? (
                    <div>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-primary font-medium mb-2">
                        Procesando archivo Excel...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Analizando hojas y detectando relaciones
                      </p>
                    </div>
                  ) : isDragActive ? (
                    <p className="text-primary font-medium">
                      Suelta el archivo aquí...
                    </p>
                  ) : (
                    <div>
                      <p className="font-medium mb-2">
                        Haz clic para seleccionar o arrastra el archivo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Soporta archivos .xlsx y .xls (incluye archivos
                        complejos con múltiples hojas)
                      </p>
                    </div>
                  )}
                </div>

                {fileError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 text-center">
                  <div className="text-sm text-muted-foreground mb-3">
                    ¿Quieres ver todas las funcionalidades?
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={loadSampleData}
                      variant="outline"
                      className="gap-2"
                    >
                      <Database className="h-4 w-4" />
                      Datos Básicos
                    </Button>
                    <Button onClick={loadMultiSheetData} className="gap-2">
                      <Database className="h-4 w-4" />
                      Demo Completo
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Básicos: 80 columnas • 500 filas | Completo: 4 hojas • Datos
                    empresariales
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-responsive py-responsive">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-responsive">
            <div>
              <h1 className="text-responsive-2xl font-bold text-foreground flex items-center gap-responsive-sm">
                <FileSpreadsheet className="h-responsive-input w-responsive-input text-primary" />
                Excel Data Explorer
              </h1>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-responsive-sm">
                  <p className="text-responsive-sm text-muted-foreground">
                    {excelData.rows.length.toLocaleString()} filas •{" "}
                    {excelData.columns.length} columnas
                  </p>
                  {multiSheetAnalysis && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <Badge
                        variant="outline"
                        className={`text-responsive-xs ${
                          multiSheetAnalysis.estimatedComplexity === "simple"
                            ? "border-green-500 text-green-700"
                            : multiSheetAnalysis.estimatedComplexity ===
                                "moderate"
                              ? "border-blue-500 text-blue-700"
                              : multiSheetAnalysis.estimatedComplexity ===
                                  "complex"
                                ? "border-orange-500 text-orange-700"
                                : "border-red-500 text-red-700"
                        }`}
                      >
                        {multiSheetAnalysis.estimatedComplexity.replace(
                          "_",
                          " ",
                        )}
                      </Badge>
                      {multiSheetAnalysis.relationships.length > 0 && (
                        <Badge
                          variant="outline"
                          className="text-responsive-xs border-blue-500 text-blue-700"
                        >
                          {multiSheetAnalysis.relationships.length} relaciones
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {multiSheetAnalysis && (
                  <div className="flex items-center gap-responsive-sm">
                    <SheetNavigator
                      excelData={excelData}
                      analysis={multiSheetAnalysis}
                      currentSheet={excelData.activeSheet}
                      onSheetChange={switchSheet}
                      onClose={() => {}}
                      compact={true}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePanel("sheetNavigator")}
                      className="button-responsive text-responsive-xs gap-1"
                    >
                      <Grid className="h-responsive-input w-responsive-input" />
                      Explorar Hojas
                    </Button>
                    <div className="text-responsive-xs text-muted-foreground">
                      Procesado en {multiSheetAnalysis.processingTime}ms
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet Tabs - Enhanced */}
              {excelData.sheetsData && excelData.sheetNames.length > 1 && (
                <div className="mt-responsive">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-responsive-xs text-muted-foreground">
                      Hojas del archivo ({excelData.sheetNames.length})
                    </Label>
                    {multiSheetAnalysis && (
                      <Badge variant="outline" className="text-responsive-xs">
                        {multiSheetAnalysis.estimatedComplexity.replace(
                          "_",
                          " ",
                        )}
                      </Badge>
                    )}
                  </div>
                  <ScrollArea className="w-full">
                    <div className="flex gap-responsive-sm pb-2">
                      {excelData.sheetNames.map((sheetName) => {
                        const sheetAnalysis =
                          multiSheetAnalysis?.sheetAnalyses.find(
                            (s) => s.name === sheetName,
                          );
                        const hasRelationships =
                          multiSheetAnalysis?.relationships.some(
                            (rel) =>
                              rel.sourceSheet === sheetName ||
                              rel.targetSheet === sheetName,
                          );
                        const isRecommended =
                          sheetName ===
                          multiSheetAnalysis?.recommendedStartSheet;

                        return (
                          <Button
                            key={sheetName}
                            variant={
                              excelData.activeSheet === sheetName
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => switchSheet(sheetName)}
                            className="button-responsive text-responsive-xs whitespace-nowrap relative"
                          >
                            <div className="flex items-center gap-1">
                              {isRecommended && (
                                <span className="text-yellow-500">★</span>
                              )}
                              <span className="truncate max-w-24">
                                {sheetName}
                              </span>
                              {sheetAnalysis && !sheetAnalysis.isEmpty && (
                                <Badge
                                  variant="secondary"
                                  className="text-responsive-xs ml-1"
                                >
                                  {sheetAnalysis.rowCount.toLocaleString()}
                                </Badge>
                              )}
                              {hasRelationships && (
                                <div
                                  className="w-2 h-2 bg-blue-500 rounded-full ml-1"
                                  title="Tiene relaciones con otras hojas"
                                />
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {multiSheetAnalysis &&
                    multiSheetAnalysis.relationships.length > 0 && (
                      <div className="text-responsive-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Indica hojas con relaciones detectadas</span>
                      </div>
                    )}
                </div>
              )}
            </div>
            <div className="flex flex-col lg:flex-row gap-responsive lg:items-center">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-responsive-input w-responsive-input text-muted-foreground" />
                  <Input
                    placeholder={
                      searchMode === "regex"
                        ? "Buscar con regex..."
                        : searchMode === "pattern"
                          ? "Buscar con patrones (* ?)..."
                          : "Buscar en todos los datos..."
                    }
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className={`control-responsive pl-8 pr-6 ${regexError ? "border-destructive" : ""}`}
                  />
                  {globalSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGlobalSearch("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-responsive-input w-responsive-input" />
                    </Button>
                  )}
                </div>

                {regexError && (
                  <div className="text-xs text-destructive mt-1">
                    {regexError}
                  </div>
                )}

                {Object.keys(columnFilters).some(
                  (key) => columnFilters[key],
                ) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setColumnFilters({})}
                    className="mt-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar filtros de columnas
                  </Button>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Select
                  value={searchMode}
                  onValueChange={(value: "normal" | "regex" | "pattern") =>
                    setSearchMode(value)
                  }
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="pattern">Patrones</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanel("advancedSearch")}
                  className="h-7 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Avanzado
                </Button>
              </div>
              <div className="flex flex-wrap gap-responsive-sm">
                <TableStylesControl
                  columns={excelData.columns}
                  selectedColumns={selectedColumns}
                  onCustomizationChange={(customization) => {
                    setTableCustomization(customization);
                  }}
                  onColumnResize={(columnKey, width) => {
                    // Handle column resize - we can extend this later if needed
                    console.log("Column resized:", columnKey, width);
                  }}
                  onColumnReorder={(fromIndex, toIndex) => {
                    // Handle column reorder
                    const newSelectedColumns = [...selectedColumns];
                    const [removed] = newSelectedColumns.splice(fromIndex, 1);
                    newSelectedColumns.splice(toIndex, 0, removed);
                    setSelectedColumns(newSelectedColumns);
                  }}
                  onColumnToggle={(columnKey, visible) => {
                    if (visible && !selectedColumns.includes(columnKey)) {
                      setSelectedColumns([...selectedColumns, columnKey]);
                    } else if (
                      !visible &&
                      selectedColumns.includes(columnKey)
                    ) {
                      setSelectedColumns(
                        selectedColumns.filter((col) => col !== columnKey),
                      );
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePanel("columnSelector")}
                  className="button-responsive"
                >
                  <Columns className="h-responsive-input w-responsive-input mr-2" />
                  <span className="hidden sm:inline">Columnas</span> (
                  {selectedColumns.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePanel("filter")}
                  className="button-responsive"
                >
                  <Filter className="h-responsive-input w-responsive-input mr-2" />
                  <span className="hidden sm:inline">Filtros</span> (
                  {filterGroups.reduce(
                    (sum, group) => sum + group.conditions.length,
                    0,
                  )}
                  )
                </Button>
                <ActionsMenu
                  onValidationOpen={() => togglePanel("dataValidation")}
                  onConfigurationOpen={() => togglePanel("configuration")}
                  onAggregationOpen={() => togglePanel("aggregation")}
                  onBulkOperationsOpen={() => togglePanel("bulkOperations")}
                  onExportOpen={() => togglePanel("enhancedExport")}
                  onStatsOpen={() => togglePanel("stats")}
                  onVisualizationOpen={() => togglePanel("visualization")}
                  onDataFormOpen={() => togglePanel("dataForm")}
                  onRealTimeAnalyticsOpen={() =>
                    togglePanel("realTimeAnalytics")
                  }
                  onAdvancedSearchOpen={() => togglePanel("advancedSearch")}
                  onDataCleaningOpen={() => togglePanel("dataCleaning")}
                  onPerformanceOpen={() => togglePanel("stats")}
                  onCollaborationOpen={() => togglePanel("configuration")}
                  onSecurityOpen={() => togglePanel("dataValidation")}
                  onCloudSyncOpen={() => togglePanel("enhancedExport")}
                  onAIInsightsOpen={() => togglePanel("realTimeAnalytics")}
                  onAdvancedAnalyticsOpen={() =>
                    togglePanel("advancedAnalytics")
                  }
                  onMachineLearningOpen={() => togglePanel("machineLearning")}
                  onFontSettingsOpen={() => togglePanel("fontSettings")}
                  onTableCustomizationOpen={() =>
                    togglePanel("tableCustomization")
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportFilteredData}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Exportar Rápido</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExcelData(null)}
                >
                  <span className="hidden sm:inline">Nuevo Archivo</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-responsive py-responsive-lg">
        <div className="flex flex-col lg:flex-row gap-responsive-lg">
          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-responsive">
            {/* Column Selector */}
            {isColumnSelectorOpen && (
              <Card>
                <CardHeader className="p-responsive">
                  <CardTitle className="text-responsive-lg flex items-center justify-between">
                    Seleccionar Columnas
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                      className="button-responsive"
                    >
                      <X className="h-responsive-input w-responsive-input" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-responsive">
                  <div className="flex gap-responsive-sm mb-responsive">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedColumns(excelData.columns.map((c) => c.key))
                      }
                    >
                      Todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedColumns([])}
                    >
                      Ninguna
                    </Button>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {excelData.columns.map((column) => (
                        <div
                          key={column.key}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={column.key}
                            checked={selectedColumns.includes(column.key)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedColumns([
                                  ...selectedColumns,
                                  column.key,
                                ]);
                              } else {
                                setSelectedColumns(
                                  selectedColumns.filter(
                                    (c) => c !== column.key,
                                  ),
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={column.key}
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
                </CardContent>
              </Card>
            )}

            {/* Filter Builder */}
            {isFilterOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Constructor de Filtros
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={addFilterGroup} className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Grupo
                    </Button>
                    {filterGroups.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setFilterGroups([])}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpiar Todo
                      </Button>
                    )}
                  </div>

                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {filterGroups.map((group, groupIndex) => (
                        <div key={group.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-3">
                            <Select
                              value={group.logic}
                              onValueChange={(value: "AND" | "OR") => {
                                setFilterGroups((groups) =>
                                  groups.map((g) =>
                                    g.id === group.id
                                      ? { ...g, logic: value }
                                      : g,
                                  ),
                                );
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AND">Y</SelectItem>
                                <SelectItem value="OR">O</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilterGroup(group.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {group.conditions.map((condition) => (
                              <div
                                key={condition.id}
                                className="space-y-2 border-l-2 border-muted pl-3"
                              >
                                <div className="flex gap-2">
                                  <Select
                                    value={condition.column}
                                    onValueChange={(value) =>
                                      updateFilterCondition(
                                        group.id,
                                        condition.id,
                                        { column: value },
                                      )
                                    }
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {excelData.columns.map((col) => (
                                        <SelectItem
                                          key={col.key}
                                          value={col.key}
                                        >
                                          {col.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeFilterCondition(
                                        group.id,
                                        condition.id,
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                <Select
                                  value={condition.operator}
                                  onValueChange={(value: any) =>
                                    updateFilterCondition(
                                      group.id,
                                      condition.id,
                                      { operator: value },
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {OPERATORS.map((op) => (
                                      <SelectItem
                                        key={op.value}
                                        value={op.value}
                                      >
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input
                                  placeholder="Valor"
                                  value={String(condition.value)}
                                  onChange={(e) =>
                                    updateFilterCondition(
                                      group.id,
                                      condition.id,
                                      { value: e.target.value },
                                    )
                                  }
                                />

                                {condition.operator === "between" && (
                                  <Input
                                    placeholder="Segundo valor"
                                    value={String(condition.secondValue || "")}
                                    onChange={(e) =>
                                      updateFilterCondition(
                                        group.id,
                                        condition.id,
                                        { secondValue: e.target.value },
                                      )
                                    }
                                  />
                                )}
                              </div>
                            ))}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addFilterCondition(group.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Condición
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Statistics Panel */}
            {isStatsOpen && currentStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Análisis Estadístico
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Dataset Overview */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-3">Resumen del Dataset</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Total filas:
                        </span>
                        <div className="font-medium">
                          {currentStats.totalRows.toLocaleString("es-ES")}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total columnas:
                        </span>
                        <div className="font-medium">
                          {currentStats.totalColumns}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Completitud:
                        </span>
                        <div className="font-medium">
                          {currentStats.completenessScore}%
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Filas duplicadas:
                        </span>
                        <div className="font-medium">
                          {currentStats.duplicateRows}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column Statistics */}
                  <div>
                    <h4 className="font-medium mb-3">
                      Estadísticas por Columna
                    </h4>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {currentStats.columnStats
                          .filter((stat) =>
                            selectedColumns.includes(stat.column),
                          )
                          .map((stat) => (
                            <div
                              key={stat.column}
                              className="border rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm">
                                  {stat.column}
                                </h5>
                                <Badge variant="secondary" className="text-xs">
                                  {stat.type}
                                </Badge>
                              </div>

                              <div className="text-xs text-muted-foreground mb-3">
                                {generateColumnSummary(stat)}
                              </div>

                              {/* Type-specific stats */}
                              {stat.type === "number" && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Min:
                                    </span>{" "}
                                    {formatStatValue(stat.min, "number")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Max:
                                    </span>{" "}
                                    {formatStatValue(stat.max, "number")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Media:
                                    </span>{" "}
                                    {formatStatValue(stat.mean, "number")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Mediana:
                                    </span>{" "}
                                    {formatStatValue(stat.median, "number")}
                                  </div>
                                </div>
                              )}

                              {stat.type === "date" &&
                                stat.minDate &&
                                stat.maxDate && (
                                  <div className="grid grid-cols-1 gap-1 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Desde:
                                      </span>{" "}
                                      {formatStatValue(stat.minDate, "date")}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Hasta:
                                      </span>{" "}
                                      {formatStatValue(stat.maxDate, "date")}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Rango:
                                      </span>{" "}
                                      {stat.dateRange} días
                                    </div>
                                  </div>
                                )}

                              {/* Top values */}
                              {stat.topValues.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Valores más frecuentes:
                                  </div>
                                  <div className="space-y-1">
                                    {stat.topValues
                                      .slice(0, 3)
                                      .map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex justify-between text-xs"
                                        >
                                          <span className="truncate">
                                            {String(item.value)}
                                          </span>
                                          <span className="text-muted-foreground">
                                            {item.count} ({item.percentage}%)
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Search Panel */}
            {isAdvancedSearchOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Búsqueda Avanzada
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Modo de Búsqueda</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Normal</div>
                          <div className="text-muted-foreground">
                            Búsqueda simple de texto, no sensible a mayúsculas
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Ejemplo: "madrid" encuentra "Madrid", "MADRID", etc.
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">Patrones</div>
                          <div className="text-muted-foreground">
                            Utiliza comodines: * (cualquier texto) y ? (un
                            carácter)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Ejemplos: "mad*" encuentra "madrid", "madreña" |
                            "m?drid" encuentra "madrid", "midrid"
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <div className="font-medium">
                            Regex (Expresiones Regulares)
                          </div>
                          <div className="text-muted-foreground">
                            Búsqueda avanzada con patrones complejos
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <div>• "^[A-Z]" - Comienza con mayúscula</div>
                            <div>• "\d{4}" - Exactamente 4 dígitos</div>
                            <div>
                              • "(gmail|hotmail)" - Contiene gmail o hotmail
                            </div>
                            <div>• "\w+@\w+\.\w+" - Formato de email</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Patrones Comunes</h4>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGlobalSearch("^\\d+$")}
                          className="justify-start h-auto p-2"
                        >
                          <div>
                            <div className="font-medium">^\\d+$</div>
                            <div className="text-muted-foreground">
                              Solo números
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGlobalSearch("\\w+@\\w+\\.\\w+")}
                          className="justify-start h-auto p-2"
                        >
                          <div>
                            <div className="font-medium">\\w+@\\w+\\.\\w+</div>
                            <div className="text-muted-foreground">
                              Formato de email
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGlobalSearch("^[A-Z][a-z]+")}
                          className="justify-start h-auto p-2"
                        >
                          <div>
                            <div className="font-medium">^[A-Z][a-z]+</div>
                            <div className="text-muted-foreground">
                              Comienza con mayúscula
                            </div>
                          </div>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setGlobalSearch("\\d{2}/\\d{2}/\\d{4}")
                          }
                          className="justify-start h-auto p-2"
                        >
                          <div>
                            <div className="font-medium">
                              \\d{2}/\\d{2}/\\d{4}
                            </div>
                            <div className="text-muted-foreground">
                              Formato de fecha DD/MM/YYYY
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Opciones Adicionales</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalSearch("");
                            setColumnFilters({});
                            setFilterGroups([]);
                          }}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpiar Todas las Búsquedas y Filtros
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Visualization Panel */}
            {isVisualizationOpen && currentStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Visualización de Datos
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando visualización...
                      </div>
                    }
                  >
                    <DataVisualization
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      stats={currentStats.columnStats}
                      selectedColumns={selectedColumns}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Data Aggregation Panel */}
            {isAggregationOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Agregación de Datos
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando agregaciones...
                      </div>
                    }
                  >
                    <DataAggregation
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      selectedColumns={selectedColumns}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Bulk Operations Panel */}
            {isBulkOperationsOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Operaciones Masivas y Transformaciones
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando operaciones...
                      </div>
                    }
                  >
                    <BulkOperations
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      selectedColumns={selectedColumns}
                      onDataChange={handleDataChange}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Export Panel */}
            {isEnhancedExportOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Exportación Avanzada
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando exportación...
                      </div>
                    }
                  >
                    <EnhancedExport
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      selectedColumns={selectedColumns}
                      filename={`${excelData.activeSheet}-export`}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Data Validation Panel */}
            {isDataValidationOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Validación y Calidad de Datos
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando validación...
                      </div>
                    }
                  >
                    <DataValidation
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      selectedColumns={selectedColumns}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Configuration Manager Panel */}
            {isConfigurationOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg flex items-center justify-between">
                    Gestión de Configuraciones
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando configuración...
                      </div>
                    }
                  >
                    <ConfigurationManager
                      currentConfig={getCurrentConfiguration()}
                      onLoadConfiguration={loadConfiguration}
                      onPreferencesChange={handlePreferencesChange}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Dynamic Data Form Panel */}
            {isDataFormOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm lg:text-base flex items-center justify-between">
                    Formulario Dinámico
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando formulario...
                      </div>
                    }
                  >
                    <DynamicDataForm
                      columns={excelData.columns}
                      onAddData={
                        handleDataChange
                          ? (newRow) => {
                              const updatedData = [
                                ...filteredAndSortedData,
                                newRow,
                              ];
                              handleDataChange(updatedData);
                            }
                          : () => {}
                      }
                      onBulkAdd={(newRows) => {
                        const updatedData = [
                          ...filteredAndSortedData,
                          ...newRows,
                        ];
                        handleDataChange && handleDataChange(updatedData);
                      }}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Real-time Analytics Panel */}
            {isRealTimeAnalyticsOpen && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm lg:text-base flex items-center justify-between">
                    Análisis en Tiempo Real
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActivePanel(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="p-4 text-center text-muted-foreground">
                        Cargando análisis...
                      </div>
                    }
                  >
                    <RealTimeAnalytics
                      data={filteredAndSortedData}
                      columns={excelData.columns}
                      selectedColumns={selectedColumns}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}

            {/* Advanced Analytics Panel */}
            {isAdvancedAnalyticsOpen && (
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-responsive">
                      <div className="text-center text-muted-foreground text-responsive-sm">
                        Cargando análisis avanzado...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <AdvancedAnalytics
                  data={excelData!}
                  filteredData={filteredAndSortedData}
                  selectedColumns={selectedColumns}
                  onClose={() => setActivePanel(null)}
                />
              </Suspense>
            )}

            {/* Machine Learning Panel */}
            {isMachineLearningOpen && (
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-responsive">
                      <div className="text-center text-muted-foreground text-responsive-sm">
                        Cargando Machine Learning...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <MachineLearning
                  data={excelData!}
                  filteredData={filteredAndSortedData}
                  selectedColumns={selectedColumns}
                  onClose={() => setActivePanel(null)}
                />
              </Suspense>
            )}

            {/* Data Cleaning Panel */}
            {isDataCleaningOpen && (
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-responsive">
                      <div className="text-center text-muted-foreground text-responsive-sm">
                        Cargando herramientas de limpieza...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <DataCleaning
                  data={excelData!}
                  filteredData={filteredAndSortedData}
                  selectedColumns={selectedColumns}
                  onClose={() => setActivePanel(null)}
                  onApplyCleanedData={handleDataChange}
                />
              </Suspense>
            )}

            {/* Font Settings Panel */}
            {isFontSettingsOpen && (
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-responsive">
                      <div className="text-center text-muted-foreground text-responsive-sm">
                        Cargando configuración de fuentes...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <FontSettings onClose={() => setActivePanel(null)} />
              </Suspense>
            )}

            {/* Sheet Navigator Panel */}
            {isSheetNavigatorOpen && multiSheetAnalysis && (
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-responsive">
                      <div className="text-center text-muted-foreground text-responsive-sm">
                        Cargando navegador de hojas...
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <SheetNavigator
                  excelData={excelData!}
                  analysis={multiSheetAnalysis}
                  currentSheet={excelData!.activeSheet}
                  onSheetChange={switchSheet}
                  onClose={() => setActivePanel(null)}
                />
              </Suspense>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Datos ({filteredAndSortedData.length.toLocaleString()}{" "}
                      filas)
                    </CardTitle>
                    {filteredAndSortedData.length !== excelData.rows.length && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Filtrado de {excelData.rows.length.toLocaleString()}{" "}
                        filas totales
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={pagination.pageSize.toString()}
                      onValueChange={(value) =>
                        setPagination((prev) => ({
                          ...prev,
                          pageSize: Number(value),
                          page: 1,
                        }))
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      filas por página
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedColumns.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Selecciona al menos una columna para ver los datos
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <CustomizableTable
                        data={paginatedData}
                        columns={excelData.columns}
                        selectedColumns={selectedColumns}
                        customization={tableCustomization}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        renderHeader={(column) => (
                          <div className="p-responsive-sm">
                            <div
                              className="flex items-center gap-responsive-sm cursor-pointer hover:text-primary"
                              onClick={() => handleSort(column.key)}
                            >
                              <span className="font-medium text-responsive-sm">
                                {column.label}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-responsive-xs"
                              >
                                {column.type}
                              </Badge>
                              {sortColumn === column.key && (
                                <span className="text-responsive-xs text-primary">
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                            <Input
                              placeholder={`Filtrar ${column.label}...`}
                              value={columnFilters[column.key] || ""}
                              className="control-responsive mt-responsive-sm h-7 text-xs mt-2"
                              onChange={(e) => {
                                e.stopPropagation();
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [column.key]: e.target.value,
                                }));
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        renderCell={(value, column) => (
                          <div className="truncate text-responsive-sm">
                            {column.type === "boolean" ? (
                              <Badge
                                variant={value ? "default" : "secondary"}
                                className="text-responsive-xs"
                              >
                                {value ? "Sí" : "No"}
                              </Badge>
                            ) : column.type === "number" ? (
                              <span className="font-mono text-responsive-sm">
                                {typeof value === "number"
                                  ? value.toLocaleString("es-ES")
                                  : value}
                              </span>
                            ) : column.type === "date" ? (
                              <span className="text-sm">{value || ""}</span>
                            ) : (
                              <span>{String(value || "")}</span>
                            )}
                          </div>
                        )}
                        className="table-responsive"
                      />
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Mostrando{" "}
                        {(pagination.page - 1) * pagination.pageSize + 1} a{" "}
                        {Math.min(
                          pagination.page * pagination.pageSize,
                          filteredAndSortedData.length,
                        )}{" "}
                        de {filteredAndSortedData.length.toLocaleString()} filas
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={pagination.page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <span className="text-sm">
                          Página {pagination.page} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={pagination.page === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
