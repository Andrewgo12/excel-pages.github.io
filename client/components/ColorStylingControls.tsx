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
import { ColorScheme } from "@shared/table-customization";
import {
  Palette,
  Paintbrush,
  Eye,
  Droplets,
  Grid,
  Layers,
  Sun,
  Moon,
  Contrast,
  Shuffle,
  RotateCcw,
} from "lucide-react";

interface ColorStylingControlsProps {
  colorScheme: ColorScheme;
  headerColorScheme: ColorScheme;
  alternateRowColors: boolean;
  showHoverEffects: boolean;
  showShadows: boolean;
  showStriping: boolean;
  stripingInterval: number;
  theme: 'light' | 'dark' | 'auto';
  onColorSchemeChange: (colorScheme: ColorScheme) => void;
  onHeaderColorSchemeChange: (colorScheme: ColorScheme) => void;
  onAlternateRowColorsChange: (enabled: boolean) => void;
  onShowHoverEffectsChange: (enabled: boolean) => void;
  onShowShadowsChange: (enabled: boolean) => void;
  onShowStripingChange: (enabled: boolean) => void;
  onStripingIntervalChange: (interval: number) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
}

const PRESET_COLOR_SCHEMES = [
  {
    name: 'Clásico',
    description: 'Colores neutros y profesionales',
    scheme: {
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      hover: '#f9fafb',
      selected: '#e0f2fe',
      striped: '#f8fafc',
    },
    headerScheme: {
      background: '#f9fafb',
      text: '#374151',
      border: '#e5e7eb',
      hover: '#f3f4f6',
      selected: '#e0f2fe',
    },
  },
  {
    name: 'Azul Océano',
    description: 'Tonos azules relajantes',
    scheme: {
      background: '#ffffff',
      text: '#1e3a8a',
      border: '#bfdbfe',
      hover: '#dbeafe',
      selected: '#93c5fd',
      striped: '#f0f9ff',
    },
    headerScheme: {
      background: '#1e40af',
      text: '#ffffff',
      border: '#3b82f6',
      hover: '#2563eb',
      selected: '#1d4ed8',
    },
  },
  {
    name: 'Verde Natura',
    description: 'Inspirado en la naturaleza',
    scheme: {
      background: '#ffffff',
      text: '#14532d',
      border: '#bbf7d0',
      hover: '#dcfce7',
      selected: '#86efac',
      striped: '#f0fdf4',
    },
    headerScheme: {
      background: '#16a34a',
      text: '#ffffff',
      border: '#22c55e',
      hover: '#15803d',
      selected: '#166534',
    },
  },
  {
    name: 'Púrpura Elegante',
    description: 'Sofisticado y moderno',
    scheme: {
      background: '#ffffff',
      text: '#581c87',
      border: '#d8b4fe',
      hover: '#e9d5ff',
      selected: '#c4b5fd',
      striped: '#faf5ff',
    },
    headerScheme: {
      background: '#7c3aed',
      text: '#ffffff',
      border: '#8b5cf6',
      hover: '#6d28d9',
      selected: '#5b21b6',
    },
  },
  {
    name: 'Naranja Vibrante',
    description: 'Energético y llamativo',
    scheme: {
      background: '#ffffff',
      text: '#9a3412',
      border: '#fed7aa',
      hover: '#ffedd5',
      selected: '#fdba74',
      striped: '#fff7ed',
    },
    headerScheme: {
      background: '#ea580c',
      text: '#ffffff',
      border: '#f97316',
      hover: '#dc2626',
      selected: '#c2410c',
    },
  },
  {
    name: 'Modo Oscuro',
    description: 'Optimizado para poca luz',
    scheme: {
      background: '#111827',
      text: '#f9fafb',
      border: '#374151',
      hover: '#1f2937',
      selected: '#1e40af',
      striped: '#1f2937',
    },
    headerScheme: {
      background: '#1f2937',
      text: '#f9fafb',
      border: '#4b5563',
      hover: '#374151',
      selected: '#1e40af',
    },
  },
];

const COLOR_SUGGESTIONS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b',
  '#fef2f2', '#fee2e2', '#fecaca', '#f87171', '#ef4444',
  '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a',
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c',
  '#f97316', '#ea580c', '#dc2626', '#c2410c', '#9a3412',
  '#fefce8', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
  '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
  '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e',
  '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c4b5fd',
  '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
];

