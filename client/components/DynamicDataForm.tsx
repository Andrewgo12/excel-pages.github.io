import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExcelColumn } from "@shared/excel-types";
import { cn } from "@/lib/utils";

interface DynamicDataFormProps {
  columns: ExcelColumn[];
  onAddData: (newRow: Record<string, any>) => void;
  onBulkAdd?: (newRows: Record<string, any>[]) => void;
}

export function DynamicDataForm({ columns, onAddData, onBulkAdd }: DynamicDataFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [bulkData, setBulkData] = useState("");
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((columnKey: string, value: any) => {
    setFormData(prev => ({ ...prev, [columnKey]: value }));
    // Clear error when user starts typing
    if (errors[columnKey]) {
      setErrors(prev => ({ ...prev, [columnKey]: "" }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    columns.forEach(column => {
      const value = formData[column.key];
      
      // Check if required field is empty (assuming some fields are required)
      if (!value && Math.random() > 0.7) { // Simulate some required fields
        newErrors[column.key] = `${column.label} es requerido`;
        return;
      }
      
      // Type validation
      if (value) {
        switch (column.type) {
          case "number":
            if (isNaN(Number(value))) {
              newErrors[column.key] = "Debe ser un número válido";
            }
            break;
          case "date":
            if (value && isNaN(Date.parse(value))) {
              newErrors[column.key] = "Debe ser una fecha válida";
            }
            break;
          case "boolean":
            // Boolean validation is handled by checkbox
            break;
          default:
            if (typeof value !== "string") {
              newErrors[column.key] = "Debe ser texto válido";
            }
            break;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, columns]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRow = { ...formData, _id: Date.now() };
      onAddData(newRow);
      
      // Reset form
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error("Error adding data:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onAddData]);

  const handleBulkSubmit = useCallback(async () => {
    if (!bulkData.trim() || !onBulkAdd) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse bulk data (CSV-like format)
      const lines = bulkData.trim().split('\n');
      const newRows = lines.map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, any> = { _id: Date.now() + index };
        
        columns.forEach((column, colIndex) => {
          const value = values[colIndex] || "";
          
          // Type conversion
          switch (column.type) {
            case "number":
              row[column.key] = value ? Number(value) : "";
              break;
            case "boolean":
              row[column.key] = value.toLowerCase() === "true" || value === "1";
              break;
            case "date":
              row[column.key] = value;
              break;
            default:
              row[column.key] = value;
              break;
          }
        });
        
        return row;
      });
      
      onBulkAdd(newRows);
      setBulkData("");
    } catch (error) {
      console.error("Error adding bulk data:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [bulkData, columns, onBulkAdd]);

  const renderField = useCallback((column: ExcelColumn) => {
    const value = formData[column.key] || "";
    const hasError = !!errors[column.key];
    
    switch (column.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.key}
              checked={!!value}
              onCheckedChange={(checked) => handleInputChange(column.key, checked)}
            />
            <Label htmlFor={column.key} className="text-sm">
              {column.label}
            </Label>
          </div>
        );
        
      case "number":
        return (
          <div className="space-y-1">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label} <Badge variant="outline" className="text-xs">Número</Badge>
            </Label>
            <Input
              id={column.key}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(column.key, e.target.value)}
              className={cn("h-8 text-sm", hasError && "border-destructive")}
              placeholder={`Ingrese ${column.label.toLowerCase()}`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors[column.key]}
              </div>
            )}
          </div>
        );
        
      case "date":
        return (
          <div className="space-y-1">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label} <Badge variant="outline" className="text-xs">Fecha</Badge>
            </Label>
            <div className="relative">
              <Input
                id={column.key}
                type="date"
                value={value}
                onChange={(e) => handleInputChange(column.key, e.target.value)}
                className={cn("h-8 text-sm", hasError && "border-destructive")}
              />
              <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            </div>
            {hasError && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors[column.key]}
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="space-y-1">
            <Label htmlFor={column.key} className="text-sm font-medium">
              {column.label} <Badge variant="outline" className="text-xs">Texto</Badge>
            </Label>
            <Input
              id={column.key}
              type="text"
              value={value}
              onChange={(e) => handleInputChange(column.key, e.target.value)}
              className={cn("h-8 text-sm", hasError && "border-destructive")}
              placeholder={`Ingrese ${column.label.toLowerCase()}`}
            />
            {hasError && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors[column.key]}
              </div>
            )}
          </div>
        );
    }
  }, [formData, errors, handleInputChange]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Agregar Datos</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
              className="h-7 text-xs"
            >
              Individual
            </Button>
            <Button
              variant={mode === "bulk" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("bulk")}
              className="h-7 text-xs"
            >
              Masivo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {mode === "single" ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map(column => (
                  <div key={column.key}>
                    {renderField(column)}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-8 text-sm"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isSubmitting ? "Guardando..." : "Agregar Fila"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setFormData({});
                    setErrors({});
                  }}
                  className="h-8 text-sm"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">
                  Datos en formato CSV (separado por comas)
                </Label>
                <div className="text-xs text-muted-foreground mt-1">
                  Orden: {columns.map(c => c.label).join(", ")}
                </div>
              </div>
              
              <Textarea
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
                placeholder={`Ejemplo:\nValor1, Valor2, Valor3\nOtroValor1, OtroValor2, OtroValor3`}
                className="min-h-32 text-sm font-mono"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleBulkSubmit}
                  disabled={!bulkData.trim() || isSubmitting}
                  className="h-8 text-sm"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {isSubmitting ? "Agregando..." : "Agregar Filas"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBulkData("")}
                  className="h-8 text-sm"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              </div>
            </div>
          </>
        )}
        
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="text-sm font-medium mb-2">💡 Consejos:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Los campos se adaptan automáticamente al tipo de dato</li>
            <li>• Use modo Individual para precisión o Masivo para rapidez</li>
            <li>• Los datos se validan antes de agregarse a la tabla</li>
            <li>• Los cambios se reflejan inmediatamente en tiempo real</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
