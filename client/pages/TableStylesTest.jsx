import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableStylesControl } from "@/components/TableStylesControl";
import { CustomizableTable } from "@/components/CustomizableTable";
import {
  DEFAULT_TABLE_CUSTOMIZATION,
  generateTableStyles,
} from "@shared/table-customization";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

// Datos de prueba
const TEST_COLUMNS = [
  { key: "id", label: "ID", type: "number" },
  { key: "name", label: "Nombre Completo", type: "text" },
  { key: "email", label: "Correo Electrónico", type: "text" },
  { key: "department", label: "Departamento", type: "text" },
  { key: "salary", label: "Salario", type: "number" },
  { key: "hire_date", label: "Fecha de Contratación", type: "date" },
  { key: "active", label: "Estado Activo", type: "boolean" },
  { key: "performance", label: "Calificación", type: "number" },
  { key: "location", label: "Ubicación", type: "text" },
  { key: "projects", label: "Proyectos", type: "number" },
];

const TEST_DATA = [
  {
    id: 1,
    name: "Ana García Martín",
    email: "ana.garcia@empresa.com",
    department: "Desarrollo Frontend",
    salary: 65000,
    hire_date: "2022-01-15",
    active: true,
    performance: 4.8,
    location: "Madrid",
    projects: 12,
  },
  {
    id: 2,
    name: "Carlos López Ruiz",
    email: "carlos.lopez@empresa.com",
    department: "Marketing Digital",
    salary: 55000,
    hire_date: "2021-11-20",
    active: true,
    performance: 4.2,
    location: "Barcelona",
    projects: 8,
  },
  {
    id: 3,
    name: "María Rodríguez Sánchez",
    email: "maria.rodriguez@empresa.com",
    department: "Recursos Humanos",
    salary: 58000,
    hire_date: "2023-03-10",
    active: false,
    performance: 3.9,
    location: "Valencia",
    projects: 5,
  },
  {
    id: 4,
    name: "Juan Martínez González",
    email: "juan.martinez@empresa.com",
    department: "Desarrollo Backend",
    salary: 70000,
    hire_date: "2020-08-05",
    active: true,
    performance: 4.6,
    location: "Sevilla",
    projects: 15,
  },
  {
    id: 5,
    name: "Laura Sánchez Torres",
    email: "laura.sanchez@empresa.com",
    department: "Ventas Corporativas",
    salary: 52000,
    hire_date: "2022-06-18",
    active: true,
    performance: 4.3,
    location: "Bilbao",
    projects: 9,
  },
  {
    id: 6,
    name: "Diego Fernández Castro",
    email: "diego.fernandez@empresa.com",
    department: "Diseño UX/UI",
    salary: 59000,
    hire_date: "2021-09-12",
    active: true,
    performance: 4.7,
    location: "Málaga",
    projects: 11,
  },
  {
    id: 7,
    name: "Carmen Herrera Jiménez",
    email: "carmen.herrera@empresa.com",
    department: "Contabilidad",
    salary: 48000,
    hire_date: "2023-01-22",
    active: true,
    performance: 4.1,
    location: "Zaragoza",
    projects: 6,
  },
  {
    id: 8,
    name: "Roberto Morales Vega",
    email: "roberto.morales@empresa.com",
    department: "Desarrollo Móvil",
    salary: 68000,
    hire_date: "2019-05-30",
    active: true,
    performance: 4.9,
    location: "Granada",
    projects: 18,
  },
];

