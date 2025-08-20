import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Simple drag and drop without external libraries
import {
  MoveHorizontal,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  RotateCw,
  Save,
  Download,
  Upload,
  Settings,
  Zap,
  Grid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pin,
  ArrowUpDown,
  Filter,
  Search,
  Calculator,
  Palette,
  Type,
  BorderAll,
  Mouse,
  Layers,
  Target,
  BookOpen,
  Accessibility,
} from "lucide-react";
import { ExcelColumn } from "@shared/excel-types";
import { toast } from "sonner";

interface EnhancedTableFeaturesProps {
  columns: ExcelColumn[];
  selectedColumns: string[];
  onColumnsChange?: (columns: string[]) => void;
  onColumnResize?: (columnKey: string, width: number) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
}

interface ColumnConfig {
  key: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  visible: boolean;
  pinned: 'left' | 'right' | 'none';
  resizable: boolean;
  sortable: boolean;
  filterable: boolean;
  order: number;
  alignment: 'left' | 'center' | 'right';
  headerHeight: number;
  cellHeight: number;
  frozen: boolean;
  highlight: boolean;
  customFormat?: string;
  groupable: boolean;
}

interface TableSettings {
  compactMode: boolean;
  zebraStripes: boolean;
  hoverEffects: boolean;
  stickyHeaders: boolean;
  virtualScroll: boolean;
  autoResize: boolean;
  showGridLines: boolean;
  roundedCorners: boolean;
  shadowEffects: boolean;
  animatedTransitions: boolean;
  highContrast: boolean;
  fontSize: number;
  lineHeight: number;
  cellPadding: number;
  borderWidth: number;
  maxColumnWidth: number;
  minColumnWidth: number;
}

const DEFAULT_TABLE_SETTINGS: TableSettings = {
  compactMode: false,
  zebraStripes: true,
  hoverEffects: true,
  stickyHeaders: true,
  virtualScroll: false,
  autoResize: true,
  showGridLines: true,
  roundedCorners: false,
  shadowEffects: false,
  animatedTransitions: true,
  highContrast: false,
  fontSize: 14,
  lineHeight: 1.5,
  cellPadding: 12,
  borderWidth: 1,
  maxColumnWidth: 400,
  minColumnWidth: 80,
};

