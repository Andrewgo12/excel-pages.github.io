import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useFontScale, FONT_SCALE_OPTIONS } from "@/hooks/use-font-scale";
import { Type, Minus, Plus } from "lucide-react";

export function FontScaleControl() {
  const { fontScale, setFontScale } = useFontScale();

  const currentIndex = FONT_SCALE_OPTIONS.findIndex(
    (option) => option.value === fontScale,
  );
  const currentOption = FONT_SCALE_OPTIONS[currentIndex];

  const canDecrease = currentIndex > 0;
  const canIncrease = currentIndex < FONT_SCALE_OPTIONS.length - 1;

  const handleDecrease = () => {
    if (canDecrease) {
      setFontScale(FONT_SCALE_OPTIONS[currentIndex - 1].value);
    }
  };

  const handleIncrease = () => {
    if (canIncrease) {
      setFontScale(FONT_SCALE_OPTIONS[currentIndex + 1].value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Type className="h-4 w-4" />
          <span className="hidden sm:inline">Tamaño</span>
          <Badge variant="secondary" className="text-xs">
            {currentOption?.percentage}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Tamaño de Fuente</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Ajusta el tamaño de toda la interfaz. Los elementos se escalan
              proporcionalmente.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={!canDecrease}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <div className="flex-1 text-center">
              <div className="text-sm font-medium">{currentOption?.label}</div>
              <div className="text-xs text-muted-foreground">
                {currentOption?.percentage}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={!canIncrease}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Dropdown Selector */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Selección Directa
            </Label>
            <Select value={fontScale} onValueChange={setFontScale}>
              <SelectTrigger className="w-full mt-1">
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

          {/* Preview */}
          <div className="border rounded-lg p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground mb-2">
              Vista Previa:
            </div>
            <div className="space-y-2">
              <div className="text-responsive-sm">
                Texto pequeño - filtros y etiquetas
              </div>
              <div className="text-responsive-base">
                Texto normal - contenido de tabla
              </div>
              <div className="text-responsive-lg font-medium">
                Título de sección
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            💡 El tamaño "Compacto" está optimizado para maximizar el espacio de
            trabajo
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