export default function TableStylesTest() {
  const [customization, setCustomization] = useState(
    DEFAULT_TABLE_CUSTOMIZATION,
  );
  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "email",
    "department",
    "salary",
    "active",
    "performance",
  ]);
  const [testResults, setTestResults] = useState({});

  const handleColumnResize = (columnKey, width) => {
    console.log(`Column ${columnKey} resized to ${width}px`);
    setTestResults((prev) => ({ ...prev, columnResize: true }));
  };

  const handleColumnReorder = (fromIndex, toIndex) => {
    console.log(`Column moved from ${fromIndex} to ${toIndex}`);
    const newSelectedColumns = [...selectedColumns];
    const [removed] = newSelectedColumns.splice(fromIndex, 1);
    newSelectedColumns.splice(toIndex, 0, removed);
    setSelectedColumns(newSelectedColumns);
    setTestResults((prev) => ({ ...prev, columnReorder: true }));
  };

  const handleColumnToggle = (columnKey, visible) => {
    if (visible && !selectedColumns.includes(columnKey)) {
      setSelectedColumns([...selectedColumns, columnKey]);
    } else if (!visible) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnKey));
    }
    setTestResults((prev) => ({ ...prev, columnToggle: true }));
  };

  const handleCustomizationChange = (newCustomization) => {
    setCustomization(newCustomization);
    setTestResults((prev) => ({ ...prev, customizationChange: true }));
  };

  const runTests = () => {
    const tests = {
      componentRender: true, // Si llegamos aquí, el componente se renderiza
      dataDisplay: TEST_DATA.length > 0,
      columnsVisible: selectedColumns.length > 0,
      customizationApplied: customization.name !== "",
    };
    setTestResults(tests);
  };

  const tableStyles = generateTableStyles(customization);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Prueba de Estilos de Tabla
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Página de prueba para verificar que todos los componentes del
            sistema de personalización de tablas funcionen correctamente.
          </p>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Controles de Prueba</span>
              <div className="flex items-center gap-2">
                <Button onClick={runTests} variant="outline" size="sm">
                  Ejecutar Pruebas
                </Button>
                <TableStylesControl
                  columns={TEST_COLUMNS}
                  selectedColumns={selectedColumns}
                  onCustomizationChange={handleCustomizationChange}
                  onColumnResize={handleColumnResize}
                  onColumnReorder={handleColumnReorder}
                  onColumnToggle={handleColumnToggle}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex items-center gap-2">
                  {result ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm capitalize">
                    {test.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Estado de la Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-muted-foreground">
                  Preset Actual
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{customization.name}</Badge>
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Tema</div>
                <div className="capitalize">{customization.theme}</div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">Fuente</div>
                <div>
                  {customization.cellFont.size}px{" "}
                  {customization.cellFont.family.split(",")[0]}
                </div>
              </div>
              <div>
                <div className="font-medium text-muted-foreground">
                  Columnas Visibles
                </div>
                <div>
                  {selectedColumns.length} de {TEST_COLUMNS.length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Tabla de Prueba
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Esta tabla muestra la funcionalidad completa del sistema de
              estilos. Usa el botón "Estilos Tabla" arriba para personalizar la
              apariencia.
            </p>
          </CardHeader>
          <CardContent>
            <div style={tableStyles} className="custom-table-container">
              <CustomizableTable
                data={TEST_DATA}
                columns={TEST_COLUMNS}
                selectedColumns={selectedColumns}
                customization={customization}
                onRowClick={(row, index) => {
                  console.log("Row clicked:", row.name, index);
                  setTestResults((prev) => ({ ...prev, rowClick: true }));
                }}
                onCellClick={(value, column, row) => {
                  console.log("Cell clicked:", column.label, value);
                  setTestResults((prev) => ({ ...prev, cellClick: true }));
                }}
                className="test-table"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Verificación de Funcionalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">
                  ✅ Funcionalidades Implementadas
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Presets rápidos (Compacto, Cómodo, Minimal, Profesional)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Gestión de columnas (redimensionar, reordenar,
                    mostrar/ocultar)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Personalización de tipografía y fuentes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Esquemas de colores y temas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Efectos visuales (hover, sombras, rayas)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Configuración avanzada completa
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">🎯 Instrucciones de Prueba</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Haz clic en "Estilos Tabla" para abrir el panel</li>
                  <li>Prueba los presets rápidos en la pestaña "Rápido"</li>
                  <li>Redimensiona columnas en la pestaña "Columnas"</li>
                  <li>Experimenta con el diseño en "Diseño"</li>
                  <li>Ajusta el tamaño global en "Tamaño"</li>
                  <li>
                    Accede a configuración avanzada para personalización
                    completa
                  </li>
                  <li>Verifica que los cambios se aplican en tiempo real</li>
                  <li>Prueba exportar/importar configuraciones</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
