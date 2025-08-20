import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { FontTypographyControls } from "./FontTypographyControls";
import { AlignmentControls } from "./AlignmentControls";
import { ColorStylingControls } from "./ColorStylingControls";
import { BorderControls } from "./BorderControls";
import { VisualOptionsControls } from "./VisualOptionsControls";

import {
  TableCustomization,
  TableCustomizationPreset,
  BUILT_IN_PRESETS,
  DEFAULT_TABLE_CUSTOMIZATION,
  generateTableStyles,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";

import {
  Settings,
  Save,
  Download,
  Upload,
  Palette,
  Type,
  Layers,
  Square,
  Eye,
  RotateCcw,
  Copy,
  Trash2,
  Star,
  StarOff,
  X,
  Plus,
  Edit,
  Sparkles,
} from "lucide-react";

interface TableCustomizationPanelProps {
  customization: TableCustomization;
  columns: ExcelColumn[];
  selectedColumns: string[];
  onCustomizationChange: (customization: TableCustomization) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TableCustomizationPanel: React.FC<
  TableCustomizationPanelProps
> = ({
  customization,
  columns,
  selectedColumns,
  onCustomizationChange,
  onClose,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState("typography");
  const [savedCustomizations, setSavedCustomizations] = useState<
    TableCustomization[]
  >([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [presetSearchTerm, setPresetSearchTerm] = useState("");
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Load saved customizations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("table-customizations");
    const favs = localStorage.getItem("table-customization-favorites");

    if (saved) {
      try {
        setSavedCustomizations(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading saved customizations:", e);
      }
    }

    if (favs) {
      try {
        setFavorites(JSON.parse(favs));
      } catch (e) {
        console.error("Error loading favorites:", e);
      }
    }
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setIsUnsaved(true);
  }, [customization]);

  const saveCustomization = () => {
    const name = prompt("Nombre para esta configuración:");
    if (!name) return;

    const newCustomization: TableCustomization = {
      ...customization,
      id: Date.now().toString(),
      name,
      description: `Configuración personalizada creada el ${new Date().toLocaleDateString()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSaved = [...savedCustomizations, newCustomization];
    setSavedCustomizations(updatedSaved);
    localStorage.setItem("table-customizations", JSON.stringify(updatedSaved));

    setIsUnsaved(false);
    toast.success(`Configuración "${name}" guardada correctamente`);
  };

  const loadCustomization = (config: TableCustomization) => {
    onCustomizationChange({
      ...config,
      updatedAt: new Date(),
    });
    setIsUnsaved(false);
    toast.success(`Configuración "${config.name}" cargada`);
  };

  const deleteCustomization = (id: string) => {
    const updatedSaved = savedCustomizations.filter((c) => c.id !== id);
    setSavedCustomizations(updatedSaved);
    localStorage.setItem("table-customizations", JSON.stringify(updatedSaved));

    const updatedFavs = favorites.filter((f) => f !== id);
    setFavorites(updatedFavs);
    localStorage.setItem(
      "table-customization-favorites",
      JSON.stringify(updatedFavs),
    );

    toast.success("Configuración eliminada");
  };

  const toggleFavorite = (id: string) => {
    const updatedFavs = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updatedFavs);
    localStorage.setItem(
      "table-customization-favorites",
      JSON.stringify(updatedFavs),
    );
  };

  const exportCustomization = () => {
    const dataStr = JSON.stringify(customization, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-customization-${customization.name.replace(/\s+/g, "-")}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Configuración exportada");
  };

  const importCustomization = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        onCustomizationChange({
          ...imported,
          id: Date.now().toString(),
          updatedAt: new Date(),
        });
        toast.success("Configuración importada correctamente");
      } catch (error) {
        toast.error("Error al importar la configuración");
      }
    };
    reader.readAsText(file);
  };

  const resetToDefault = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres restablecer todas las configuraciones a los valores predeterminados?",
      )
    ) {
      onCustomizationChange(DEFAULT_TABLE_CUSTOMIZATION);
      setIsUnsaved(false);
      toast.success("Configuración restablecida");
    }
  };

  const applyPreset = (preset: TableCustomizationPreset) => {
    onCustomizationChange({
      ...customization,
      ...preset.customization,
      id: customization.id,
      name: `${customization.name} (${preset.name})`,
      updatedAt: new Date(),
    });
    toast.success(`Preset "${preset.name}" aplicado`);
  };

  const filteredPresets = BUILT_IN_PRESETS.filter(
    (preset) =>
      preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
      preset.description
        .toLowerCase()
        .includes(presetSearchTerm.toLowerCase()) ||
      preset.tags.some((tag) =>
        tag.toLowerCase().includes(presetSearchTerm.toLowerCase()),
      ),
  );

  const favoriteCustomizations = savedCustomizations.filter((c) =>
    favorites.includes(c.id),
  );
  const recentCustomizations = savedCustomizations
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personalización de Tabla
              </DialogTitle>
              <DialogDescription>
                Personaliza la apariencia y comportamiento de tu tabla
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isUnsaved && (
                <Badge variant="outline" className="text-orange-600">
                  Cambios sin guardar
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={saveCustomization}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={exportCustomization}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importCustomization}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r flex flex-col">
            {/* Quick Actions */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(customization, null, 2),
                    );
                    toast.success("Configuración copiada");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>

            {/* Presets */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Presets</h3>
                <Badge variant="secondary">{filteredPresets.length}</Badge>
              </div>

              <Input
                placeholder="Buscar presets..."
                value={presetSearchTerm}
                onChange={(e) => setPresetSearchTerm(e.target.value)}
                className="mb-3"
              />

              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {preset.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {preset.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {preset.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {preset.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Saved Configurations */}
            <div className="flex-1 p-4">
              <h3 className="font-medium mb-3">Configuraciones Guardadas</h3>

              {favoriteCustomizations.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Favoritos
                  </h4>
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {favoriteCustomizations.map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => loadCustomization(config)}
                          >
                            <div className="text-sm font-medium">
                              {config.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(config.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(config.id)}
                            >
                              <StarOff className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCustomization(config.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {recentCustomizations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Recientes</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {recentCustomizations.map((config) => (
                        <div
                          key={config.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => loadCustomization(config)}
                          >
                            <div className="text-sm font-medium">
                              {config.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(config.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(config.id)}
                            >
                              {favorites.includes(config.id) ? (
                                <Star className="h-3 w-3 fill-current" />
                              ) : (
                                <StarOff className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCustomization(config.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {savedCustomizations.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay configuraciones guardadas</p>
                  <p className="text-xs">Guarda tu primera configuración</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
                <TabsTrigger
                  value="typography"
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Tipografía</span>
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Colores</span>
                </TabsTrigger>
                <TabsTrigger
                  value="borders"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">Bordes</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Diseño</span>
                </TabsTrigger>
                <TabsTrigger
                  value="effects"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Efectos</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 p-4">
                <ScrollArea className="h-full">
                  <TabsContent value="typography" className="mt-0">
                    <div className="space-y-6">
                      <FontTypographyControls
                        cellFont={customization.cellFont}
                        headerFont={customization.headerFont}
                        cellAlignment={customization.defaultAlignment}
                        headerAlignment={customization.headerAlignment}
                        onCellFontChange={(font) =>
                          onCustomizationChange({
                            ...customization,
                            cellFont: font,
                          })
                        }
                        onHeaderFontChange={(font) =>
                          onCustomizationChange({
                            ...customization,
                            headerFont: font,
                          })
                        }
                        onCellAlignmentChange={(alignment) =>
                          onCustomizationChange({
                            ...customization,
                            defaultAlignment: alignment,
                          })
                        }
                        onHeaderAlignmentChange={(alignment) =>
                          onCustomizationChange({
                            ...customization,
                            headerAlignment: alignment,
                          })
                        }
                      />

                      <Separator />

                      <AlignmentControls
                        columns={columns}
                        selectedColumns={selectedColumns}
                        globalAlignment={customization.defaultAlignment}
                        headerAlignment={customization.headerAlignment}
                        columnAlignments={Object.fromEntries(
                          Object.entries(
                            customization.columnCustomizations,
                          ).map(([key, config]) => [
                            key,
                            config.alignment || customization.defaultAlignment,
                          ]),
                        )}
                        onGlobalAlignmentChange={(alignment) =>
                          onCustomizationChange({
                            ...customization,
                            defaultAlignment: alignment,
                          })
                        }
                        onHeaderAlignmentChange={(alignment) =>
                          onCustomizationChange({
                            ...customization,
                            headerAlignment: alignment,
                          })
                        }
                        onColumnAlignmentChange={(columnKey, alignment) =>
                          onCustomizationChange({
                            ...customization,
                            columnCustomizations: {
                              ...customization.columnCustomizations,
                              [columnKey]: {
                                ...customization.columnCustomizations[
                                  columnKey
                                ],
                                columnKey,
                                alignment,
                              },
                            },
                          })
                        }
                        onApplyToAllColumns={(alignment) => {
                          const newColumnCustomizations = {
                            ...customization.columnCustomizations,
                          };
                          selectedColumns.forEach((columnKey) => {
                            newColumnCustomizations[columnKey] = {
                              ...newColumnCustomizations[columnKey],
                              columnKey,
                              alignment,
                            };
                          });
                          onCustomizationChange({
                            ...customization,
                            columnCustomizations: newColumnCustomizations,
                          });
                        }}
                        onResetAlignments={() => {
                          onCustomizationChange({
                            ...customization,
                            defaultAlignment: {
                              horizontal: "left",
                              vertical: "middle",
                            },
                            headerAlignment: {
                              horizontal: "left",
                              vertical: "middle",
                            },
                            columnCustomizations: {},
                          });
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="colors" className="mt-0">
                    <ColorStylingControls
                      colorScheme={customization.colorScheme}
                      headerColorScheme={customization.headerColorScheme}
                      alternateRowColors={customization.alternateRowColors}
                      showHoverEffects={customization.showHoverEffects}
                      showShadows={customization.showShadows}
                      showStriping={customization.showStriping}
                      stripingInterval={customization.stripingInterval}
                      theme={customization.theme}
                      onColorSchemeChange={(colorScheme) =>
                        onCustomizationChange({ ...customization, colorScheme })
                      }
                      onHeaderColorSchemeChange={(headerColorScheme) =>
                        onCustomizationChange({
                          ...customization,
                          headerColorScheme,
                        })
                      }
                      onAlternateRowColorsChange={(alternateRowColors) =>
                        onCustomizationChange({
                          ...customization,
                          alternateRowColors,
                        })
                      }
                      onShowHoverEffectsChange={(showHoverEffects) =>
                        onCustomizationChange({
                          ...customization,
                          showHoverEffects,
                        })
                      }
                      onShowShadowsChange={(showShadows) =>
                        onCustomizationChange({ ...customization, showShadows })
                      }
                      onShowStripingChange={(showStriping) =>
                        onCustomizationChange({
                          ...customization,
                          showStriping,
                        })
                      }
                      onStripingIntervalChange={(stripingInterval) =>
                        onCustomizationChange({
                          ...customization,
                          stripingInterval,
                        })
                      }
                      onThemeChange={(theme) =>
                        onCustomizationChange({ ...customization, theme })
                      }
                    />
                  </TabsContent>

                  <TabsContent value="borders" className="mt-0">
                    <BorderControls
                      borderSettings={customization.borderSettings}
                      spacingSettings={customization.spacing}
                      onBorderSettingsChange={(borderSettings) =>
                        onCustomizationChange({
                          ...customization,
                          borderSettings,
                        })
                      }
                      onSpacingSettingsChange={(spacing) =>
                        onCustomizationChange({ ...customization, spacing })
                      }
                    />
                  </TabsContent>

                  <TabsContent value="layout" className="mt-0">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Configuración de Diseño</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Ajusta el diseño y comportamiento de la tabla
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Encabezado fijo</Label>
                              <input
                                type="checkbox"
                                checked={customization.stickyHeader}
                                onChange={(e) =>
                                  onCustomizationChange({
                                    ...customization,
                                    stickyHeader: e.target.checked,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">Responsive</Label>
                              <input
                                type="checkbox"
                                checked={customization.responsive}
                                onChange={(e) =>
                                  onCustomizationChange({
                                    ...customization,
                                    responsive: e.target.checked,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="effects" className="mt-0">
                    <VisualOptionsControls
                      theme={customization.theme}
                      stickyHeader={customization.stickyHeader}
                      virtualization={customization.virtualization}
                      virtualizationThreshold={
                        customization.virtualizationThreshold
                      }
                      showHoverEffects={customization.showHoverEffects}
                      showShadows={customization.showShadows}
                      showStriping={customization.showStriping}
                      stripingInterval={customization.stripingInterval}
                      responsive={customization.responsive}
                      breakpoints={customization.breakpoints}
                      onThemeChange={(theme) =>
                        onCustomizationChange({ ...customization, theme })
                      }
                      onStickyHeaderChange={(stickyHeader) =>
                        onCustomizationChange({
                          ...customization,
                          stickyHeader,
                        })
                      }
                      onVirtualizationChange={(virtualization) =>
                        onCustomizationChange({
                          ...customization,
                          virtualization,
                        })
                      }
                      onVirtualizationThresholdChange={(
                        virtualizationThreshold,
                      ) =>
                        onCustomizationChange({
                          ...customization,
                          virtualizationThreshold,
                        })
                      }
                      onShowHoverEffectsChange={(showHoverEffects) =>
                        onCustomizationChange({
                          ...customization,
                          showHoverEffects,
                        })
                      }
                      onShowShadowsChange={(showShadows) =>
                        onCustomizationChange({ ...customization, showShadows })
                      }
                      onShowStripingChange={(showStriping) =>
                        onCustomizationChange({
                          ...customization,
                          showStriping,
                        })
                      }
                      onStripingIntervalChange={(stripingInterval) =>
                        onCustomizationChange({
                          ...customization,
                          stripingInterval,
                        })
                      }
                      onResponsiveChange={(responsive) =>
                        onCustomizationChange({ ...customization, responsive })
                      }
                      onBreakpointsChange={(breakpoints) =>
                        onCustomizationChange({ ...customization, breakpoints })
                      }
                    />
                  </TabsContent>
                </ScrollArea>
              </div>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>
                Última modificación:{" "}
                {new Date(customization.updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  toast.success("Configuración aplicada");
                }}
              >
                Aplicar Cambios
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
