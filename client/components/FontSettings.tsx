import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Type,
  Settings,
  X,
  Download,
  Upload,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Info
} from 'lucide-react';
import { useFontScale, FONT_SCALE_OPTIONS } from '@/hooks/use-font-scale';

interface FontSettingsProps {
  onClose: () => void;
}

interface FontPreset {
  name: string;
  scale: string;
  description: string;
  icon: React.ReactNode;
}

const FONT_PRESETS: FontPreset[] = [
  {
    name: 'Desktop Compacto',
    scale: 'base',
    description: 'Optimizado para pantallas grandes con máxima densidad de información',
    icon: <Monitor className="h-4 w-4" />
  },
  {
    name: 'Laptop Estándar',
    scale: 'lg',
    description: 'Equilibrio perfecto entre legibilidad y espacio en laptops',
    icon: <Monitor className="h-4 w-4" />
  },
  {
    name: 'Tablet Cómodo',
    scale: 'xl',
    description: 'Textos más grandes para dispositivos táctiles',
    icon: <Tablet className="h-4 w-4" />
  },
  {
    name: 'Móvil Accesible',
    scale: '2xl',
    description: 'Máxima legibilidad en pantallas pequeñas',
    icon: <Smartphone className="h-4 w-4" />
  }
];

export function FontSettings({ onClose }: FontSettingsProps) {
  const { fontScale, setFontScale } = useFontScale();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const currentPreset = FONT_PRESETS.find(preset => preset.scale === fontScale);
  
  const applyPreset = (preset: FontPreset) => {
    setFontScale(preset.scale as any);
    if (autoSave) {
      localStorage.setItem('excel-explorer-font-preset', preset.name);
    }
  };

  const resetToDefault = () => {
    setFontScale('base');
    localStorage.removeItem('excel-explorer-font-scale');
    localStorage.removeItem('excel-explorer-font-preset');
  };

  const exportSettings = () => {
    const settings = {
      fontScale,
      autoSave,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'excel-explorer-font-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.fontScale && FONT_SCALE_OPTIONS.some(opt => opt.value === settings.fontScale)) {
          setFontScale(settings.fontScale);
          setAutoSave(settings.autoSave ?? true);
        }
      } catch (error) {
        console.error('Error importing settings:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader className="p-responsive">
        <CardTitle className="text-responsive-lg flex items-center justify-between">
          <div className="flex items-center gap-responsive-sm">
            <Type className="h-responsive-input w-responsive-input text-primary" />
            Configuración de Fuentes
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="button-responsive">
            <X className="h-responsive-input w-responsive-input" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-responsive">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-responsive-xs">
            <TabsTrigger value="presets" className="text-responsive-xs">
              Presets
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-responsive-xs">
              Personalizado
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-responsive-xs">
              Avanzado
            </TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-responsive">
            <div className="space-y-responsive">
              <div className="flex items-center justify-between">
                <h3 className="text-responsive-base font-medium">Configuraciones Predefinidas</h3>
                <Badge variant="outline" className="text-responsive-xs">
                  Actual: {currentPreset?.name || 'Personalizado'}
                </Badge>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-responsive-sm">
                  Estos presets están optimizados para diferentes tipos de dispositivos y usos.
                  El diseño se adapta automáticamente al tamaño seleccionado.
                </AlertDescription>
              </Alert>

              <div className="grid gap-responsive-sm">
                {FONT_PRESETS.map((preset) => (
                  <Card 
                    key={preset.name}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      preset.scale === fontScale ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => applyPreset(preset)}
                  >
                    <CardContent className="p-responsive-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-responsive-sm">
                          {preset.icon}
                          <div>
                            <div className="text-responsive-sm font-medium">{preset.name}</div>
                            <div className="text-responsive-xs text-muted-foreground">
                              {preset.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-responsive-xs">
                            {FONT_SCALE_OPTIONS.find(opt => opt.value === preset.scale)?.percentage}
                          </Badge>
                          {preset.scale === fontScale && (
                            <div className="text-responsive-xs text-primary mt-1">
                              ✓ Activo
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-responsive">
            <div className="space-y-responsive">
              <h3 className="text-responsive-base font-medium">Configuración Personalizada</h3>

              <div>
                <Label className="text-responsive-sm font-medium">Tamaño de Fuente</Label>
                <Select value={fontScale} onValueChange={setFontScale}>
                  <SelectTrigger className="control-responsive mt-1">
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
              </div>

              {/* Preview Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-sm">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div className="space-y-2 border rounded-lg p-responsive-sm bg-muted/30">
                    <div className="text-responsive-xs text-muted-foreground">
                      Etiquetas y filtros
                    </div>
                    <div className="text-responsive-sm">
                      Contenido de tabla y texto normal
                    </div>
                    <div className="text-responsive-base font-medium">
                      Títulos de sección
                    </div>
                    <div className="text-responsive-lg font-bold">
                      Títulos principales
                    </div>
                  </div>
                  
                  <div className="text-responsive-xs text-muted-foreground">
                    💡 Los botones, inputs y espacios se escalan proporcionalmente
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="flex gap-responsive-sm">
                <Button 
                  variant="outline" 
                  onClick={resetToDefault}
                  className="flex-1 gap-1"
                >
                  <RotateCcw className="h-responsive-input w-responsive-input" />
                  Restablecer
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-responsive">
            <div className="space-y-responsive">
              <h3 className="text-responsive-base font-medium">Configuración Avanzada</h3>

              <Card>
                <CardContent className="p-responsive-sm space-y-responsive-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoSave"
                      checked={autoSave}
                      onCheckedChange={(checked) => setAutoSave(!!checked)}
                    />
                    <Label htmlFor="autoSave" className="text-responsive-sm">
                      Guardar configuración automáticamente
                    </Label>
                  </div>
                  
                  <div className="text-responsive-xs text-muted-foreground">
                    La configuración se guardará en el navegador y se aplicará en futuras sesiones
                  </div>
                </CardContent>
              </Card>

              {/* Import/Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-sm">Importar/Exportar Configuración</CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm">
                  <div className="flex gap-responsive-sm">
                    <Button 
                      variant="outline" 
                      onClick={exportSettings}
                      className="flex-1 gap-1"
                    >
                      <Download className="h-responsive-input w-responsive-input" />
                      Exportar
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-1"
                      onClick={() => document.getElementById('import-settings')?.click()}
                    >
                      <Upload className="h-responsive-input w-responsive-input" />
                      Importar
                    </Button>
                    <input
                      id="import-settings"
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Technical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-responsive-sm">Información Técnica</CardTitle>
                </CardHeader>
                <CardContent className="p-responsive-sm">
                  <div className="space-y-2 text-responsive-xs text-muted-foreground">
                    <div>• El sistema usa variables CSS para escalado dinámico</div>
                    <div>• Todos los componentes se adaptan proporcionalmente</div>
                    <div>• Los espacios y tamaños mantienen las proporciones</div>
                    <div>• Compatible con dispositivos móviles y desktop</div>
                    <div>• Configuración persistente en localStorage</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
