import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { FontTypographyControls } from "./FontTypographyControls";
import { AlignmentControls } from "./AlignmentControls";
import { ColorStylingControls } from "./ColorStylingControls";
import { BorderControls } from "./BorderControls";
import { VisualOptionsControls } from "./VisualOptionsControls";

import {
  TableCustomization,
  BUILT_IN_PRESETS,
  DEFAULT_TABLE_CUSTOMIZATION,
  generateTableStyles,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";
import { useFontScale, FONT_SCALE_OPTIONS } from "@/hooks/use-font-scale";

import {
  Palette,
  Type,
  Columns,
  Settings,
  Eye,
  Save,
  Download,
  Upload,
  RotateCcw,
  Maximize2,
  Minimize2,
  Grid,
  Move,
  Lock,
  Unlock,
  Star,
  Sparkles,
  Zap,
  Layout,
  ResizeHorizontal,
  MoreHorizontal,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";

interface TableStylesControlProps {
  columns: ExcelColumn[];
  selectedColumns: string[];
  onCustomizationChange?: (customization: TableCustomization) => void;
  onColumnResize?: (columnKey: string, width: number) => void;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  onColumnToggle?: (columnKey: string, visible: boolean) => void;
  className?: string;
}

interface ColumnLayout {
  key: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  visible: boolean;
  pinned: 'left' | 'right' | 'none';
  resizable: boolean;
  order: number;
}

export const TableStylesControl: React.FC<TableStylesControlProps> = ({
  columns,
  selectedColumns,
  onCustomizationChange,
  onColumnResize,
  onColumnReorder,
  onColumnToggle,
  className,
}) => {
  const { fontScale, setFontScale } = useFontScale();
  const [tableCustomization, setTableCustomization] = useState<TableCustomization>(DEFAULT_TABLE_CUSTOMIZATION);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");
  const [columnLayouts, setColumnLayouts] = useState<Record<string, ColumnLayout>>({});

  // Quick style presets for the main popover
  const QUICK_PRESETS = [
    { id: 'compact', name: 'Compacto', icon: Minimize2, description: 'Máximo espacio' },
    { id: 'comfortable', name: 'Cómodo', icon: Maximize2, description: 'Fácil lectura' },
    { id: 'minimal', name: 'Minimal', icon: Layout, description: 'Limpio y simple' },
    { id: 'professional', name: 'Profesional', icon: Star, description: 'Corporativo' },
  ];

  // Initialize column layouts
  useEffect(() => {
    const layouts: Record<string, ColumnLayout> = {};
    columns.forEach((col, index) => {
      layouts[col.key] = {
        key: col.key,
        width: 150,
        minWidth: 100,
        maxWidth: 400,
        visible: selectedColumns.includes(col.key),
        pinned: 'none',
        resizable: true,
        order: index,
      };
    });
    setColumnLayouts(layouts);
  }, [columns, selectedColumns]);

  // Load saved customization
  useEffect(() => {
    const saved = localStorage.getItem('table-styles-customization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTableCustomization({ ...DEFAULT_TABLE_CUSTOMIZATION, ...parsed });
      } catch (e) {
        console.error('Error loading customization:', e);
      }
    }
  }, []);

  // Save customization
  useEffect(() => {
    localStorage.setItem('table-styles-customization', JSON.stringify(tableCustomization));
    onCustomizationChange?.(tableCustomization);
  }, [tableCustomization, onCustomizationChange]);

  const applyQuickPreset = (presetId: string) => {
    let newCustomization = { ...tableCustomization };
    
    switch (presetId) {
      case 'compact':
        newCustomization = {
          ...newCustomization,
          cellFont: { ...newCustomization.cellFont, size: 12 },
          headerFont: { ...newCustomization.headerFont, size: 13 },
          spacing: {
            ...newCustomization.spacing,
            padding: { top: 6, right: 8, bottom: 6, left: 8 }
          },
          showStriping: true,
          stripingInterval: 1,
        };
        setFontScale('font-scale-sm');
        break;
      case 'comfortable':
        newCustomization = {
          ...newCustomization,
          cellFont: { ...newCustomization.cellFont, size: 16 },
          headerFont: { ...newCustomization.headerFont, size: 17 },
          spacing: {
            ...newCustomization.spacing,
            padding: { top: 16, right: 20, bottom: 16, left: 20 }
          },
          showStriping: false,
        };
        setFontScale('font-scale-lg');
        break;
      case 'minimal':
        newCustomization = BUILT_IN_PRESETS.find(p => p.id === 'minimal-clean')?.customization || newCustomization;
        setFontScale('font-scale-base');
        break;
      case 'professional':
        newCustomization = BUILT_IN_PRESETS.find(p => p.id === 'business-professional')?.customization || newCustomization;
        setFontScale('font-scale-base');
        break;
    }
    
    setTableCustomization(newCustomization);
    toast.success(`Preset "${QUICK_PRESETS.find(p => p.id === presetId)?.name}" aplicado`);
  };

  const updateColumnLayout = (columnKey: string, updates: Partial<ColumnLayout>) => {
    setColumnLayouts(prev => ({
      ...prev,
      [columnKey]: { ...prev[columnKey], ...updates }
    }));
    
    if (updates.width) {
      onColumnResize?.(columnKey, updates.width);
    }
    if (updates.visible !== undefined) {
      onColumnToggle?.(columnKey, updates.visible);
    }
  };

  const autoSizeAllColumns = () => {
    const updatedLayouts = { ...columnLayouts };
    Object.keys(updatedLayouts).forEach(key => {
      const column = columns.find(c => c.key === key);
      if (column) {
        // Auto-size based on column type and content
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
            optimalWidth = Math.min(200, Math.max(120, column.label.length * 8));
            break;
        }
        updatedLayouts[key] = { ...updatedLayouts[key], width: optimalWidth };
      }
    });
    setColumnLayouts(updatedLayouts);
    toast.success('Columnas ajustadas automáticamente');
  };

  const exportConfiguration = () => {
    const config = {
      customization: tableCustomization,
      columnLayouts,
      fontScale,
    };
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-styles-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Configuración exportada');
  };

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        if (config.customization) {
          setTableCustomization(config.customization);
        }
        if (config.columnLayouts) {
          setColumnLayouts(config.columnLayouts);
        }
        if (config.fontScale) {
          setFontScale(config.fontScale);
        }
        toast.success('Configuración importada');
      } catch (error) {
        toast.error('Error al importar la configuración');
      }
    };
    reader.readAsText(file);
  };

  const resetAll = () => {
    setTableCustomization(DEFAULT_TABLE_CUSTOMIZATION);
    setFontScale('font-scale-base');
    autoSizeAllColumns();
    toast.success('Todo restablecido');
  };

  const currentFontOption = FONT_SCALE_OPTIONS.find(option => option.value === fontScale);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Estilos Tabla</span>
            <Badge variant="secondary" className="text-xs">
              {currentFontOption?.percentage}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Estilos de Tabla</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setIsAdvancedOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportConfiguration}>
                  <Download className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfiguration}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="quick" className="text-xs">Rápido</TabsTrigger>
                <TabsTrigger value="columns" className="text-xs">Columnas</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">Diseño</TabsTrigger>
                <TabsTrigger value="size" className="text-xs">Tamaño</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Presets Rápidos</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {QUICK_PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <Button
                          key={preset.id}
                          variant="outline"
                          className="h-auto p-3 flex flex-col items-center gap-2"
                          onClick={() => applyQuickPreset(preset.id)}
                        >
                          <Icon className="h-5 w-5" />
                          <div className="text-center">
                            <div className="text-xs font-medium">{preset.name}</div>
                            <div className="text-xs text-muted-foreground">{preset.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rayas alternadas</Label>
                    <Switch
                      checked={tableCustomization.showStriping}
                      onCheckedChange={(checked) =>
                        setTableCustomization(prev => ({ ...prev, showStriping: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Efectos hover</Label>
                    <Switch
                      checked={tableCustomization.showHoverEffects}
                      onCheckedChange={(checked) =>
                        setTableCustomization(prev => ({ ...prev, showHoverEffects: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Sombras</Label>
                    <Switch
                      checked={tableCustomization.showShadows}
                      onCheckedChange={(checked) =>
                        setTableCustomization(prev => ({ ...prev, showShadows: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Encabezado fijo</Label>
                    <Switch
                      checked={tableCustomization.stickyHeader}
                      onCheckedChange={(checked) =>
                        setTableCustomization(prev => ({ ...prev, stickyHeader: checked }))
                      }
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={resetAll} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer Todo
                </Button>
              </TabsContent>

              <TabsContent value="columns" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Ajustar Columnas</Label>
                  <Button variant="outline" size="sm" onClick={autoSizeAllColumns}>
                    <Zap className="h-4 w-4 mr-1" />
                    Auto
                  </Button>
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-2">
                    {columns.filter(col => selectedColumns.includes(col.key)).map((column) => {
                      const layout = columnLayouts[column.key];
                      if (!layout) return null;

                      return (
                        <div key={column.key} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{column.label}</span>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {column.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {layout.pinned !== 'none' && (
                                <Badge variant="secondary" className="text-xs">
                                  {layout.pinned === 'left' ? '📌L' : '📌R'}
                                </Badge>
                              )}
                              <Switch
                                checked={layout.visible}
                                onCheckedChange={(checked) =>
                                  updateColumnLayout(column.key, { visible: checked })
                                }
                                size="sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs">Ancho:</Label>
                              <Badge variant="outline" className="text-xs">
                                {layout.width}px
                              </Badge>
                            </div>
                            <Slider
                              value={[layout.width]}
                              onValueChange={([value]) =>
                                updateColumnLayout(column.key, { width: value })
                              }
                              min={layout.minWidth}
                              max={layout.maxWidth}
                              step={10}
                              className="w-full"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateColumnLayout(column.key, {
                                  pinned: layout.pinned === 'left' ? 'none' : 'left'
                                })
                              }
                              className="flex-1 text-xs"
                            >
                              {layout.pinned === 'left' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              Izq
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateColumnLayout(column.key, {
                                  pinned: layout.pinned === 'right' ? 'none' : 'right'
                                })
                              }
                              className="flex-1 text-xs"
                            >
                              {layout.pinned === 'right' ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                              Der
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="size" className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Escala Global</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ajusta el tamaño de toda la interfaz
                  </p>
                </div>

                <div className="space-y-3">
                  <Select value={fontScale} onValueChange={setFontScale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_SCALE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {option.percentage}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="border rounded-lg p-3 bg-muted/30">
                    <div className="text-xs text-muted-foreground mb-2">Vista Previa:</div>
                    <div className="space-y-1">
                      <div className="text-responsive-sm">Texto pequeño</div>
                      <div className="text-responsive-base">Texto normal</div>
                      <div className="text-responsive-lg font-medium">Título</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Espaciado de Celdas</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Padding:</Label>
                      <Badge variant="outline" className="text-xs">
                        {tableCustomization.spacing.padding.top}px
                      </Badge>
                    </div>
                    <Slider
                      value={[tableCustomization.spacing.padding.top]}
                      onValueChange={([value]) =>
                        setTableCustomization(prev => ({
                          ...prev,
                          spacing: {
                            ...prev.spacing,
                            padding: { top: value, right: value, bottom: value, left: value }
                          }
                        }))
                      }
                      min={4}
                      max={24}
                      step={2}
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </PopoverContent>
      </Popover>

      {/* Advanced Customization Dialog */}
      <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Personalización Avanzada de Tabla
            </DialogTitle>
            <DialogDescription>
              Configuración completa de apariencia y comportamiento
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 p-6">
            <Tabs defaultValue="typography" className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="typography">Tipografía</TabsTrigger>
                <TabsTrigger value="colors">Colores</TabsTrigger>
                <TabsTrigger value="borders">Bordes</TabsTrigger>
                <TabsTrigger value="layout">Diseño</TabsTrigger>
                <TabsTrigger value="effects">Efectos</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-16rem)] mt-4">
                <TabsContent value="typography">
                  <FontTypographyControls
                    cellFont={tableCustomization.cellFont}
                    headerFont={tableCustomization.headerFont}
                    cellAlignment={tableCustomization.defaultAlignment}
                    headerAlignment={tableCustomization.headerAlignment}
                    onCellFontChange={(font) =>
                      setTableCustomization(prev => ({ ...prev, cellFont: font }))
                    }
                    onHeaderFontChange={(font) =>
                      setTableCustomization(prev => ({ ...prev, headerFont: font }))
                    }
                    onCellAlignmentChange={(alignment) =>
                      setTableCustomization(prev => ({ ...prev, defaultAlignment: alignment }))
                    }
                    onHeaderAlignmentChange={(alignment) =>
                      setTableCustomization(prev => ({ ...prev, headerAlignment: alignment }))
                    }
                  />
                </TabsContent>

                <TabsContent value="colors">
                  <ColorStylingControls
                    colorScheme={tableCustomization.colorScheme}
                    headerColorScheme={tableCustomization.headerColorScheme}
                    alternateRowColors={tableCustomization.alternateRowColors}
                    showHoverEffects={tableCustomization.showHoverEffects}
                    showShadows={tableCustomization.showShadows}
                    showStriping={tableCustomization.showStriping}
                    stripingInterval={tableCustomization.stripingInterval}
                    theme={tableCustomization.theme}
                    onColorSchemeChange={(colorScheme) =>
                      setTableCustomization(prev => ({ ...prev, colorScheme }))
                    }
                    onHeaderColorSchemeChange={(headerColorScheme) =>
                      setTableCustomization(prev => ({ ...prev, headerColorScheme }))
                    }
                    onAlternateRowColorsChange={(alternateRowColors) =>
                      setTableCustomization(prev => ({ ...prev, alternateRowColors }))
                    }
                    onShowHoverEffectsChange={(showHoverEffects) =>
                      setTableCustomization(prev => ({ ...prev, showHoverEffects }))
                    }
                    onShowShadowsChange={(showShadows) =>
                      setTableCustomization(prev => ({ ...prev, showShadows }))
                    }
                    onShowStripingChange={(showStriping) =>
                      setTableCustomization(prev => ({ ...prev, showStriping }))
                    }
                    onStripingIntervalChange={(stripingInterval) =>
                      setTableCustomization(prev => ({ ...prev, stripingInterval }))
                    }
                    onThemeChange={(theme) =>
                      setTableCustomization(prev => ({ ...prev, theme }))
                    }
                  />
                </TabsContent>

                <TabsContent value="borders">
                  <BorderControls
                    borderSettings={tableCustomization.borderSettings}
                    spacingSettings={tableCustomization.spacing}
                    onBorderSettingsChange={(borderSettings) =>
                      setTableCustomization(prev => ({ ...prev, borderSettings }))
                    }
                    onSpacingSettingsChange={(spacing) =>
                      setTableCustomization(prev => ({ ...prev, spacing }))
                    }
                  />
                </TabsContent>

                <TabsContent value="layout">
                  <AlignmentControls
                    columns={columns}
                    selectedColumns={selectedColumns}
                    globalAlignment={tableCustomization.defaultAlignment}
                    headerAlignment={tableCustomization.headerAlignment}
                    columnAlignments={Object.fromEntries(
                      Object.entries(tableCustomization.columnCustomizations).map(([key, config]) => [
                        key,
                        config.alignment || tableCustomization.defaultAlignment,
                      ])
                    )}
                    onGlobalAlignmentChange={(alignment) =>
                      setTableCustomization(prev => ({ ...prev, defaultAlignment: alignment }))
                    }
                    onHeaderAlignmentChange={(alignment) =>
                      setTableCustomization(prev => ({ ...prev, headerAlignment: alignment }))
                    }
                    onColumnAlignmentChange={(columnKey, alignment) =>
                      setTableCustomization(prev => ({
                        ...prev,
                        columnCustomizations: {
                          ...prev.columnCustomizations,
                          [columnKey]: {
                            ...prev.columnCustomizations[columnKey],
                            columnKey,
                            alignment,
                          },
                        },
                      }))
                    }
                    onApplyToAllColumns={(alignment) => {
                      const newColumnCustomizations = { ...tableCustomization.columnCustomizations };
                      selectedColumns.forEach((columnKey) => {
                        newColumnCustomizations[columnKey] = {
                          ...newColumnCustomizations[columnKey],
                          columnKey,
                          alignment,
                        };
                      });
                      setTableCustomization(prev => ({
                        ...prev,
                        columnCustomizations: newColumnCustomizations,
                      }));
                    }}
                    onResetAlignments={() => {
                      setTableCustomization(prev => ({
                        ...prev,
                        defaultAlignment: { horizontal: 'left', vertical: 'middle' },
                        headerAlignment: { horizontal: 'left', vertical: 'middle' },
                        columnCustomizations: {},
                      }));
                    }}
                  />
                </TabsContent>

                <TabsContent value="effects">
                  <VisualOptionsControls
                    theme={tableCustomization.theme}
                    stickyHeader={tableCustomization.stickyHeader}
                    virtualization={tableCustomization.virtualization}
                    virtualizationThreshold={tableCustomization.virtualizationThreshold}
                    showHoverEffects={tableCustomization.showHoverEffects}
                    showShadows={tableCustomization.showShadows}
                    showStriping={tableCustomization.showStriping}
                    stripingInterval={tableCustomization.stripingInterval}
                    responsive={tableCustomization.responsive}
                    breakpoints={tableCustomization.breakpoints}
                    onThemeChange={(theme) =>
                      setTableCustomization(prev => ({ ...prev, theme }))
                    }
                    onStickyHeaderChange={(stickyHeader) =>
                      setTableCustomization(prev => ({ ...prev, stickyHeader }))
                    }
                    onVirtualizationChange={(virtualization) =>
                      setTableCustomization(prev => ({ ...prev, virtualization }))
                    }
                    onVirtualizationThresholdChange={(virtualizationThreshold) =>
                      setTableCustomization(prev => ({ ...prev, virtualizationThreshold }))
                    }
                    onShowHoverEffectsChange={(showHoverEffects) =>
                      setTableCustomization(prev => ({ ...prev, showHoverEffects }))
                    }
                    onShowShadowsChange={(showShadows) =>
                      setTableCustomization(prev => ({ ...prev, showShadows }))
                    }
                    onShowStripingChange={(showStriping) =>
                      setTableCustomization(prev => ({ ...prev, showStriping }))
                    }
                    onStripingIntervalChange={(stripingInterval) =>
                      setTableCustomization(prev => ({ ...prev, stripingInterval }))
                    }
                    onResponsiveChange={(responsive) =>
                      setTableCustomization(prev => ({ ...prev, responsive }))
                    }
                    onBreakpointsChange={(breakpoints) =>
                      setTableCustomization(prev => ({ ...prev, breakpoints }))
                    }
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
