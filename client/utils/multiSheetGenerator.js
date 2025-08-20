import { generateSampleData } from "./sampleDataGenerator.js";

export const generateMultiSheetData = () => {
  // Generate basic sample data first
  const baseData = generateSampleData();

  // Create additional sheets with different data types
  const employeesSheet = baseData;

  // Sales data sheet
  const salesData = {
    columns: [
      { key: "id", label: "Venta ID", type: "number" },
      { key: "fecha", label: "Fecha", type: "date" },
      { key: "producto", label: "Producto", type: "text" },
      { key: "cantidad", label: "Cantidad", type: "number" },
      { key: "precio_unitario", label: "Precio Unitario", type: "number" },
      { key: "total", label: "Total", type: "number" },
      { key: "vendedor", label: "Vendedor", type: "text" },
      { key: "cliente", label: "Cliente", type: "text" },
      { key: "estado", label: "Estado", type: "text" },
    ],
    rows: Array.from({ length: 300 }, (_, i) => ({
      id: i + 1,
      fecha: new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      ).toLocaleDateString("es-ES"),
      producto: ["Laptop", "Mouse", "Teclado", "Monitor", "Auriculares"][
        Math.floor(Math.random() * 5)
      ],
      cantidad: Math.floor(Math.random() * 10) + 1,
      precio_unitario: Math.floor(Math.random() * 1000) + 100,
      total: 0, // Calculated below
      vendedor: ["Ana García", "Carlos López", "María Rodríguez"][
        Math.floor(Math.random() * 3)
      ],
      cliente: `Cliente ${Math.floor(Math.random() * 100) + 1}`,
      estado: ["Completado", "Pendiente", "Cancelado"][
        Math.floor(Math.random() * 3)
      ],
    })),
  };

  // Calculate totals
  salesData.rows.forEach((row) => {
    row.total = row.cantidad * row.precio_unitario;
  });

  // Projects data sheet
  const projectsData = {
    columns: [
      { key: "proyecto_id", label: "Proyecto ID", type: "number" },
      { key: "nombre_proyecto", label: "Nombre Proyecto", type: "text" },
      { key: "estado_proyecto", label: "Estado", type: "text" },
      { key: "fecha_inicio", label: "Fecha Inicio", type: "date" },
      { key: "fecha_fin", label: "Fecha Fin", type: "date" },
      { key: "presupuesto", label: "Presupuesto", type: "number" },
      { key: "manager", label: "Manager", type: "text" },
    ],
    rows: Array.from({ length: 50 }, (_, i) => ({
      proyecto_id: i + 1,
      nombre_proyecto: `Proyecto ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
      estado_proyecto: ["Activo", "Completado", "En Pausa", "Cancelado"][
        Math.floor(Math.random() * 4)
      ],
      fecha_inicio: new Date(
        2024,
        Math.floor(Math.random() * 6),
        Math.floor(Math.random() * 28) + 1,
      ).toLocaleDateString("es-ES"),
      fecha_fin: new Date(
        2024,
        Math.floor(Math.random() * 6) + 6,
        Math.floor(Math.random() * 28) + 1,
      ).toLocaleDateString("es-ES"),
      presupuesto: Math.floor(Math.random() * 500000) + 50000,
      manager: [
        "Ana García",
        "Carlos López",
        "María Rodríguez",
        "Juan Martínez",
      ][Math.floor(Math.random() * 4)],
    })),
  };

  // Create the multi-sheet structure
  return {
    columns: employeesSheet.columns,
    rows: employeesSheet.rows,
    sheetNames: ["Empleados", "Ventas", "Proyectos", "Dashboard"],
    activeSheet: "Empleados",
    sheetsData: {
      Empleados: {
        columns: employeesSheet.columns,
        rows: employeesSheet.rows,
      },
      Ventas: salesData,
      Proyectos: projectsData,
      Dashboard: {
        columns: [
          { key: "metric", label: "Métrica", type: "text" },
          { key: "value", label: "Valor", type: "number" },
          { key: "trend", label: "Tendencia", type: "text" },
        ],
        rows: [
          {
            metric: "Total Empleados",
            value: employeesSheet.rows.length,
            trend: "↗️ +5%",
          },
          {
            metric: "Ventas Este Mes",
            value: salesData.rows.reduce((sum, row) => sum + row.total, 0),
            trend: "↗️ +12%",
          },
          {
            metric: "Proyectos Activos",
            value: projectsData.rows.filter(
              (p) => p.estado_proyecto === "Activo",
            ).length,
            trend: "→ 0%",
          },
          {
            metric: "Ingresos Promedio",
            value: Math.floor(
              salesData.rows.reduce((sum, row) => sum + row.total, 0) /
                salesData.rows.length,
            ),
            trend: "↗️ +8%",
          },
        ],
      },
    },
  };
};
