import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  Layers,
  Sparkles,
  Zap,
  Settings,
  Palette,
  MousePointer,
  Grid,
  Shadow,
  Contrast,
  Accessibility,
  RotateCcw,
} from "lucide-react";

interface VisualOptionsControlsProps {
  theme: 'light' | 'dark' | 'auto';
  stickyHeader: boolean;
  virtualization: boolean;
  virtualizationThreshold: number;
  showHoverEffects: boolean;
  showShadows: boolean;
  showStriping: boolean;
  stripingInterval: number;
  responsive: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  onStickyHeaderChange: (enabled: boolean) => void;
  onVirtualizationChange: (enabled: boolean) => void;
  onVirtualizationThresholdChange: (threshold: number) => void;
  onShowHoverEffectsChange: (enabled: boolean) => void;
  onShowShadowsChange: (enabled: boolean) => void;
  onShowStripingChange: (enabled: boolean) => void;
  onStripingIntervalChange: (interval: number) => void;
  onResponsiveChange: (enabled: boolean) => void;
  onBreakpointsChange: (breakpoints: { mobile: number; tablet: number; desktop: number }) => void;
}

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Claro',
    icon: Sun,
    description: 'Tema claro para uso diurno',
    preview: 'bg-white text-gray-900',
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: Moon,
    description: 'Tema oscuro para uso nocturno',
    preview: 'bg-gray-900 text-white',
  },
  {
    value: 'auto',
    label: 'Automático',
    icon: Monitor,
    description: 'Se adapta al sistema operativo',
    preview: 'bg-gradient-to-r from-white via-gray-100 to-gray-900',
  },
] as const;

const VISUAL_PRESETS = [
  {
    name: 'Minimalista',
    description: 'Interfaz limpia y sin distracciones',
    settings: {
      showHoverEffects: false,
      showShadows: false,
      showStriping: false,
      stickyHeader: true,
      responsive: true,
    },
  },
  {
    name: 'Interactivo',
    description: 'Máxima interactividad y feedback visual',
    settings: {
      showHoverEffects: true,
      showShadows: true,
      showStriping: true,
      stickyHeader: true,
      responsive: true,
    },
  },
  {
    name: 'Presentación',
    description: 'Optimizado para presentaciones',
    settings: {
      showHoverEffects: true,
      showShadows: true,
      showStriping: false,
      stickyHeader: false,
      responsive: false,
    },
  },
  {
    name: 'Alto rendimiento',
    description: 'Optimizado para grandes datasets',
    settings: {
      showHoverEffects: false,
      showShadows: false,
      showStriping: true,
      stickyHeader: true,
      responsive: true,
    },
  },
];

const ACCESSIBILITY_PRESETS = [
  {
    name: 'Alto contraste',
    description: 'Para usuarios con dificultades visuales',
    settings: {
      showHoverEffects: true,
      showShadows: false,
      showStriping: true,
      stripingInterval: 1,
    },
  },
  {
    name: 'Reducir movimiento',
    description: 'Minimiza animaciones y transiciones',
    settings: {
      showHoverEffects: false,
      showShadows: false,
      showStriping: false,
      stripingInterval: 2,
    },
  },
  {
    name: 'Máxima legibilidad',
    description: 'Optimizado para lectura clara',
    settings: {
      showHoverEffects: true,
      showShadows: false,
      showStriping: true,
      stripingInterval: 1,
    },
  },
];