export const EnhancedTableFeatures: React.FC<EnhancedTableFeaturesProps> = ({
  columns,
  selectedColumns,
  onColumnsChange,
  onColumnResize,
  onColumnReorder,
}) => {
  const [columnConfigs, setColumnConfigs] = useState<Record<string, ColumnConfig>>({});
  const [tableSettings, setTableSettings] = useState<TableSettings>(DEFAULT_TABLE_SETTINGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Initialize column configurations
  useEffect(() => {
    const configs: Record<string, ColumnConfig> = {};
    columns.forEach((col, index) => {
      configs[col.key] = {
        key: col.key,
        width: 150,
        minWidth: 80,
        maxWidth: 400,
        visible: selectedColumns.includes(col.key),
        pinned: 'none',
        resizable: true,
        sortable: true,
        filterable: true,
        order: index,
        alignment: col.type === 'number' ? 'right' : 'left',
        headerHeight: 40,
        cellHeight: 36,
        frozen: false,
        highlight: false,
        groupable: col.type === 'text',
      };
    });
    setColumnConfigs(configs);
  }, [columns, selectedColumns]);

  // Auto-size columns based on content type
  const autoSizeColumns = () => {
    const updatedConfigs = { ...columnConfigs };
    Object.values(updatedConfigs).forEach(config => {
      const column = columns.find(c => c.key === config.key);
      if (column) {
        let optimalWidth = 120;
        switch (column.type) {
          case 'number':
            optimalWidth = 100;
            break;
          case 'boolean':
            optimalWidth = 80;
            break;
          case 'date':
            optimalWidth = 120;
            break;
          case 'text':
            optimalWidth = Math.min(300, Math.max(120, column.label.length * 8 + 40));
            break;
        }
        config.width = optimalWidth;
        onColumnResize?.(config.key, optimalWidth);
      }
    });
    setColumnConfigs(updatedConfigs);
    toast.success('Columnas ajustadas automáticamente');
  };

  // Smart column arrangement
  const smartArrangement = () => {
    const updatedConfigs = { ...columnConfigs };
    const sortedConfigs = Object.values(updatedConfigs).sort((a, b) => {
      // Pin important columns first
      if (a.pinned === 'left' && b.pinned !== 'left') return -1;
      if (b.pinned === 'left' && a.pinned !== 'left') return 1;
      
      // Sort by data type priority: text, number, date, boolean
      const typePriority = { text: 0, number: 1, date: 2, boolean: 3 };
      const aType = columns.find(c => c.key === a.key)?.type as keyof typeof typePriority;
      const bType = columns.find(c => c.key === b.key)?.type as keyof typeof typePriority;
      
      return typePriority[aType] - typePriority[bType];
    });

    sortedConfigs.forEach((config, index) => {
      config.order = index;
    });

    setColumnConfigs(updatedConfigs);
    toast.success('Columnas organizadas inteligentemente');
  };

  // Fit columns to viewport
  const fitToViewport = () => {
    const viewportWidth = window.innerWidth - 400; // Account for sidebar
    const visibleColumns = Object.values(columnConfigs).filter(c => c.visible);
    const columnWidth = Math.max(100, Math.floor(viewportWidth / visibleColumns.length));
    
    const updatedConfigs = { ...columnConfigs };
    visibleColumns.forEach(config => {
      config.width = Math.min(columnWidth, config.maxWidth);
      onColumnResize?.(config.key, config.width);
    });
    
    setColumnConfigs(updatedConfigs);
    toast.success('Columnas ajustadas al viewport');
  };

  // Bulk operations
  const bulkToggleVisibility = (visible: boolean) => {
    const updatedConfigs = { ...columnConfigs };
    Object.values(updatedConfigs).forEach(config => {
      config.visible = visible;
    });
    setColumnConfigs(updatedConfigs);
    
    const newSelectedColumns = visible ? columns.map(c => c.key) : [];
    onColumnsChange?.(newSelectedColumns);
  };

  const bulkResize = (width: number) => {
    const updatedConfigs = { ...columnConfigs };
    Object.values(updatedConfigs).forEach(config => {
      if (config.visible) {
        config.width = Math.min(Math.max(width, config.minWidth), config.maxWidth);
        onColumnResize?.(config.key, config.width);
      }
    });
    setColumnConfigs(updatedConfigs);
  };

  // Export/Import configuration
  const exportConfig = () => {
    const config = {
      columnConfigs,
      tableSettings,
      timestamp: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuración exportada');
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.columnConfigs) setColumnConfigs(config.columnConfigs);
        if (config.tableSettings) setTableSettings(config.tableSettings);
        toast.success('Configuración importada');
      } catch (error) {
        toast.error('Error al importar configuración');
      }
    };
    reader.readAsText(file);
  };

  // Apply presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'compact':
        setTableSettings({
          ...tableSettings,
          compactMode: true,
          fontSize: 12,
          cellPadding: 8,
          lineHeight: 1.3,
        });
        bulkResize(100);
        break;
      case 'comfortable':
        setTableSettings({
          ...tableSettings,
          compactMode: false,
          fontSize: 16,
          cellPadding: 16,
          lineHeight: 1.6,
        });
        bulkResize(180);
        break;
      case 'presentation':
        setTableSettings({
          ...tableSettings,
          shadowEffects: true,
          roundedCorners: true,
          fontSize: 15,
          cellPadding: 14,
        });
        break;
      case 'accessibility':
        setTableSettings({
          ...tableSettings,
          highContrast: true,
          fontSize: 16,
          lineHeight: 1.8,
          zebraStripes: true,
        });
        break;
    }
    toast.success(`Preset "${presetName}" aplicado`);
  };

  const updateColumnConfig = (columnKey: string, updates: Partial<ColumnConfig>) => {
    setColumnConfigs(prev => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], ...updates }
    }));
  };

  const updateTableSettings = (updates: Partial<TableSettings>) => {
    setTableSettings(prev => ({ ...prev, ...updates }));
  };

  const filteredColumns = columns.filter(col => {
    const matchesSearch = col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         col.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           selectedCategory === col.type ||
                           (selectedCategory === 'visible' && columnConfigs[col.key]?.visible) ||
                           (selectedCategory === 'pinned' && columnConfigs[col.key]?.pinned !== 'none');
    return matchesSearch && matchesCategory;
  });

  const moveColumn = (columnKey: string, direction: 'up' | 'down') => {
    const currentOrder = columnConfigs[columnKey].order;
    const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find column to swap with
    const targetColumn = Object.values(columnConfigs).find(c => c.order === targetOrder);
    if (!targetColumn) return;

    // Swap orders
    const updatedConfigs = { ...columnConfigs };
    updatedConfigs[columnKey].order = targetOrder;
    updatedConfigs[targetColumn.key].order = currentOrder;

    setColumnConfigs(updatedConfigs);
    onColumnReorder?.(currentOrder, targetOrder);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportConfig}>
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importConfig}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={autoSizeColumns}
            >
              <Zap className="h-5 w-5 text-blue-500" />
              <div className="text-center">
                <div className="text-xs font-medium">Auto Ajustar</div>
                <div className="text-xs text-muted-foreground">Tamaño óptimo</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={smartArrangement}
            >
              <Target className="h-5 w-5 text-green-500" />
              <div className="text-center">
                <div className="text-xs font-medium">Organizar</div>
                <div className="text-xs text-muted-foreground">Inteligente</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={fitToViewport}
            >
              <Maximize2 className="h-5 w-5 text-purple-500" />
              <div className="text-center">
                <div className="text-xs font-medium">Ajustar</div>
                <div className="text-xs text-muted-foreground">A pantalla</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => applyPreset('compact')}
            >
              <Minimize2 className="h-5 w-5 text-orange-500" />
              <div className="text-center">
                <div className="text-xs font-medium">Compacto</div>
                <div className="text-xs text-muted-foreground">Máximo espacio</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Presets de Estilo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'compact', name: 'Compacto', icon: Minimize2, color: 'text-blue-500' },
              { id: 'comfortable', name: 'Cómodo', icon: Maximize2, color: 'text-green-500' },
              { id: 'presentation', name: 'Presentación', icon: Layers, color: 'text-purple-500' },
              { id: 'accessibility', name: 'Accesibilidad', icon: Accessibility, color: 'text-orange-500' },
            ].map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => applyPreset(preset.id)}
                >
                  <Icon className={`h-5 w-5 ${preset.color}`} />
                  <div className="text-xs font-medium">{preset.name}</div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Table Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Configuración de Tabla</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Modo compacto</Label>
                <Switch
                  checked={tableSettings.compactMode}
                  onCheckedChange={(checked) => updateTableSettings({ compactMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Rayas zebra</Label>
                <Switch
                  checked={tableSettings.zebraStripes}
                  onCheckedChange={(checked) => updateTableSettings({ zebraStripes: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Efectos hover</Label>
                <Switch
                  checked={tableSettings.hoverEffects}
                  onCheckedChange={(checked) => updateTableSettings({ hoverEffects: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Encabezados fijos</Label>
                <Switch
                  checked={tableSettings.stickyHeaders}
                  onCheckedChange={(checked) => updateTableSettings({ stickyHeaders: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Scroll virtual</Label>
                <Switch
                  checked={tableSettings.virtualScroll}
                  onCheckedChange={(checked) => updateTableSettings({ virtualScroll: checked })}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto redimensionar</Label>
                <Switch
                  checked={tableSettings.autoResize}
                  onCheckedChange={(checked) => updateTableSettings({ autoResize: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Líneas de grid</Label>
                <Switch
                  checked={tableSettings.showGridLines}
                  onCheckedChange={(checked) => updateTableSettings({ showGridLines: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Esquinas redondeadas</Label>
                <Switch
                  checked={tableSettings.roundedCorners}
                  onCheckedChange={(checked) => updateTableSettings({ roundedCorners: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Efectos de sombra</Label>
                <Switch
                  checked={tableSettings.shadowEffects}
                  onCheckedChange={(checked) => updateTableSettings({ shadowEffects: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alto contraste</Label>
                <Switch
                  checked={tableSettings.highContrast}
                  onCheckedChange={(checked) => updateTableSettings({ highContrast: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Size Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Tamaño de fuente</Label>
                  <Badge variant="outline" className="text-xs">
                    {tableSettings.fontSize}px
                  </Badge>
                </div>
                <Slider
                  value={[tableSettings.fontSize]}
                  onValueChange={([value]) => updateTableSettings({ fontSize: value })}
                  min={10}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Padding de celda</Label>
                  <Badge variant="outline" className="text-xs">
                    {tableSettings.cellPadding}px
                  </Badge>
                </div>
                <Slider
                  value={[tableSettings.cellPadding]}
                  onValueChange={([value]) => updateTableSettings({ cellPadding: value })}
                  min={4}
                  max={24}
                  step={2}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Gestión de Columnas</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkToggleVisibility(true)}
              >
                Mostrar Todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkToggleVisibility(false)}
              >
                Ocultar Todas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar columnas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="visible">Visibles</SelectItem>
                <SelectItem value="pinned">Fijadas</SelectItem>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="boolean">Booleano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column List */}
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {filteredColumns
                .sort((a, b) => (columnConfigs[a.key]?.order || 0) - (columnConfigs[b.key]?.order || 0))
                .map((column, index) => {
                  const config = columnConfigs[column.key];
                  if (!config) return null;

                  return (
                    <div
                      key={column.key}
                      className="border rounded-lg p-3 space-y-3 bg-background hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveColumn(column.key, 'up')}
                              disabled={config.order === 0}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveColumn(column.key, 'down')}
                              disabled={config.order === filteredColumns.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{column.label}</div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {column.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                #{config.order + 1}
                              </Badge>
                              {config.pinned !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  {config.pinned === 'left' ? 'Izq' : 'Der'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateColumnConfig(column.key, { visible: !config.visible })}
                          >
                            {config.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateColumnConfig(column.key, {
                              pinned: config.pinned === 'left' ? 'none' : 'left'
                            })}
                          >
                            {config.pinned === 'left' ? <Pin className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Ancho: {config.width}px</Label>
                          <Slider
                            value={[config.width]}
                            onValueChange={([value]) => {
                              updateColumnConfig(column.key, { width: value });
                              onColumnResize?.(column.key, value);
                            }}
                            min={config.minWidth}
                            max={config.maxWidth}
                            step={10}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Alineación</Label>
                          <div className="flex gap-1">
                            {[
                              { value: 'left', icon: AlignLeft },
                              { value: 'center', icon: AlignCenter },
                              { value: 'right', icon: AlignRight },
                            ].map(({ value, icon: Icon }) => (
                              <Button
                                key={value}
                                variant={config.alignment === value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateColumnConfig(column.key, { alignment: value as any })}
                                className="flex-1 p-1"
                              >
                                <Icon className="h-3 w-3" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Operaciones en Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Redimensionar todas las columnas visibles</Label>
              <div className="flex items-center gap-2">
                <Slider
                  defaultValue={[150]}
                  onValueChange={([value]) => bulkResize(value)}
                  min={80}
                  max={400}
                  step={10}
                  className="flex-1"
                />
                <Badge variant="outline" className="text-xs min-w-16">
                  150px
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkResize(100)}
              >
                Compacto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkResize(150)}
              >
                Normal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkResize(200)}
              >
                Amplio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
