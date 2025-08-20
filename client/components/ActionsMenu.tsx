import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Settings,
  BarChart3,
  TrendingUp,
  Plus,
  Download,
  Database,
  CheckCircle,
  FileSpreadsheet,
  Activity,
  Brain,
  Zap,
  Search,
  Filter,
  Calculator,
  PieChart,
  Target,
  RefreshCw,
  Users,
  Lock,
  Cloud,
  Cpu,
  Type,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface ActionsMenuProps {
  onValidationOpen: () => void;
  onConfigurationOpen: () => void;
  onAggregationOpen: () => void;
  onBulkOperationsOpen: () => void;
  onExportOpen: () => void;
  onStatsOpen: () => void;
  onVisualizationOpen: () => void;
  onDataFormOpen: () => void;
  onRealTimeAnalyticsOpen: () => void;
  onAdvancedSearchOpen: () => void;
  onDataCleaningOpen: () => void;
  onPerformanceOpen: () => void;
  onCollaborationOpen: () => void;
  onAdvancedAnalyticsOpen: () => void;
  onMachineLearningOpen: () => void;
  onFontSettingsOpen: () => void;
  onSecurityOpen: () => void;
  onCloudSyncOpen: () => void;
  onAIInsightsOpen: () => void;
}

export function ActionsMenu({
  onValidationOpen,
  onConfigurationOpen,
  onAggregationOpen,
  onBulkOperationsOpen,
  onExportOpen,
  onStatsOpen,
  onVisualizationOpen,
  onDataFormOpen,
  onRealTimeAnalyticsOpen,
  onAdvancedSearchOpen,
  onDataCleaningOpen,
  onPerformanceOpen,
  onCollaborationOpen,
  onSecurityOpen,
  onCloudSyncOpen,
  onAIInsightsOpen,
  onAdvancedAnalyticsOpen,
  onMachineLearningOpen,
  onFontSettingsOpen,
}: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Menu className="h-3 w-3 mr-1" />
          Menú
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-semibold">
          📊 Análisis de Datos
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onRealTimeAnalyticsOpen}
            className="text-xs"
          >
            <Activity className="h-3 w-3 mr-2" />
            Análisis en Tiempo Real
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onStatsOpen} className="text-xs">
            <BarChart3 className="h-3 w-3 mr-2" />
            Estadísticas Básicas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAdvancedAnalyticsOpen} className="text-xs">
            <Target className="h-3 w-3 mr-2" />
            Análisis Avanzado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMachineLearningOpen} className="text-xs">
            <Cpu className="h-3 w-3 mr-2" />
            Machine Learning
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onVisualizationOpen} className="text-xs">
            <TrendingUp className="h-3 w-3 mr-2" />
            Gráficos Interactivos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAIInsightsOpen} className="text-xs">
            <Brain className="h-3 w-3 mr-2" />
            Insights con IA
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold">
          ✏️ Gestión de Datos
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onDataFormOpen} className="text-xs">
            <FileSpreadsheet className="h-3 w-3 mr-2" />
            Formulario Dinámico
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBulkOperationsOpen} className="text-xs">
            <Plus className="h-3 w-3 mr-2" />
            Operaciones Masivas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDataCleaningOpen} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-2" />
            Limpieza de Datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onValidationOpen} className="text-xs">
            <CheckCircle className="h-3 w-3 mr-2" />
            Validación y Calidad
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold">
          🔍 Búsqueda y Filtros
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onAdvancedSearchOpen} className="text-xs">
            <Search className="h-3 w-3 mr-2" />
            Búsqueda Avanzada
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAggregationOpen} className="text-xs">
            <Database className="h-3 w-3 mr-2" />
            Agregaciones Inteligentes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-xs">
            <Filter className="h-3 w-3 mr-2" />
            Filtros Dinámicos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-xs">
            <Calculator className="h-3 w-3 mr-2" />
            Calculadora de Campos
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold">
          📤 Exportación y Reportes
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onExportOpen} className="text-xs">
            <Download className="h-3 w-3 mr-2" />
            Exportación Avanzada
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-xs">
            <PieChart className="h-3 w-3 mr-2" />
            Reportes Automáticos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-xs">
            <Target className="h-3 w-3 mr-2" />
            Dashboard Personalizado
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold">
          ⚙️ Productividad
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onPerformanceOpen} className="text-xs">
            <Cpu className="h-3 w-3 mr-2" />
            Optimización de Rendimiento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCollaborationOpen} className="text-xs">
            <Users className="h-3 w-3 mr-2" />
            Colaboración en Tiempo Real
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCloudSyncOpen} className="text-xs">
            <Cloud className="h-3 w-3 mr-2" />
            Sincronización en la Nube
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFontSettingsOpen} className="text-xs">
            <Type className="h-3 w-3 mr-2" />
            Configuración de Fuentes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onConfigurationOpen} className="text-xs">
            <Settings className="h-3 w-3 mr-2" />
            Configuración Avanzada
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-semibold">
          🔒 Seguridad
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onSecurityOpen} className="text-xs">
            <Lock className="h-3 w-3 mr-2" />
            Control de Acceso
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}} className="text-xs">
            <Zap className="h-3 w-3 mr-2" />
            Auditoría de Cambios
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
