import { ExcelData, ExcelColumn } from '@shared/excel-types';
import { generateSampleData } from './sampleDataGenerator';

// Generate different types of sheets for comprehensive demo
export const generateMultiSheetData = (): ExcelData => {
  const employeeData = generateSampleData();
  
  // Sales Data Sheet
  const salesColumns: ExcelColumn[] = [
    { key: 'id', label: 'ID Venta', type: 'number' },
    { key: 'fecha_venta', label: 'Fecha de Venta', type: 'date' },
    { key: 'empleado_id', label: 'ID Empleado', type: 'number' },
    { key: 'cliente', label: 'Cliente', type: 'text' },
    { key: 'producto', label: 'Producto', type: 'text' },
    { key: 'categoria_producto', label: 'Categoría Producto', type: 'text' },
    { key: 'cantidad', label: 'Cantidad', type: 'number' },
    { key: 'precio_unitario', label: 'Precio Unitario (€)', type: 'number' },
    { key: 'total_venta', label: 'Total Venta (€)', type: 'number' },
    { key: 'descuento', label: 'Descuento (%)', type: 'number' },
    { key: 'comision_venta', label: 'Comisión Venta (€)', type: 'number' },
    { key: 'region_venta', label: 'Región de Venta', type: 'text' },
    { key: 'canal', label: 'Canal', type: 'text' },
    { key: 'estado_venta', label: 'Estado de Venta', type: 'text' },
    { key: 'fecha_entrega', label: 'Fecha de Entrega', type: 'date' },
    { key: 'metodo_pago', label: 'Método de Pago', type: 'text' },
    { key: 'satisfaccion', label: 'Satisfacción Cliente (1-5)', type: 'number' },
    { key: 'referido', label: 'Es Referido', type: 'boolean' },
    { key: 'campaña', label: 'Campaña de Marketing', type: 'text' },
    { key: 'notas_venta', label: 'Notas de Venta', type: 'text' }
  ];

  // Projects Data Sheet
  const projectColumns: ExcelColumn[] = [
    { key: 'id', label: 'ID Proyecto', type: 'number' },
    { key: 'nombre_proyecto', label: 'Nombre del Proyecto', type: 'text' },
    { key: 'descripcion', label: 'Descripción', type: 'text' },
    { key: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
    { key: 'fecha_fin_estimada', label: 'Fecha Fin Estimada', type: 'date' },
    { key: 'fecha_fin_real', label: 'Fecha Fin Real', type: 'date' },
    { key: 'estado_proyecto', label: 'Estado del Proyecto', type: 'text' },
    { key: 'prioridad_proyecto', label: 'Prioridad', type: 'text' },
    { key: 'presupuesto', label: 'Presupuesto (€)', type: 'number' },
    { key: 'coste_real', label: 'Coste Real (€)', type: 'number' },
    { key: 'progreso', label: 'Progreso (%)', type: 'number' },
    { key: 'manager_proyecto', label: 'Manager del Proyecto', type: 'text' },
    { key: 'equipo_tamaño', label: 'Tamaño del Equipo', type: 'number' },
    { key: 'cliente_proyecto', label: 'Cliente', type: 'text' },
    { key: 'tecnologia_principal', label: 'Tecnología Principal', type: 'text' },
    { key: 'riesgo_nivel', label: 'Nivel de Riesgo', type: 'text' },
    { key: 'horas_estimadas', label: 'Horas Estimadas', type: 'number' },
    { key: 'horas_reales', label: 'Horas Reales', type: 'number' },
    { key: 'roi_estimado', label: 'ROI Estimado (%)', type: 'number' },
    { key: 'comentarios', label: 'Comentarios', type: 'text' }
  ];

  // Financial Data Sheet
  const financialColumns: ExcelColumn[] = [
    { key: 'id', label: 'ID Transacción', type: 'number' },
    { key: 'fecha_transaccion', label: 'Fecha de Transacción', type: 'date' },
    { key: 'tipo_transaccion', label: 'Tipo de Transacción', type: 'text' },
    { key: 'categoria_gasto', label: 'Categoría de Gasto', type: 'text' },
    { key: 'descripcion_gasto', label: 'Descripción', type: 'text' },
    { key: 'importe', label: 'Importe (€)', type: 'number' },
    { key: 'divisa', label: 'Divisa', type: 'text' },
    { key: 'departamento_gasto', label: 'Departamento', type: 'text' },
    { key: 'centro_coste', label: 'Centro de Coste', type: 'text' },
    { key: 'proveedor', label: 'Proveedor', type: 'text' },
    { key: 'numero_factura', label: 'Número de Factura', type: 'text' },
    { key: 'fecha_vencimiento', label: 'Fecha de Vencimiento', type: 'date' },
    { key: 'estado_pago', label: 'Estado de Pago', type: 'text' },
    { key: 'metodo_pago_fin', label: 'Método de Pago', type: 'text' },
    { key: 'aprobado_por', label: 'Aprobado Por', type: 'text' },
    { key: 'iva', label: 'IVA (%)', type: 'number' },
    { key: 'importe_neto', label: 'Importe Neto (€)', type: 'number' },
    { key: 'es_recurrente', label: 'Es Recurrente', type: 'boolean' },
    { key: 'proyecto_asociado', label: 'Proyecto Asociado', type: 'text' },
    { key: 'observaciones', label: 'Observaciones', type: 'text' }
  ];

  const generateRandomSalesData = (count: number) => {
    return Array.from({ length: count }, (_, index) => {
      const empleadoId = Math.floor(Math.random() * 500) + 1;
      const cantidad = Math.floor(Math.random() * 10) + 1;
      const precioUnitario = Math.floor(Math.random() * 500) + 50;
      const totalVenta = cantidad * precioUnitario;
      const descuento = Math.random() * 20;
      const totalConDescuento = totalVenta * (1 - descuento/100);
      
      return {
        _id: index,
        id: index + 1,
        fecha_venta: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('es-ES'),
        empleado_id: empleadoId,
        cliente: `Cliente ${Math.floor(Math.random() * 200) + 1}`,
        producto: ['Laptop Pro', 'Smartphone Elite', 'Tablet Max', 'Monitor 4K', 'Auriculares Premium'][Math.floor(Math.random() * 5)],
        categoria_producto: ['Electrónicos', 'Informática', 'Accesorios'][Math.floor(Math.random() * 3)],
        cantidad: cantidad,
        precio_unitario: precioUnitario,
        total_venta: totalConDescuento,
        descuento: Math.round(descuento * 10) / 10,
        comision_venta: totalConDescuento * 0.05,
        region_venta: ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'][Math.floor(Math.random() * 5)],
        canal: ['Online', 'Tienda', 'Teléfono', 'Partner'][Math.floor(Math.random() * 4)],
        estado_venta: ['Completada', 'Pendiente', 'Cancelada'][Math.floor(Math.random() * 3)],
        fecha_entrega: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('es-ES'),
        metodo_pago: ['Tarjeta', 'Transferencia', 'PayPal', 'Efectivo'][Math.floor(Math.random() * 4)],
        satisfaccion: Math.floor(Math.random() * 5) + 1,
        referido: Math.random() > 0.7,
        campaña: ['Black Friday', 'Navidad', 'Verano', 'Sin campaña'][Math.floor(Math.random() * 4)],
        notas_venta: `Venta procesada correctamente ${Math.random() > 0.5 ? 'con seguimiento especial' : ''}`
      };
    });
  };

  const generateRandomProjectData = (count: number) => {
    return Array.from({ length: count }, (_, index) => {
      const fechaInicio = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const fechaFinEstimada = new Date(fechaInicio.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
      const presupuesto = Math.floor(Math.random() * 500000) + 10000;
      const progreso = Math.floor(Math.random() * 100);
      
      return {
        _id: index,
        id: index + 1,
        nombre_proyecto: `Proyecto ${['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'][Math.floor(Math.random() * 5)]} ${index + 1}`,
        descripcion: `Desarrollo de ${['aplicación web', 'sistema móvil', 'plataforma de datos', 'infraestructura cloud', 'dashboard analítico'][Math.floor(Math.random() * 5)]}`,
        fecha_inicio: fechaInicio.toLocaleDateString('es-ES'),
        fecha_fin_estimada: fechaFinEstimada.toLocaleDateString('es-ES'),
        fecha_fin_real: progreso === 100 ? fechaFinEstimada.toLocaleDateString('es-ES') : '',
        estado_proyecto: ['En Progreso', 'Completado', 'En Pausa', 'Cancelado'][Math.floor(Math.random() * 4)],
        prioridad_proyecto: ['Alta', 'Media', 'Baja', 'Crítica'][Math.floor(Math.random() * 4)],
        presupuesto: presupuesto,
        coste_real: presupuesto * (0.8 + Math.random() * 0.4),
        progreso: progreso,
        manager_proyecto: `Manager ${Math.floor(Math.random() * 20) + 1}`,
        equipo_tamaño: Math.floor(Math.random() * 15) + 3,
        cliente_proyecto: `Cliente Corp ${Math.floor(Math.random() * 50) + 1}`,
        tecnologia_principal: ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java'][Math.floor(Math.random() * 6)],
        riesgo_nivel: ['Bajo', 'Medio', 'Alto'][Math.floor(Math.random() * 3)],
        horas_estimadas: Math.floor(Math.random() * 2000) + 100,
        horas_reales: Math.floor(Math.random() * 2000) + 100,
        roi_estimado: Math.floor(Math.random() * 200) + 50,
        comentarios: `Proyecto en ${progreso > 50 ? 'buen estado' : 'fase inicial'} con ${['excelente', 'buena', 'regular'][Math.floor(Math.random() * 3)]} comunicación del cliente`
      };
    });
  };

  const generateRandomFinancialData = (count: number) => {
    return Array.from({ length: count }, (_, index) => {
      const importe = Math.floor(Math.random() * 50000) + 100;
      const iva = [0, 10, 21][Math.floor(Math.random() * 3)];
      const importeNeto = importe / (1 + iva/100);
      
      return {
        _id: index,
        id: index + 1,
        fecha_transaccion: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('es-ES'),
        tipo_transaccion: ['Gasto', 'Ingreso', 'Inversión'][Math.floor(Math.random() * 3)],
        categoria_gasto: ['Software', 'Hardware', 'Marketing', 'Oficina', 'Viajes', 'Formación'][Math.floor(Math.random() * 6)],
        descripcion_gasto: `Transacción de ${['compra de equipos', 'suscripción software', 'campaña publicitaria', 'material oficina'][Math.floor(Math.random() * 4)]}`,
        importe: importe,
        divisa: 'EUR',
        departamento_gasto: ['IT', 'Marketing', 'Ventas', 'RRHH', 'Finanzas'][Math.floor(Math.random() * 5)],
        centro_coste: `CC-${Math.floor(Math.random() * 100) + 1}`,
        proveedor: `Proveedor ${Math.floor(Math.random() * 30) + 1} S.L.`,
        numero_factura: `FAC-2024-${String(index + 1).padStart(6, '0')}`,
        fecha_vencimiento: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
        estado_pago: ['Pagado', 'Pendiente', 'Vencido'][Math.floor(Math.random() * 3)],
        metodo_pago_fin: ['Transferencia', 'Tarjeta', 'Cheque', 'Efectivo'][Math.floor(Math.random() * 4)],
        aprobado_por: `Aprobador ${Math.floor(Math.random() * 10) + 1}`,
        iva: iva,
        importe_neto: Math.round(importeNeto * 100) / 100,
        es_recurrente: Math.random() > 0.7,
        proyecto_asociado: Math.random() > 0.5 ? `Proyecto ${Math.floor(Math.random() * 50) + 1}` : '',
        observaciones: Math.random() > 0.7 ? 'Requiere seguimiento especial' : 'Transacción estándar'
      };
    });
  };

  // Combine all data into multi-sheet structure
  const multiSheetData: ExcelData = {
    columns: employeeData.columns, // Default to employee data columns
    rows: employeeData.rows, // Default to employee data rows
    sheetNames: ['Empleados', 'Ventas', 'Proyectos', 'Finanzas'],
    activeSheet: 'Empleados'
  };

  // Add additional sheets data (we'll need to modify the interface to support this)
  (multiSheetData as any).sheetsData = {
    'Empleados': {
      columns: employeeData.columns,
      rows: employeeData.rows
    },
    'Ventas': {
      columns: salesColumns,
      rows: generateRandomSalesData(300)
    },
    'Proyectos': {
      columns: projectColumns,
      rows: generateRandomProjectData(150)
    },
    'Finanzas': {
      columns: financialColumns,
      rows: generateRandomFinancialData(400)
    }
  };

  return multiSheetData;
};
