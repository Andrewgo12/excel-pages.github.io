import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Save,
  Settings,
  Download,
  Upload,
  Trash2,
  Eye,
  Clock,
  X,
} from "lucide-react";
import {
  SavedConfiguration,
  UserPreferences,
  saveConfiguration,
  getSavedConfigurations,
  deleteConfiguration,
  getConfigurationById,
  getUserPreferences,
  saveUserPreferences,
  exportConfigurations,
  importConfigurations,
  formatConfigurationDate,
  generateConfigurationName,
  getRecentConfigurations,
  addToRecentConfigurations,
} from "@/utils/configurationManager";
import { FilterGroup } from "@shared/excel-types";

interface ConfigurationManagerProps {
  currentConfig: {
    selectedColumns: string[];
    filterGroups: FilterGroup[];
    globalSearch: string;
    searchMode: "normal" | "regex" | "pattern";
    columnFilters: Record<string, string>;
    sortColumn: string | null;
    sortDirection: "asc" | "desc";
    pagination: any;
  };
  onLoadConfiguration: (config: SavedConfiguration) => void;
  onPreferencesChange: (preferences: UserPreferences) => void;
}

export const ConfigurationManager: React.FC<ConfigurationManagerProps> = ({
  currentConfig,
  onLoadConfiguration,
  onPreferencesChange,
}) => {
  const [activeTab, setActiveTab] = useState<"save" | "load" | "preferences">(
    "save",
  );
  const [configurations, setConfigurations] = useState<SavedConfiguration[]>(
    [],
  );
  const [preferences, setPreferences] =
    useState<UserPreferences>(getUserPreferences());
  const [recentConfigs, setRecentConfigs] = useState<string[]>([]);

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");

  // Import/Export state
  const [importData, setImportData] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    loadConfigurations();
    setRecentConfigs(getRecentConfigurations());
  }, []);

  const loadConfigurations = () => {
    setConfigurations(getSavedConfigurations());
  };

  const handleSaveConfiguration = () => {
    if (!saveName.trim()) return;

    const saved = saveConfiguration({
      name: saveName.trim(),
      description: saveDescription.trim(),
      config: currentConfig,
    });

    loadConfigurations();
    setSaveDialogOpen(false);
    setSaveName("");
    setSaveDescription("");
  };

  const handleLoadConfiguration = (config: SavedConfiguration) => {
    onLoadConfiguration(config);
    addToRecentConfigurations(config.id);
    setRecentConfigs(getRecentConfigurations());
  };

  const handleDeleteConfiguration = (id: string) => {
    deleteConfiguration(id);
    loadConfigurations();
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveUserPreferences(updated);
    onPreferencesChange(updated);
  };

  const handleExportConfigurations = () => {
    const exportData = exportConfigurations();
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `excel-explorer-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfigurations = () => {
    if (!importData.trim()) return;

    const result = importConfigurations(importData);
    if (result.success) {
      loadConfigurations();
      setImportDialogOpen(false);
      setImportData("");
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const generateAutoName = () => {
    setSaveName(generateConfigurationName(currentConfig));
  };

  const renderSaveTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Guardar Configuración Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la configuración</Label>
              <div className="flex gap-2">
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Ej: Análisis de ventas Q4"
                />
                <Button variant="outline" onClick={generateAutoName}>
                  Auto
                </Button>
              </div>
            </div>

            <div>
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Describe qué hace esta configuración..."
                rows={3}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <div>Configuración actual:</div>
              <ul className="mt-2 space-y-1">
                <li>
                  • {currentConfig.selectedColumns.length} columnas
                  seleccionadas
                </li>
                <li>• {currentConfig.filterGroups.length} grupos de filtros</li>
                <li>
                  • {Object.keys(currentConfig.columnFilters).length} filtros de
                  columna
                </li>
                <li>• Búsqueda: {currentConfig.globalSearch || "ninguna"}</li>
                <li>• Ordenamiento: {currentConfig.sortColumn || "ninguno"}</li>
              </ul>
            </div>

            <Button
              onClick={handleSaveConfiguration}
              disabled={!saveName.trim()}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLoadTab = () => {
    const recentConfigObjects = recentConfigs
      .map((id) => configurations.find((c) => c.id === id))
      .filter(Boolean) as SavedConfiguration[];

    return (
      <div className="space-y-4">
        {/* Recent Configurations */}
        {recentConfigObjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Configuraciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentConfigObjects.slice(0, 5).map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatConfigurationDate(config.updated)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleLoadConfiguration(config)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Cargar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Todas las Configuraciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {configurations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay configuraciones guardadas
              </div>
            ) : (
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Actualizada</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configurations.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{config.name}</div>
                            {config.description && (
                              <div className="text-xs text-muted-foreground">
                                {config.description}
                              </div>
                            )}
                            <div className="flex gap-1 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {config.config.selectedColumns.length} cols
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {config.config.filterGroups.length} filtros
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatConfigurationDate(config.updated)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadConfiguration(config)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDeleteConfiguration(config.id)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Import/Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Importar/Exportar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportConfigurations}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Todas
              </Button>
              <Dialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Configuraciones</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder="Pega aquí el JSON exportado..."
                      rows={10}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleImportConfigurations}
                        disabled={!importData.trim()}
                      >
                        Importar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setImportDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPreferencesTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferencias de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Display Preferences */}
            <div>
              <h4 className="font-medium mb-3">Visualización</h4>
              <div className="space-y-4">
                <div>
                  <Label>Tamaño de página predeterminado</Label>
                  <Select
                    value={preferences.defaultPageSize.toString()}
                    onValueChange={(value) =>
                      handlePreferenceChange("defaultPageSize", parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compactMode"
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("compactMode", checked)
                    }
                  />
                  <Label htmlFor="compactMode">Modo compacto</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showStatsOnLoad"
                    checked={preferences.showStatsOnLoad}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("showStatsOnLoad", checked)
                    }
                  />
                  <Label htmlFor="showStatsOnLoad">
                    Mostrar estadísticas al cargar datos
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showVisualizationOnLoad"
                    checked={preferences.showVisualizationOnLoad}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("showVisualizationOnLoad", checked)
                    }
                  />
                  <Label htmlFor="showVisualizationOnLoad">
                    Mostrar gráficos al cargar datos
                  </Label>
                </div>
              </div>
            </div>

            {/* Search Preferences */}
            <div>
              <h4 className="font-medium mb-3">Búsqueda</h4>
              <div className="space-y-4">
                <div>
                  <Label>Modo de búsqueda predeterminado</Label>
                  <Select
                    value={preferences.defaultSearchMode}
                    onValueChange={(value: any) =>
                      handlePreferenceChange("defaultSearchMode", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="pattern">Patrones</SelectItem>
                      <SelectItem value="regex">Regex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Auto-save Preferences */}
            <div>
              <h4 className="font-medium mb-3">Configuraciones</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoSave"
                    checked={preferences.autoSaveConfigurations}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("autoSaveConfigurations", checked)
                    }
                  />
                  <Label htmlFor="autoSave">
                    Guardar configuraciones automáticamente
                  </Label>
                </div>

                <div>
                  <Label>Máximo configuraciones recientes</Label>
                  <Select
                    value={preferences.maxRecentConfigurations.toString()}
                    onValueChange={(value) =>
                      handlePreferenceChange(
                        "maxRecentConfigurations",
                        parseInt(value),
                      )
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Format Preferences */}
            <div>
              <h4 className="font-medium mb-3">Formatos</h4>
              <div className="space-y-4">
                <div>
                  <Label>Formato de fecha</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value: any) =>
                      handlePreferenceChange("dateFormat", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es-ES">DD/MM/YYYY</SelectItem>
                      <SelectItem value="en-US">MM/DD/YYYY</SelectItem>
                      <SelectItem value="ISO">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Formato de números</Label>
                  <Select
                    value={preferences.numberFormat}
                    onValueChange={(value: any) =>
                      handlePreferenceChange("numberFormat", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es-ES">1.234,56</SelectItem>
                      <SelectItem value="en-US">1,234.56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "save" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("save")}
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
        <Button
          variant={activeTab === "load" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("load")}
        >
          <Eye className="h-4 w-4 mr-2" />
          Cargar
        </Button>
        <Button
          variant={activeTab === "preferences" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("preferences")}
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferencias
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "save" && renderSaveTab()}
      {activeTab === "load" && renderLoadTab()}
      {activeTab === "preferences" && renderPreferencesTab()}
    </div>
  );
};
