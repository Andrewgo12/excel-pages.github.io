import React, { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
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
import { generateSampleData } from "@/utils/sampleDataGenerator";
import { generateMultiSheetData } from "@/utils/multiSheetGenerator";
import {
  calculateDatasetStats,
  calculateColumnStats,
  formatStatValue,
  generateColumnSummary,
} from "@/utils/statisticalAnalysis";
import {
  loadCompleteExcelFile,
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

import { ActionsMenu } from "@/components/ActionsMenu";
import { TableStylesControl } from "@/components/TableStylesControl";
import { CustomizableTable } from "@/components/CustomizableTable";
import {
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
  const [excelData, setExcelData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    totalRows: 0,
  });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  // Panel management - only one panel open at a time
  const [activePanel, setActivePanel] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

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
  const togglePanel = (panelName) => {
    setActivePanel(activePanel === panelName ? null : panelName);
  };
  const [searchMode, setSearchMode] = useState("normal");
  const [regexError, setRegexError] = useState(null);
  const [datasetStats, setDatasetStats] = useState(null);

  // Multi-sheet management
  const [multiSheetAnalysis, setMultiSheetAnalysis] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [sheetNavigatorOpen, setSheetNavigatorOpen] = useState(false);

  // Table customization
  const [tableCustomization, setTableCustomization] = useState(DEFAULT_TABLE_CUSTOMIZATION);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Show loading state
      setIsFileLoading(true);

      // Use advanced multi-sheet loader
      const { data, analysis } = await loadCompleteExcelFile(file);

      setExcelData(data);
      setMultiSheetAnalysis(analysis);
      setSelectedColumns(data.columns.slice(0, 8).map((c) => c.key)); // Show first 8 columns by default
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
    } catch (error) {
      console.error("Error reading Excel file:", error);
      setFileError(
        "Error al cargar el archivo Excel. Verifique que el archivo no esté corrupto.",
      );
    } finally {
      setIsFileLoading(false);
    }
  }, []);

  const inferColumnType = (rows, column) => {
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
            const parseDate = (dateStr) => {
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
    const newGroup = {
      id: Date.now().toString(),
      logic: "AND",
      conditions: [],
    };
    setFilterGroups([...filterGroups, newGroup]);
  };

  const addFilterCondition = (groupId) => {
    const newCondition = {
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

  const updateFilterCondition = (groupId, conditionId, updates) => {
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

  const removeFilterCondition = (groupId, conditionId) => {
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

  const removeFilterGroup = (groupId) => {
    setFilterGroups((groups) => groups.filter((g) => g.id !== groupId));
  };

  const handleSort = (column) => {
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
      const exportRow = {};
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

  const switchSheet = async (sheetName) => {
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

  const loadConfiguration = (config) => {
    setSelectedColumns(config.config.selectedColumns || []);
    setFilterGroups(config.config.filterGroups || []);
    setGlobalSearch(config.config.globalSearch || "");
    setSearchMode(config.config.searchMode || "normal");
    setColumnFilters(config.config.columnFilters || {});
    setSortColumn(config.config.sortColumn || null);
    setSortDirection(config.config.sortDirection || "asc");
    setPagination((prev) => ({ ...prev, ...config.config.pagination }));
  };

  const handlePreferencesChange = (preferences) => {
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

  const handleDataChange = (newData) => {
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
            <p className="text-xs text-muted-foreground mt-1">
              Desarrollado por{" "}
              <span className="font-medium">Kevin Andrés González Dinas</span>
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
      {/* Rest of component implementation - truncated for brevity */}
      <div>Data view would be rendered here</div>
    </div>
  );
}
