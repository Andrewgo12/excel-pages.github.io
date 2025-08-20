import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FontSettings, TextAlignment } from "@shared/table-customization";
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

interface FontTypographyControlsProps {
  cellFont: FontSettings;
  headerFont: FontSettings;
  cellAlignment: TextAlignment;
  headerAlignment: TextAlignment;
  onCellFontChange: (font: FontSettings) => void;
  onHeaderFontChange: (font: FontSettings) => void;
  onCellAlignmentChange: (alignment: TextAlignment) => void;
  onHeaderAlignmentChange: (alignment: TextAlignment) => void;
  previewText?: string;
}

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter (Recomendado)' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Monaco, monospace', label: 'Monaco' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
  { value: 'Impact, sans-serif', label: 'Impact' },
];

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin (100)' },
  { value: 200, label: 'Extra Light (200)' },
  { value: 300, label: 'Light (300)' },
  { value: 'normal', label: 'Normal (400)' },
  { value: 500, label: 'Medium (500)' },
  { value: 600, label: 'Semi Bold (600)' },
  { value: 'bold', label: 'Bold (700)' },
  { value: 800, label: 'Extra Bold (800)' },
  { value: 900, label: 'Black (900)' },
];

const FONT_STYLES = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Cursiva' },
  { value: 'oblique', label: 'Oblicua' },
];

const HORIZONTAL_ALIGNMENTS = [
  { value: 'left', label: 'Izquierda', icon: AlignLeft },
  { value: 'center', label: 'Centrado', icon: AlignCenter },
  { value: 'right', label: 'Derecha', icon: AlignRight },
  { value: 'justify', label: 'Justificado', icon: AlignJustify },
];

const VERTICAL_ALIGNMENTS = [
  { value: 'top', label: 'Arriba' },
  { value: 'middle', label: 'Centro' },
  { value: 'bottom', label: 'Abajo' },
];