export const ColorStylingControls: React.FC<ColorStylingControlsProps> = ({
  colorScheme,
  headerColorScheme,
  alternateRowColors,
  showHoverEffects,
  showShadows,
  showStriping,
  stripingInterval,
  theme,
  onColorSchemeChange,
  onHeaderColorSchemeChange,
  onAlternateRowColorsChange,
  onShowHoverEffectsChange,
  onShowShadowsChange,
  onShowStripingChange,
  onStripingIntervalChange,
  onThemeChange,
}) => {
  const [activeSection, setActiveSection] = React.useState<'presets' | 'cells' | 'headers' | 'effects'>('presets');
  const [customColor, setCustomColor] = React.useState('#ffffff');

  const applyPreset = (preset: typeof PRESET_COLOR_SCHEMES[0]) => {
    onColorSchemeChange(preset.scheme);
    onHeaderColorSchemeChange(preset.headerScheme);
  };

  const updateCellColor = (property: keyof ColorScheme, color: string) => {
    onColorSchemeChange({ ...colorScheme, [property]: color });
  };

  const updateHeaderColor = (property: keyof ColorScheme, color: string) => {
    onHeaderColorSchemeChange({ ...headerColorScheme, [property]: color });
  };

  const generateRandomColors = () => {
    const getRandomColor = () => COLOR_SUGGESTIONS[Math.floor(Math.random() * COLOR_SUGGESTIONS.length)];
    
    const newColorScheme: ColorScheme = {
      background: '#ffffff',
      text: '#1f2937',
      border: getRandomColor(),
      hover: getRandomColor(),
      selected: getRandomColor(),
      striped: getRandomColor(),
    };

    const newHeaderScheme: ColorScheme = {
      background: getRandomColor(),
      text: '#ffffff',
      border: getRandomColor(),
      hover: getRandomColor(),
      selected: getRandomColor(),
    };

    onColorSchemeChange(newColorScheme);
    onHeaderColorSchemeChange(newHeaderScheme);
  };

  const resetToDefaults = () => {
    const defaultScheme: ColorScheme = {
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      hover: '#f9fafb',
      selected: '#e0f2fe',
      striped: '#f8fafc',
    };

    const defaultHeaderScheme: ColorScheme = {
      background: '#f9fafb',
      text: '#374151',
      border: '#e5e7eb',
      hover: '#f3f4f6',
      selected: '#e0f2fe',
    };

    onColorSchemeChange(defaultScheme);
    onHeaderColorSchemeChange(defaultHeaderScheme);
    onAlternateRowColorsChange(true);
    onShowHoverEffectsChange(true);
    onShowShadowsChange(false);
    onShowStripingChange(true);
    onStripingIntervalChange(1);
  };

  const ColorPicker: React.FC<{
    label: string;
    value: string;
    onChange: (color: string) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline" className="text-xs font-mono">
          {value}
        </Badge>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded border border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = value;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
          placeholder="#ffffff"
        />
      </div>
      <div className="grid grid-cols-10 gap-1">
        {COLOR_SUGGESTIONS.slice(0, 20).map((color) => (
          <button
            key={color}
            className="w-4 h-4 rounded border border-border hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  const PreviewTable = () => (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 border-b font-medium"
        style={{
          backgroundColor: headerColorScheme.background,
          color: headerColorScheme.text,
          borderColor: headerColorScheme.border,
        }}
      >
        Encabezado de Ejemplo
      </div>
      
      {/* Rows */}
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className={`px-4 py-3 ${row < 3 ? 'border-b' : ''} transition-colors`}
          style={{
            backgroundColor: row % 2 === 0 && showStriping && alternateRowColors
              ? colorScheme.striped
              : colorScheme.background,
            color: colorScheme.text,
            borderColor: colorScheme.border,
          }}
          onMouseEnter={(e) => {
            if (showHoverEffects) {
              e.currentTarget.style.backgroundColor = colorScheme.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 
              row % 2 === 0 && showStriping && alternateRowColors
                ? colorScheme.striped
                : colorScheme.background;
          }}
        >
          Datos de ejemplo fila {row}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeSection === 'presets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('presets')}
          className="flex-1"
        >
          <Palette className="h-4 w-4 mr-2" />
          Presets
        </Button>
        <Button
          variant={activeSection === 'cells' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('cells')}
          className="flex-1"
        >
          <Grid className="h-4 w-4 mr-2" />
          Celdas
        </Button>
        <Button
          variant={activeSection === 'headers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('headers')}
          className="flex-1"
        >
          <Layers className="h-4 w-4 mr-2" />
          Encabezados
        </Button>
        <Button
          variant={activeSection === 'effects' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('effects')}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-2" />
          Efectos
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vista previa</CardTitle>
        </CardHeader>
        <CardContent>
          <PreviewTable />
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Tema general</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('light')}
              className="flex-1"
            >
              <Sun className="h-4 w-4 mr-2" />
              Claro
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onThemeChange('dark')}
              className="flex-1"
            >
              <Moon className="h-4 w-4 mr-2" />
              Oscuro
            </Button>
            <Button
              variant={theme === 'auto' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange('auto')}
              className="flex-1"
            >
              <Contrast className="h-4 w-4 mr-2" />
              Auto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active section */}
      {activeSection === 'presets' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Esquemas de Color Predefinidos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Selecciona un esquema completo o úsalo como punto de partida
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_COLOR_SCHEMES.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{preset.name}</h4>
                      <div className="flex space-x-1">
                        {Object.values(preset.scheme).slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex gap-2">
                <Button variant="outline" onClick={generateRandomColors} className="flex-1">
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generar Aleatorio
                </Button>
                <Button variant="outline" onClick={resetToDefaults} className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restablecer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSection === 'cells' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colores de Celdas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personaliza los colores para el contenido de las celdas
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ColorPicker
              label="Fondo"
              value={colorScheme.background}
              onChange={(color) => updateCellColor('background', color)}
              description="Color de fondo principal de las celdas"
            />

            <ColorPicker
              label="Texto"
              value={colorScheme.text}
              onChange={(color) => updateCellColor('text', color)}
              description="Color del texto en las celdas"
            />

            <ColorPicker
              label="Bordes"
              value={colorScheme.border}
              onChange={(color) => updateCellColor('border', color)}
              description="Color de los bordes entre celdas"
            />

            <ColorPicker
              label="Hover"
              value={colorScheme.hover}
              onChange={(color) => updateCellColor('hover', color)}
              description="Color al pasar el cursor sobre una fila"
            />

            <ColorPicker
              label="Selección"
              value={colorScheme.selected}
              onChange={(color) => updateCellColor('selected', color)}
              description="Color de fondo para filas seleccionadas"
            />

            {colorScheme.striped && (
              <ColorPicker
                label="Filas Alternadas"
                value={colorScheme.striped}
                onChange={(color) => updateCellColor('striped', color)}
                description="Color para el efecto zebra (filas intercaladas)"
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'headers' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colores de Encabezados</CardTitle>
            <p className="text-sm text-muted-foreground">
              Personaliza los colores para los encabezados de columna
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ColorPicker
              label="Fondo"
              value={headerColorScheme.background}
              onChange={(color) => updateHeaderColor('background', color)}
              description="Color de fondo de los encabezados"
            />

            <ColorPicker
              label="Texto"
              value={headerColorScheme.text}
              onChange={(color) => updateHeaderColor('text', color)}
              description="Color del texto en los encabezados"
            />

            <ColorPicker
              label="Bordes"
              value={headerColorScheme.border}
              onChange={(color) => updateHeaderColor('border', color)}
              description="Color de los bordes de encabezados"
            />

            <ColorPicker
              label="Hover"
              value={headerColorScheme.hover}
              onChange={(color) => updateHeaderColor('hover', color)}
              description="Color al interactuar con encabezados"
            />

            <ColorPicker
              label="Selección"
              value={headerColorScheme.selected}
              onChange={(color) => updateHeaderColor('selected', color)}
              description="Color para encabezados seleccionados"
            />
          </CardContent>
        </Card>
      )}

      {activeSection === 'effects' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Efectos Visuales</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configura efectos y comportamientos visuales
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row Effects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Filas alternadas</Label>
                  <p className="text-xs text-muted-foreground">
                    Alternar colores de fondo para mejorar la lectura
                  </p>
                </div>
                <Switch
                  checked={alternateRowColors}
                  onCheckedChange={onAlternateRowColorsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Efecto hover</Label>
                  <p className="text-xs text-muted-foreground">
                    Resaltar filas al pasar el cursor
                  </p>
                </div>
                <Switch
                  checked={showHoverEffects}
                  onCheckedChange={onShowHoverEffectsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Sombras</Label>
                  <p className="text-xs text-muted-foreground">
                    Agregar sombras sutiles a la tabla
                  </p>
                </div>
                <Switch
                  checked={showShadows}
                  onCheckedChange={onShowShadowsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Rayas zebra</Label>
                  <p className="text-xs text-muted-foreground">
                    Patrón de rayas para mejor legibilidad
                  </p>
                </div>
                <Switch
                  checked={showStriping}
                  onCheckedChange={onShowStripingChange}
                />
              </div>

              {showStriping && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Intervalo de rayas</Label>
                    <Badge variant="secondary" className="text-xs">
                      Cada {stripingInterval} fila{stripingInterval > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Slider
                    value={[stripingInterval]}
                    onValueChange={([value]) => onStripingIntervalChange(value)}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Cada fila</span>
                    <span>Cada 5 filas</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
