import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BorderSettings, SpacingSettings } from "@shared/table-customization";
import {
  Square,
  RoundedCorner,
  Minus,
  MoreHorizontal,
  Grid,
  Separator as SeparatorIcon,
  Settings,
  Eye,
  RotateCcw,
  Copy,
} from "lucide-react";

interface BorderControlsProps {
  borderSettings: BorderSettings;
  spacingSettings: SpacingSettings;
  onBorderSettingsChange: (settings: BorderSettings) => void;
  onSpacingSettingsChange: (settings: SpacingSettings) => void;
}

const BORDER_STYLES = [
  { value: "none", label: "Sin borde", icon: "⬜", preview: "none" },
  { value: "solid", label: "Sólido", icon: "▬", preview: "solid" },
  { value: "dashed", label: "Discontinuo", icon: "┈", preview: "dashed" },
  { value: "dotted", label: "Punteado", icon: "┄", preview: "dotted" },
  { value: "double", label: "Doble", icon: "═", preview: "double" },
] as const;

const BORDER_PRESETS = [
  {
    name: "Sin bordes",
    description: "Tabla limpia sin bordes visibles",
    settings: { style: "none" as const, width: 0, color: "#e5e7eb", radius: 0 },
  },
  {
    name: "Bordes sutiles",
    description: "Bordes finos y discretos",
    settings: {
      style: "solid" as const,
      width: 1,
      color: "#f3f4f6",
      radius: 4,
    },
  },
  {
    name: "Clásico",
    description: "Bordes tradicionales de tabla",
    settings: {
      style: "solid" as const,
      width: 1,
      color: "#e5e7eb",
      radius: 0,
    },
  },
  {
    name: "Moderno",
    description: "Bordes con esquinas redondeadas",
    settings: {
      style: "solid" as const,
      width: 2,
      color: "#d1d5db",
      radius: 8,
    },
  },
  {
    name: "Retro",
    description: "Estilo de tabla de los 90s",
    settings: {
      style: "double" as const,
      width: 3,
      color: "#6b7280",
      radius: 0,
    },
  },
  {
    name: "Tarjeta",
    description: "Aspecto de tarjeta con sombra",
    settings: {
      style: "solid" as const,
      width: 1,
      color: "#e5e7eb",
      radius: 12,
    },
  },
];