export const VisualOptionsControls: React.FC<VisualOptionsControlsProps> = ({
  theme,
  stickyHeader,
  virtualization,
  virtualizationThreshold,
  showHoverEffects,
  showShadows,
  showStriping,
  stripingInterval,
  responsive,
  breakpoints,
  onThemeChange,
  onStickyHeaderChange,
  onVirtualizationChange,
  onVirtualizationThresholdChange,
  onShowHoverEffectsChange,
  onShowShadowsChange,
  onShowStripingChange,
  onStripingIntervalChange,
  onResponsiveChange,
  onBreakpointsChange,
}) => {
  const [activeTab, setActiveTab] = React.useState<'theme' | 'behavior' | 'performance' | 'accessibility'>('theme');

  const applyVisualPreset = (preset: typeof VISUAL_PRESETS[0]) => {
    onShowHoverEffectsChange(preset.settings.showHoverEffects);
    onShowShadowsChange(preset.settings.showShadows);
    onShowStripingChange(preset.settings.showStriping);
    onStickyHeaderChange(preset.settings.stickyHeader);
    onResponsiveChange(preset.settings.responsive);
  };

  const applyAccessibilityPreset = (preset: typeof ACCESSIBILITY_PRESETS[0]) => {
    onShowHoverEffectsChange(preset.settings.showHoverEffects);
    onShowShadowsChange(preset.settings.showShadows);
    onShowStripingChange(preset.settings.showStriping);
    onStripingIntervalChange(preset.settings.stripingInterval);
  };

  const resetToDefaults = () => {
    onThemeChange('light');
    onStickyHeaderChange(true);
    onVirtualizationChange(false);
    onVirtualizationThresholdChange(1000);
    onShowHoverEffectsChange(true);
    onShowShadowsChange(false);
    onShowStripingChange(true);
    onStripingIntervalChange(1);
    onResponsiveChange(true);
    onBreakpointsChange({
      mobile: 640,
      tablet: 768,
      desktop: 1024,
    });
  };

  const updateBreakpoints = (device: keyof typeof breakpoints, value: number) => {
    onBreakpointsChange({
      ...breakpoints,
      [device]: value,
    });
  };

  const PreviewCard = ({ title, children, isActive = false }: { title: string; children: React.ReactNode; isActive?: boolean }) => (
    <div className={`border rounded-lg p-3 ${isActive ? 'ring-2 ring-primary' : ''}`}>
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="text-xs text-muted-foreground">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'theme' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('theme')}
          className="flex-1"
        >
          <Palette className="h-4 w-4 mr-2" />
          Tema
        </Button>
        <Button
          variant={activeTab === 'behavior' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('behavior')}
          className="flex-1"
        >
          <MousePointer className="h-4 w-4 mr-2" />
          Comportamiento
        </Button>
        <Button
          variant={activeTab === 'performance' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('performance')}
          className="flex-1"
        >
          <Zap className="h-4 w-4 mr-2" />
          Rendimiento
        </Button>
        <Button
          variant={activeTab === 'accessibility' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('accessibility')}
          className="flex-1"
        >
          <Accessibility className="h-4 w-4 mr-2" />
          Accesibilidad
        </Button>
      </div>

      {/* Theme Controls */}
      {activeTab === 'theme' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selección de Tema</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cambia entre tema claro, oscuro o automático
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        theme === option.value 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => onThemeChange(option.value)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <div className={`h-8 rounded mb-2 ${option.preview}`} />
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presets Visuales</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configuraciones predefinidas para diferentes usos
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {VISUAL_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyVisualPreset(preset)}
                  >
                    <h4 className="font-medium text-sm mb-1">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Behavior Controls */}
      {activeTab === 'behavior' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Efectos Interactivos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configura cómo responde la tabla a las interacciones del usuario
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Efectos hover</Label>
                  <p className="text-xs text-muted-foreground">
                    Resalta filas al pasar el cursor
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
                    Agrega profundidad visual con sombras
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
                    Alterna colores de fondo para mejor legibilidad
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
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Encabezado fijo</Label>
                  <p className="text-xs text-muted-foreground">
                    Mantiene los encabezados visibles al hacer scroll
                  </p>
                </div>
                <Switch
                  checked={stickyHeader}
                  onCheckedChange={onStickyHeaderChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diseño Responsivo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configura cómo se adapta la tabla a diferentes tamaños de pantalla
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Modo responsivo</Label>
                  <p className="text-xs text-muted-foreground">
                    Adapta automáticamente el diseño
                  </p>
                </div>
                <Switch
                  checked={responsive}
                  onCheckedChange={onResponsiveChange}
                />
              </div>

              {responsive && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Punto de quiebre móvil</Label>
                      <Badge variant="outline" className="text-xs">
                        {breakpoints.mobile}px
                      </Badge>
                    </div>
                    <Slider
                      value={[breakpoints.mobile]}
                      onValueChange={([value]) => updateBreakpoints('mobile', value)}
                      min={320}
                      max={768}
                      step={16}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Punto de quiebre tablet</Label>
                      <Badge variant="outline" className="text-xs">
                        {breakpoints.tablet}px
                      </Badge>
                    </div>
                    <Slider
                      value={[breakpoints.tablet]}
                      onValueChange={([value]) => updateBreakpoints('tablet', value)}
                      min={640}
                      max={1024}
                      step={16}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Punto de quiebre escritorio</Label>
                      <Badge variant="outline" className="text-xs">
                        {breakpoints.desktop}px
                      </Badge>
                    </div>
                    <Slider
                      value={[breakpoints.desktop]}
                      onValueChange={([value]) => updateBreakpoints('desktop', value)}
                      min={1024}
                      max={1920}
                      step={16}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Controls */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Optimización de Rendimiento</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configura opciones para mejorar el rendimiento con grandes datasets
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Virtualización</Label>
                <p className="text-xs text-muted-foreground">
                  Renderiza solo las filas visibles para mejor rendimiento
                </p>
              </div>
              <Switch
                checked={virtualization}
                onCheckedChange={onVirtualizationChange}
              />
            </div>

            {virtualization && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Umbral de virtualización</Label>
                  <Badge variant="secondary" className="text-xs">
                    {virtualizationThreshold.toLocaleString()} filas
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Activa la virtualización cuando el número de filas supere este valor
                </p>
                <Slider
                  value={[virtualizationThreshold]}
                  onValueChange={([value]) => onVirtualizationThresholdChange(value)}
                  min={100}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>100 filas</span>
                  <span>10,000 filas</span>
                </div>
              </div>
            )}

            <Separator />

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Recomendaciones de rendimiento
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Desactiva efectos visuales para datasets grandes (&gt;5,000 filas)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Usa virtualización para datasets muy grandes (&gt;1,000 filas)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Reduce el número de columnas visibles si es posible</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Considera usar filtros para reducir el conjunto de datos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Controls */}
      {activeTab === 'accessibility' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presets de Accesibilidad</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configuraciones optimizadas para diferentes necesidades de accesibilidad
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {ACCESSIBILITY_PRESETS.map((preset) => (
                  <div
                    key={preset.name}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => applyAccessibilityPreset(preset)}
                  >
                    <h4 className="font-medium text-sm mb-1">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración Manual</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ajusta opciones específicas de accesibilidad
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  Pautas de accesibilidad
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span>•</span>
                    <span>Usa rayas zebra para mejorar la legibilidad</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>•</span>
                    <span>Mantén un contraste mínimo de 4.5:1 para texto</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>•</span>
                    <span>Asegúrate de que los elementos interactivos sean claramente visibles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>•</span>
                    <span>Reduce animaciones si el usuario lo prefiere</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Indicadores visuales mejorados</Label>
                    <p className="text-xs text-muted-foreground">
                      Mejora la visibilidad de estados hover y selección
                    </p>
                  </div>
                  <Switch
                    checked={showHoverEffects}
                    onCheckedChange={onShowHoverEffectsChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Rayas para legibilidad</Label>
                    <p className="text-xs text-muted-foreground">
                      Facilita seguir las filas horizontalmente
                    </p>
                  </div>
                  <Switch
                    checked={showStriping}
                    onCheckedChange={onShowStripingChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Encabezados fijos</Label>
                    <p className="text-xs text-muted-foreground">
                      Mantiene el contexto de las columnas visible
                    </p>
                  </div>
                  <Switch
                    checked={stickyHeader}
                    onCheckedChange={onStickyHeaderChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reset Button */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" onClick={resetToDefaults} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer todas las opciones visuales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
