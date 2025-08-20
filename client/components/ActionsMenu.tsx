import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "lucide-react";

interface ActionsMenuProps {
  onValidationOpen: () => void;
  onConfigurationOpen: () => void;
  onAggregationOpen: () => void;
  onBulkOperationsOpen: () => void;
  onExportOpen: () => void;
  onStatsOpen: () => void;
  onVisualizationOpen: () => void;
}

export function ActionsMenu({
  onValidationOpen,
  onConfigurationOpen,
  onAggregationOpen,
  onBulkOperationsOpen,
  onExportOpen,
  onStatsOpen,
  onVisualizationOpen,
}: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Menu className="h-4 w-4 mr-2" />
          Menú
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onValidationOpen}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Validación
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onConfigurationOpen}>
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAggregationOpen}>
          <Database className="h-4 w-4 mr-2" />
          Agregaciones
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBulkOperationsOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Operaciones
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExportOpen}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStatsOpen}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Estadísticas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onVisualizationOpen}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Gráficos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