const SPACING_PRESETS = [
  {
    name: "Compacto",
    description: "Máximo aprovechamiento del espacio",
    settings: {
      padding: { top: 8, right: 12, bottom: 8, left: 12 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: 0,
    },
  },
  {
    name: "Estándar",
    description: "Espaciado equilibrado y cómodo",
    settings: {
      padding: { top: 12, right: 16, bottom: 12, left: 16 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: 0,
    },
  },
  {
    name: "Amplio",
    description: "Espaciado generoso para mejor legibilidad",
    settings: {
      padding: { top: 16, right: 20, bottom: 16, left: 20 },
      margin: { top: 8, right: 8, bottom: 8, left: 8 },
      gap: 4,
    },
  },
  {
    name: "Presentación",
    description: "Espaciado para presentaciones",
    settings: {
      padding: { top: 20, right: 24, bottom: 20, left: 24 },
      margin: { top: 16, right: 16, bottom: 16, left: 16 },
      gap: 8,
    },
  },
];

const COLOR_SUGGESTIONS = [
  "#e5e7eb",
  "#d1d5db",
  "#9ca3af",
  "#6b7280",
  "#4b5563",
  "#374151",
  "#1f2937",
  "#111827",
  "#000000",
  "#ffffff",
  "#fecaca",
  "#f87171",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#fed7aa",
  "#fdba74",
  "#f97316",
  "#ea580c",
  "#dc2626",
  "#fde68a",
  "#fcd34d",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#bbf7d0",
  "#86efac",
  "#22c55e",
  "#16a34a",
  "#15803d",
  "#bae6fd",
  "#7dd3fc",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#d8b4fe",
  "#c4b5fd",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
];

export const BorderControls: React.FC<BorderControlsProps> = ({
  borderSettings,
  spacingSettings,
  onBorderSettingsChange,
  onSpacingSettingsChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    "borders" | "spacing" | "preview"
  >("borders");

  const updateBorderSettings = (updates: Partial<BorderSettings>) => {
    onBorderSettingsChange({ ...borderSettings, ...updates });
  };

  const updateSpacingSettings = (updates: Partial<SpacingSettings>) => {
    onSpacingSettingsChange({ ...spacingSettings, ...updates });
  };

  const applyBorderPreset = (preset: (typeof BORDER_PRESETS)[0]) => {
    updateBorderSettings(preset.settings);
  };

  const applySpacingPreset = (preset: (typeof SPACING_PRESETS)[0]) => {
    updateSpacingSettings(preset.settings);
  };

  const resetBordersToDefault = () => {
    updateBorderSettings({
      style: "solid",
      width: 1,
      color: "#e5e7eb",
      radius: 4,
    });
  };

  const resetSpacingToDefault = () => {
    updateSpacingSettings({
      padding: { top: 12, right: 16, bottom: 12, left: 16 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      gap: 0,
    });
  };

  const copyCurrentSettings = () => {
    const settings = {
      borders: borderSettings,
      spacing: spacingSettings,
    };
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
  };

  const PreviewTable = () => (
    <div
      className="border overflow-hidden"
      style={{
        borderStyle: borderSettings.style,
        borderWidth: `${borderSettings.width}px`,
        borderColor: borderSettings.color,
        borderRadius: `${borderSettings.radius}px`,
        margin: `${spacingSettings.margin.top}px ${spacingSettings.margin.right}px ${spacingSettings.margin.bottom}px ${spacingSettings.margin.left}px`,
      }}
    >
      {/* Header */}
      <div
        className="bg-muted font-medium border-b"
        style={{
          padding: `${spacingSettings.padding.top}px ${spacingSettings.padding.right}px ${spacingSettings.padding.bottom}px ${spacingSettings.padding.left}px`,
          borderBottomStyle: borderSettings.style,
          borderBottomWidth: `${borderSettings.width}px`,
          borderBottomColor: borderSettings.color,
        }}
      >
        Encabezado de Columna
      </div>

      {/* Rows */}
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className={`${row < 3 ? "border-b" : ""}`}
          style={{
            padding: `${spacingSettings.padding.top}px ${spacingSettings.padding.right}px ${spacingSettings.padding.bottom}px ${spacingSettings.padding.left}px`,
            borderBottomStyle: row < 3 ? borderSettings.style : "none",
            borderBottomWidth: row < 3 ? `${borderSettings.width}px` : "0",
            borderBottomColor: borderSettings.color,
            gap: `${spacingSettings.gap}px`,
          }}
        >
          Datos de ejemplo fila {row}
        </div>
      ))}
    </div>
  );

  const ColorPicker: React.FC<{
    value: string;
    onChange: (color: string) => void;
  }> = ({ value, onChange }) => (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded border border-border cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "color";
          input.value = value;
          input.onchange = (e) =>
            onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
      />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-xs flex-1"
        placeholder="#e5e7eb"
      />
      <div className="grid grid-cols-5 gap-1">
        {COLOR_SUGGESTIONS.slice(0, 10).map((color) => (
          <button
            key={color}
            className="w-3 h-3 rounded border border-border hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === "borders" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("borders")}
          className="flex-1"
        >
          <Square className="h-4 w-4 mr-2" />
          Bordes
        </Button>
        <Button
          variant={activeTab === "spacing" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("spacing")}
          className="flex-1"
        >
          <Grid className="h-4 w-4 mr-2" />
          Espaciado
        </Button>
        <Button
          variant={activeTab === "preview" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("preview")}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Vista previa
        </Button>
      </div>

      {/* Quick Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Vista previa rápida</CardTitle>
            <Button variant="outline" size="sm" onClick={copyCurrentSettings}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar configuración
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PreviewTable />
        </CardContent>
      </Card>

      {/* Border Controls */}
      {activeTab === "borders" && (
        <div className="space-y-4">
          {/* Border Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presets de Bordes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecciona un estilo predefinido o personaliza manualmente
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BORDER_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyBorderPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <div
                        className="w-6 h-6 border"
                        style={{
                          borderStyle: preset.settings.style,
                          borderWidth: `${Math.max(preset.settings.width, 1)}px`,
                          borderColor: preset.settings.color,
                          borderRadius: `${preset.settings.radius}px`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={resetBordersToDefault}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer bordes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Border Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personalizar Bordes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Border Style */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estilo de borde</Label>
                <div className="grid grid-cols-5 gap-2">
                  {BORDER_STYLES.map((style) => (
                    <Button
                      key={style.value}
                      variant={
                        borderSettings.style === style.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateBorderSettings({ style: style.value })
                      }
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{style.icon}</span>
                      <span className="text-xs">{style.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Border Width */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Grosor del borde
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {borderSettings.width}px
                  </Badge>
                </div>
                <Slider
                  value={[borderSettings.width]}
                  onValueChange={([value]) =>
                    updateBorderSettings({ width: value })
                  }
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0px</span>
                  <span>10px</span>
                </div>
              </div>

              {/* Border Color */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Color del borde</Label>
                <ColorPicker
                  value={borderSettings.color}
                  onChange={(color) => updateBorderSettings({ color })}
                />
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Redondez de esquinas
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    {borderSettings.radius}px
                  </Badge>
                </div>
                <Slider
                  value={[borderSettings.radius]}
                  onValueChange={([value]) =>
                    updateBorderSettings({ radius: value })
                  }
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0px (cuadrado)</span>
                  <span>20px (muy redondeado)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Spacing Controls */}
      {activeTab === "spacing" && (
        <div className="space-y-4">
          {/* Spacing Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presets de Espaciado</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ajusta el espaciado interno y externo de las celdas
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SPACING_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applySpacingPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{preset.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>P:{preset.settings.padding.top}</span>
                        <span>M:{preset.settings.margin.top}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={resetSpacingToDefault}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer espaciado
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Padding Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relleno (Padding)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Espacio interno dentro de cada celda
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Superior</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.padding.top]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          padding: { ...spacingSettings.padding, top: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.padding.top}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Derecho</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.padding.right]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          padding: { ...spacingSettings.padding, right: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.padding.right}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Inferior</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.padding.bottom]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          padding: {
                            ...spacingSettings.padding,
                            bottom: value,
                          },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.padding.bottom}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Izquierdo</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.padding.left]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          padding: { ...spacingSettings.padding, left: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.padding.left}px
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Margin Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Margen (Margin)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Espacio externo alrededor de la tabla
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Superior</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.margin.top]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          margin: { ...spacingSettings.margin, top: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.margin.top}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Derecho</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.margin.right]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          margin: { ...spacingSettings.margin, right: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.margin.right}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Inferior</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.margin.bottom]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          margin: { ...spacingSettings.margin, bottom: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.margin.bottom}px
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Izquierdo</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[spacingSettings.margin.left]}
                      onValueChange={([value]) =>
                        updateSpacingSettings({
                          margin: { ...spacingSettings.margin, left: value },
                        })
                      }
                      min={0}
                      max={32}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline" className="text-xs min-w-12">
                      {spacingSettings.margin.left}px
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gap Control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Separación entre elementos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Gap</Label>
                  <Badge variant="secondary" className="text-xs">
                    {spacingSettings.gap}px
                  </Badge>
                </div>
                <Slider
                  value={[spacingSettings.gap]}
                  onValueChange={([value]) =>
                    updateSpacingSettings({ gap: value })
                  }
                  min={0}
                  max={16}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0px</span>
                  <span>16px</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Preview */}
      {activeTab === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista previa completa</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualiza cómo se verá tu tabla con la configuración actual
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <PreviewTable />

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Configuración de bordes</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>Estilo: {borderSettings.style}</div>
                    <div>Grosor: {borderSettings.width}px</div>
                    <div>Color: {borderSettings.color}</div>
                    <div>Radio: {borderSettings.radius}px</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    Configuración de espaciado
                  </h4>
                  <div className="space-y-1 text-muted-foreground">
                    <div>
                      Padding: {spacingSettings.padding.top}px{" "}
                      {spacingSettings.padding.right}px{" "}
                      {spacingSettings.padding.bottom}px{" "}
                      {spacingSettings.padding.left}px
                    </div>
                    <div>
                      Margin: {spacingSettings.margin.top}px{" "}
                      {spacingSettings.margin.right}px{" "}
                      {spacingSettings.margin.bottom}px{" "}
                      {spacingSettings.margin.left}px
                    </div>
                    <div>Gap: {spacingSettings.gap}px</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