export const FontTypographyControls: React.FC<FontTypographyControlsProps> = ({
  cellFont,
  headerFont,
  cellAlignment,
  headerAlignment,
  onCellFontChange,
  onHeaderFontChange,
  onCellAlignmentChange,
  onHeaderAlignmentChange,
  previewText = "Ejemplo de texto",
}) => {
  const [activeSection, setActiveSection] = React.useState<'cells' | 'headers'>('cells');

  const updateCellFont = (updates: Partial<FontSettings>) => {
    onCellFontChange({ ...cellFont, ...updates });
  };

  const updateHeaderFont = (updates: Partial<FontSettings>) => {
    onHeaderFontChange({ ...headerFont, ...updates });
  };

  const updateCellAlignment = (updates: Partial<TextAlignment>) => {
    onCellAlignmentChange({ ...cellAlignment, ...updates });
  };

  const updateHeaderAlignment = (updates: Partial<TextAlignment>) => {
    onHeaderAlignmentChange({ ...headerAlignment, ...updates });
  };

  const resetToDefaults = () => {
    if (activeSection === 'cells') {
      onCellFontChange({
        family: 'Inter, system-ui, sans-serif',
        size: 14,
        weight: 'normal',
        style: 'normal',
        lineHeight: 1.5,
      });
      onCellAlignmentChange({ horizontal: 'left', vertical: 'middle' });
    } else {
      onHeaderFontChange({
        family: 'Inter, system-ui, sans-serif',
        size: 14,
        weight: 'bold',
        style: 'normal',
        lineHeight: 1.4,
      });
      onHeaderAlignmentChange({ horizontal: 'left', vertical: 'middle' });
    }
  };

  const currentFont = activeSection === 'cells' ? cellFont : headerFont;
  const currentAlignment = activeSection === 'cells' ? cellAlignment : headerAlignment;
  const updateFont = activeSection === 'cells' ? updateCellFont : updateHeaderFont;
  const updateAlignment = activeSection === 'cells' ? updateCellAlignment : updateHeaderAlignment;

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeSection === 'cells' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('cells')}
          className="flex-1"
        >
          <Type className="h-4 w-4 mr-2" />
          Contenido de Celdas
        </Button>
        <Button
          variant={activeSection === 'headers' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('headers')}
          className="flex-1"
        >
          <Bold className="h-4 w-4 mr-2" />
          Encabezados
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vista previa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {/* Header Preview */}
            <div
              className="px-4 py-3 bg-muted border-b"
              style={{
                fontFamily: headerFont.family,
                fontSize: `${headerFont.size}px`,
                fontWeight: headerFont.weight,
                fontStyle: headerFont.style,
                lineHeight: headerFont.lineHeight,
                textAlign: headerAlignment.horizontal,
                verticalAlign: headerAlignment.vertical,
              }}
            >
              Encabezado de Columna
            </div>
            {/* Cell Preview */}
            <div
              className="px-4 py-3"
              style={{
                fontFamily: cellFont.family,
                fontSize: `${cellFont.size}px`,
                fontWeight: cellFont.weight,
                fontStyle: cellFont.style,
                lineHeight: cellFont.lineHeight,
                textAlign: cellAlignment.horizontal,
                verticalAlign: cellAlignment.vertical,
              }}
            >
              {previewText}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              {activeSection === 'cells' ? 'Tipografía de Celdas' : 'Tipografía de Encabezados'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              Restablecer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Font Family */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Familia de fuente</Label>
            <Select
              value={currentFont.family}
              onValueChange={(value) => updateFont({ family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Tamaño de fuente</Label>
              <Badge variant="secondary" className="text-xs">
                {currentFont.size}px
              </Badge>
            </div>
            <Slider
              value={[currentFont.size]}
              onValueChange={([value]) => updateFont({ size: value })}
              min={8}
              max={32}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8px</span>
              <span>32px</span>
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Peso de fuente</Label>
            <Select
              value={String(currentFont.weight)}
              onValueChange={(value) => 
                updateFont({ weight: isNaN(Number(value)) ? value as any : Number(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map((weight) => (
                  <SelectItem key={weight.value} value={String(weight.value)}>
                    <span style={{ fontWeight: weight.value }}>{weight.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Style */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estilo de fuente</Label>
            <Select
              value={currentFont.style}
              onValueChange={(value: 'normal' | 'italic' | 'oblique') => 
                updateFont({ style: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_STYLES.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    <span style={{ fontStyle: style.value }}>{style.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Altura de línea</Label>
              <Badge variant="secondary" className="text-xs">
                {currentFont.lineHeight}
              </Badge>
            </div>
            <Slider
              value={[currentFont.lineHeight]}
              onValueChange={([value]) => updateFont({ lineHeight: Math.round(value * 10) / 10 })}
              min={1.0}
              max={3.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1.0</span>
              <span>3.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignment Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">
            Alineación {activeSection === 'cells' ? 'de Celdas' : 'de Encabezados'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Horizontal Alignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alineación horizontal</Label>
            <div className="grid grid-cols-4 gap-2">
              {HORIZONTAL_ALIGNMENTS.map((align) => {
                const Icon = align.icon;
                return (
                  <Button
                    key={align.value}
                    variant={currentAlignment.horizontal === align.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAlignment({ horizontal: align.value as any })}
                    className="aspect-square"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Vertical Alignment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Alineación vertical</Label>
            <Select
              value={currentAlignment.vertical}
              onValueChange={(value: 'top' | 'middle' | 'bottom') => 
                updateAlignment({ vertical: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERTICAL_ALIGNMENTS.map((align) => (
                  <SelectItem key={align.value} value={align.value}>
                    {align.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFont({ family: 'system-ui, sans-serif', size: 12 });
                updateAlignment({ horizontal: 'left', vertical: 'middle' });
              }}
            >
              Compacto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFont({ family: 'Inter, system-ui, sans-serif', size: 16 });
                updateAlignment({ horizontal: 'left', vertical: 'middle' });
              }}
            >
              Legible
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFont({ family: 'Georgia, serif', size: 14, style: 'normal' });
                updateAlignment({ horizontal: 'left', vertical: 'middle' });
              }}
            >
              Elegante
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateFont({ family: 'Monaco, monospace', size: 13 });
                updateAlignment({ horizontal: 'left', vertical: 'middle' });
              }}
            >
              Técnico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
