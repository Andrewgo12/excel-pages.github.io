import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableStylesControl } from "./TableStylesControl";
import { CustomizableTable } from "./CustomizableTable";
import {
  TableCustomization,
  DEFAULT_TABLE_CUSTOMIZATION,
  generateTableStyles,
} from "@shared/table-customization";
import { ExcelColumn } from "@shared/excel-types";
import { Sparkles, Database, Eye, Settings } from "lucide-react";

const DEMO_COLUMNS: ExcelColumn[] = [
  { key: 'id', label: 'ID', type: 'number' },
  { key: 'name', label: 'Nombre', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'department', label: 'Departamento', type: 'text' },
  { key: 'salary', label: 'Salario', type: 'number' },
  { key: 'hire_date', label: 'Fecha Contratación', type: 'date' },
  { key: 'active', label: 'Activo', type: 'boolean' },
  { key: 'performance', label: 'Rendimiento', type: 'number' },
];

const DEMO_DATA = [
  {
    id: 1,
    name: 'Ana García',
    email: 'ana.garcia@empresa.com',
    department: 'Desarrollo',
    salary: 65000,
    hire_date: '2022-01-15',
    active: true,
    performance: 4.8,
  },
  {
    id: 2,
    name: 'Carlos López',
    email: 'carlos.lopez@empresa.com',
    department: 'Marketing',
    salary: 55000,
    hire_date: '2021-11-20',
    active: true,
    performance: 4.2,
  },
  {
    id: 3,
    name: 'María Rodríguez',
    email: 'maria.rodriguez@empresa.com',
    department: 'Recursos Humanos',
    salary: 58000,
    hire_date: '2023-03-10',
    active: false,
    performance: 3.9,
  },
  {
    id: 4,
    name: 'Juan Martínez',
    email: 'juan.martinez@empresa.com',
    department: 'Desarrollo',
    salary: 70000,
    hire_date: '2020-08-05',
    active: true,
    performance: 4.6,
  },
  {
    id: 5,
    name: 'Laura Sánchez',
    email: 'laura.sanchez@empresa.com',
    department: 'Ventas',
    salary: 52000,
    hire_date: '2022-06-18',
    active: true,
    performance: 4.3,
  },
];

export const TableStylesDemo: React.FC = () => {
  const [customization, setCustomization] = useState<TableCustomization>(DEFAULT_TABLE_CUSTOMIZATION);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'name', 'email', 'department', 'salary', 'active'
  ]);

  const handleColumnResize = (columnKey: string, width: number) => {
    console.log(`Column ${columnKey} resized to ${width}px`);
  };

  const handleColumnReorder = (fromIndex: number, toIndex: number) => {
    console.log(`Column moved from ${fromIndex} to ${toIndex}`);
    const newSelectedColumns = [...selectedColumns];
    const [removed] = newSelectedColumns.splice(fromIndex, 1);
    newSelectedColumns.splice(toIndex, 0, removed);
    setSelectedColumns(newSelectedColumns);
  };

  const handleColumnToggle = (columnKey: string, visible: boolean) => {
    if (visible && !selectedColumns.includes(columnKey)) {
      setSelectedColumns([...selectedColumns, columnKey]);
    } else if (!visible) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Demo de Estilos de Tabla
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Demonstración completa del sistema de personalización de tablas con todas las funcionalidades:
            tipografía, colores, bordes, alineación, gestión de columnas y más.
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Personalización Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Tipografía y fuentes
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Esquemas de colores
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Bordes y espaciado
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Efectos visuales
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Gestión de Columnas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Redimensionar columnas
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Reordenar arrastrando
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Fijar columnas
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Mostrar/ocultar
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-500" />
                Opciones Avanzadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Presets profesionales
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Temas claro/oscuro
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Exportar/importar config
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  Configuraciones guardadas
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Panel de Control
              <TableStylesControl
                columns={DEMO_COLUMNS}
                selectedColumns={selectedColumns}
                onCustomizationChange={setCustomization}
                onColumnResize={handleColumnResize}
                onColumnReorder={handleColumnReorder}
                onColumnToggle={handleColumnToggle}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Usa el botón "Estilos Tabla" arriba para personalizar completamente la apariencia de la tabla.
              Prueba los diferentes presets, ajusta los colores, modifica el espaciado y gestiona las columnas.
            </p>
          </CardContent>
        </Card>

        {/* Demo Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Ejemplo</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Columnas visibles: {selectedColumns.length}</span>
              <Badge variant="secondary" className="text-xs">
                {customization.name}
              </Badge>
              {customization.theme !== 'light' && (
                <Badge variant="outline" className="text-xs">
                  {customization.theme}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div style={generateTableStyles(customization)}>
              <CustomizableTable
                data={DEMO_DATA}
                columns={DEMO_COLUMNS}
                selectedColumns={selectedColumns}
                customization={customization}
                onRowClick={(row, index) => {
                  console.log('Row clicked:', row.name, index);
                }}
                onCellClick={(value, column, row) => {
                  console.log('Cell clicked:', column.label, value);
                }}
                className="demo-table"
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuración Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">Fuente</div>
                <div>{customization.cellFont.family}</div>
                <div className="text-xs text-muted-foreground">
                  {customization.cellFont.size}px, {customization.cellFont.weight}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Tema</div>
                <div className="capitalize">{customization.theme}</div>
                <div className="text-xs text-muted-foreground">
                  {customization.showStriping ? 'Con rayas' : 'Sin rayas'}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Efectos</div>
                <div className="flex gap-1">
                  {customization.showHoverEffects && <Badge variant="outline" className="text-xs">Hover</Badge>}
                  {customization.showShadows && <Badge variant="outline" className="text-xs">Sombras</Badge>}
                  {customization.stickyHeader && <Badge variant="outline" className="text-xs">Header Fijo</Badge>}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Bordes</div>
                <div>{customization.borderSettings.style}</div>
                <div className="text-xs text-muted-foreground">
                  {customization.borderSettings.width}px, radio {customization.borderSettings.radius}px
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cómo usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">🎨 Personalización Rápida</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Usa la pestaña "Rápido" para presets instantáneos</li>
                  <li>• Activa/desactiva efectos con los switches</li>
                  <li>• Aplica estilos predefinidos de un clic</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">📊 Gestión de Columnas</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Pestaña "Columnas" para redimensionar</li>
                  <li>• Usa los sliders para ajustar anchos</li>
                  <li>• Fija columnas importantes a izq/derecha</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Diseño Avanzado</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Pestaña "Diseño" para opciones avanzadas</li>
                  <li>• Auto-ajuste inteligente de columnas</li>
                  <li>• Organización automática por tipo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">💾 Configuración</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Exporta/importa configuraciones</li>
                  <li>• Guarda tus estilos favoritos</li>
                  <li>• Acceso a configuración completa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
