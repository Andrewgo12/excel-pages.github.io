import { ExcelData, ExcelColumn } from '@shared/excel-types';

// Sample data for different fields
const FIRST_NAMES = ['Ana', 'Carlos', 'María', 'José', 'Lucía', 'Miguel', 'Carmen', 'Antonio', 'Isabel', 'Francisco', 'Laura', 'Manuel', 'Pilar', 'Rafael', 'Elena', 'David', 'Rosa', 'Pablo', 'Dolores', 'Javier', 'Concepción', 'Daniel', 'Teresa', 'Jesús', 'Sara', 'Alejandro', 'Cristina', 'Fernando', 'Beatriz', 'Alberto', 'Mercedes', 'Roberto', 'Patricia', 'Andrés', 'Raquel', 'Gonzalo', 'Mónica', 'Adrián', 'Silvia', 'Rubén', 'Natalia', 'Sergio', 'Claudia', 'Ignacio', 'Verónica', 'Álvaro', 'Sandra', 'Óscar', 'Alicia', 'Iván'];

const LAST_NAMES = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Serrano', 'Blanco', 'Suárez', 'Castro', 'Ortega', 'Delgado', 'Ortiz', 'Morales', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Vargas', 'Reyes', 'Cruz', 'Herrera', 'Espinoza', 'Lara', 'Peña', 'Flores', 'Rivera', 'Aguilar', 'Mendoza', 'Campos'];

const CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'Coruña', 'Granada', 'Elche', 'Oviedo', 'Santa Cruz', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez', 'Sabadell', 'Móstoles', 'Alcalá de Henares', 'Pamplona', 'Fuenlabrada', 'Almería', 'Leganés', 'Santander', 'Burgos', 'Castellón', 'Alcorcón', 'Albacete', 'Getafe', 'Salamanca'];

const DEPARTMENTS = ['Ventas', 'Marketing', 'IT', 'Recursos Humanos', 'Finanzas', 'Operaciones', 'Legal', 'Investigación', 'Calidad', 'Logística', 'Atención al Cliente', 'Producto', 'Ingeniería', 'Diseño', 'Compras', 'Comunicación', 'Estrategia', 'Análisis', 'Seguridad', 'Administración'];

const PRODUCTS = ['Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Teclado', 'Mouse', 'Auriculares', 'Webcam', 'Impresora', 'Disco Duro', 'Router', 'Switch', 'Cable HDMI', 'Adaptador', 'Cargador', 'Proyector', 'Altavoces', 'Micrófono', 'Cámara', 'Servidor', 'NAS', 'UPS', 'Rack', 'Firewall', 'Access Point', 'Scanner', 'Plotter', 'Workstation', 'Smartphone Pro', 'Tablet Pro'];

const STATUSES = ['Activo', 'Inactivo', 'Pendiente', 'Completado', 'En Progreso', 'Cancelado', 'Suspendido', 'Aprobado', 'Rechazado', 'En Revisión', 'Escalado', 'Cerrado', 'Reabierto', 'Bloqueado'];

const PRIORITIES = ['Baja', 'Media', 'Alta', 'Crítica', 'Urgente', 'Muy Baja', 'Muy Alta'];

const CATEGORIES = ['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Comercio', 'Manufactura', 'Servicios', 'Agricultura', 'Construcción', 'Transporte', 'Energía', 'Telecomunicaciones', 'Alimentación', 'Textil', 'Química', 'Farmacéutica', 'Automotriz', 'Aeroespacial', 'Marítimo', 'Inmobiliario'];

const REGIONS = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro', 'Noreste', 'Noroeste', 'Sureste', 'Suroeste', 'Mediterráneo', 'Atlántico', 'Cantábrico', 'Levante', 'Andalucía Oriental', 'Andalucía Occidental'];

const COUNTRIES = ['España', 'Francia', 'Italia', 'Alemania', 'Portugal', 'Reino Unido', 'Países Bajos', 'Bélgica', 'Suiza', 'Austria', 'Polonia', 'República Checa', 'Hungría', 'Rumania', 'Bulgaria', 'Grecia', 'Croacia', 'Eslovenia', 'Eslovaquia', 'Estonia', 'Letonia', 'Lituania', 'Finlandia', 'Suecia', 'Dinamarca', 'Noruega', 'Irlanda', 'Luxemburgo', 'Malta', 'Chipre'];

const SKILLS = ['JavaScript', 'Python', 'Java', 'C#', 'React', 'Vue.js', 'Angular', 'Node.js', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'Project Management', 'Data Analysis', 'Machine Learning', 'UI/UX Design', 'SEO', 'Digital Marketing'];

const CERTIFICATIONS = ['PMP', 'AWS Certified', 'Microsoft Certified', 'Google Cloud', 'Scrum Master', 'ITIL', 'Six Sigma', 'ISO 9001', 'CISSP', 'CISA', 'CompTIA', 'Oracle Certified', 'Salesforce Certified', 'HubSpot Certified', 'Google Analytics'];

const INDUSTRIES = ['Retail', 'Banca', 'Seguros', 'Consultoría', 'Hospitality', 'E-commerce', 'SaaS', 'Gaming', 'Medios', 'Publicidad', 'Non-profit', 'Gobierno', 'Startup', 'Enterprise', 'SMB'];

const PROJECTS = ['CRM Implementation', 'ERP Migration', 'Website Redesign', 'Mobile App', 'Data Migration', 'Cloud Migration', 'API Development', 'Database Optimization', 'Security Audit', 'Performance Tuning', 'Integration Project', 'Automation', 'Analytics Dashboard', 'Machine Learning Model', 'DevOps Pipeline'];

const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Árabe', 'Ruso', 'Hindi', 'Holandés', 'Sueco', 'Noruego', 'Danés', 'Finlandés', 'Polaco', 'Checo', 'Húngaro', 'Griego'];

const EDUCATION_LEVELS = ['Bachillerato', 'FP Medio', 'FP Superior', 'Grado Universitario', 'Máster', 'MBA', 'Doctorado', 'Postgrado', 'Certificación Profesional', 'Bootcamp'];

const OFFICE_LOCATIONS = ['Sede Central', 'Oficina Norte', 'Oficina Sur', 'Sucursal Este', 'Sucursal Oeste', 'Centro Comercial', 'Coworking Space', 'Home Office', 'Oficina Satélite', 'Campus Universitario'];

const CONTRACT_TYPES = ['Indefinido', 'Temporal', 'Freelance', 'Prácticas', 'Becario', 'Consultor', 'Part-time', 'Full-time', 'Por Proyecto', 'Estacional'];

const PERFORMANCE_RATINGS = ['Excepcional', 'Supera Expectativas', 'Cumple Expectativas', 'Necesita Mejora', 'Insatisfactorio'];

const CLIENT_TYPES = ['Empresa', 'Particular', 'Gobierno', 'ONG', 'Startup', 'PYME', 'Multinacional', 'Universidad', 'Hospital', 'Retail'];

const SALES_CHANNELS = ['Online', 'Tienda Física', 'Teléfono', 'Email', 'Partner', 'Distribuidor', 'Marketplace', 'Redes Sociales', 'Publicidad', 'Referido'];

const COMMUNICATION_PREFERENCES = ['Email', 'Teléfono', 'WhatsApp', 'Slack', 'Teams', 'Presencial', 'Videoconferencia', 'Chat', 'SMS', 'Postal'];

// Helper functions
const randomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, decimals: number = 2): number => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const randomElement = <T>(array: T[]): T => 
  array[Math.floor(Math.random() * array.length)];

const randomDate = (start: Date, end: Date): Date => {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
};

const randomBoolean = (): boolean => Math.random() > 0.5;

const generateEmail = (firstName: string, lastName: string): string => 
  `${firstName.toLowerCase()}.${lastName.toLowerCase()}@empresa.com`;

const generatePhone = (): string => {
  const prefix = randomElement(['6', '7', '9']);
  const number = Array.from({ length: 8 }, () => randomInt(0, 9)).join('');
  return `${prefix}${number}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES');
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString('es-ES');
};

export const generateSampleData = (): ExcelData => {
  // Define all 80 columns with comprehensive business data types
  const columns: ExcelColumn[] = [
    // Personal Information
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'nombre', label: 'Nombre', type: 'text' },
    { key: 'apellido', label: 'Apellido', type: 'text' },
    { key: 'nombre_completo', label: 'Nombre Completo', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'telefono', label: 'Teléfono', type: 'text' },
    { key: 'edad', label: 'Edad', type: 'number' },
    { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento', type: 'date' },
    { key: 'genero', label: 'Género', type: 'text' },
    { key: 'nacionalidad', label: 'Nacionalidad', type: 'text' },

    // Employment Details
    { key: 'salario', label: 'Salario (€)', type: 'number' },
    { key: 'activo', label: 'Activo', type: 'boolean' },
    { key: 'departamento', label: 'Departamento', type: 'text' },
    { key: 'puesto', label: 'Puesto de Trabajo', type: 'text' },
    { key: 'nivel_jerarquico', label: 'Nivel Jerárquico', type: 'text' },
    { key: 'tipo_contrato', label: 'Tipo de Contrato', type: 'text' },
    { key: 'fecha_contratacion', label: 'Fecha de Contratación', type: 'date' },
    { key: 'fecha_fin_contrato', label: 'Fecha Fin Contrato', type: 'date' },
    { key: 'experiencia_años', label: 'Años de Experiencia', type: 'number' },
    { key: 'es_manager', label: 'Es Manager', type: 'boolean' },

    // Location & Office
    { key: 'ciudad', label: 'Ciudad', type: 'text' },
    { key: 'pais', label: 'País', type: 'text' },
    { key: 'codigo_postal', label: 'Código Postal', type: 'text' },
    { key: 'direccion_completa', label: 'Dirección Completa', type: 'text' },
    { key: 'oficina', label: 'Oficina', type: 'text' },
    { key: 'region', label: 'Región', type: 'text' },
    { key: 'zona_horaria', label: 'Zona Horaria', type: 'text' },

    // Performance & Evaluation
    { key: 'puntuacion', label: 'Puntuación (1-10)', type: 'number' },
    { key: 'rating_rendimiento', label: 'Rating de Rendimiento', type: 'text' },
    { key: 'satisfaccion_cliente', label: 'Satisfacción Cliente (%)', type: 'number' },
    { key: 'productividad_score', label: 'Score de Productividad', type: 'number' },
    { key: 'fecha_evaluacion', label: 'Fecha Última Evaluación', type: 'date' },
    { key: 'fecha_promocion', label: 'Fecha Última Promoción', type: 'date' },
    { key: 'incremento_salarial', label: 'Último Incremento Salarial (%)', type: 'number' },

    // Sales & Business Metrics
    { key: 'ventas_ultimo_mes', label: 'Ventas Último Mes (€)', type: 'number' },
    { key: 'ventas_trimestre', label: 'Ventas Trimestre (€)', type: 'number' },
    { key: 'ventas_año', label: 'Ventas Año (€)', type: 'number' },
    { key: 'comision', label: 'Comisión (%)', type: 'number' },
    { key: 'meta_anual', label: 'Meta Anual (€)', type: 'number' },
    { key: 'progreso_meta', label: 'Progreso Meta (%)', type: 'number' },
    { key: 'clientes_activos', label: 'Clientes Activos', type: 'number' },
    { key: 'nuevos_clientes', label: 'Nuevos Clientes/Mes', type: 'number' },
    { key: 'canal_ventas', label: 'Canal de Ventas Principal', type: 'text' },
    { key: 'tipo_cliente', label: 'Tipo de Cliente Principal', type: 'text' },

    // Skills & Education
    { key: 'nivel_educacion', label: 'Nivel de Educación', type: 'text' },
    { key: 'universidad', label: 'Universidad', type: 'text' },
    { key: 'carrera', label: 'Carrera/Especialización', type: 'text' },
    { key: 'idiomas', label: 'Número de Idiomas', type: 'number' },
    { key: 'idioma_principal', label: 'Idioma Principal', type: 'text' },
    { key: 'skill_principal', label: 'Skill Principal', type: 'text' },
    { key: 'certificaciones', label: 'Certificaciones', type: 'number' },
    { key: 'certificacion_principal', label: 'Certificación Principal', type: 'text' },
    { key: 'formacion_horas', label: 'Horas de Formación/Año', type: 'number' },

    // Work Patterns & Preferences
    { key: 'horas_trabajadas', label: 'Horas Trabajadas/Semana', type: 'number' },
    { key: 'modalidad_trabajo', label: 'Modalidad de Trabajo', type: 'text' },
    { key: 'flexibilidad_horaria', label: 'Flexibilidad Horaria', type: 'boolean' },
    { key: 'viajes_trabajo', label: 'Viajes de Trabajo/Año', type: 'number' },
    { key: 'preferencia_comunicacion', label: 'Preferencia de Comunicación', type: 'text' },
    { key: 'vacaciones_dias', label: 'Días de Vacaciones', type: 'number' },
    { key: 'dias_enfermedad', label: 'Días de Enfermedad/Año', type: 'number' },

    // Projects & Activities
    { key: 'proyectos_activos', label: 'Proyectos Activos', type: 'number' },
    { key: 'proyecto_principal', label: 'Proyecto Principal', type: 'text' },
    { key: 'industria_principal', label: 'Industria Principal', type: 'text' },
    { key: 'fecha_ultima_actividad', label: 'Última Actividad', type: 'date' },
    { key: 'reuniones_semana', label: 'Reuniones por Semana', type: 'number' },
    { key: 'emails_dia', label: 'Emails por Día', type: 'number' },

    // Personal Assets & Benefits
    { key: 'tiene_coche', label: 'Tiene Coche', type: 'boolean' },
    { key: 'seguro_medico', label: 'Seguro Médico', type: 'boolean' },
    { key: 'seguro_dental', label: 'Seguro Dental', type: 'boolean' },
    { key: 'plan_pension', label: 'Plan de Pensiones', type: 'boolean' },
    { key: 'stock_options', label: 'Stock Options', type: 'boolean' },
    { key: 'gimnasio', label: 'Acceso a Gimnasio', type: 'boolean' },
    { key: 'formacion_budget', label: 'Budget Formación (€)', type: 'number' },

    // Status & Classifications
    { key: 'estado', label: 'Estado', type: 'text' },
    { key: 'prioridad', label: 'Prioridad', type: 'text' },
    { key: 'categoria', label: 'Categoría', type: 'text' },
    { key: 'riesgo_rotacion', label: 'Riesgo de Rotación', type: 'text' },
    { key: 'potencial_liderazgo', label: 'Potencial de Liderazgo', type: 'text' },

    // Financial Details
    { key: 'bonus_anual', label: 'Bonus Anual (€)', type: 'number' },
    { key: 'gastos_viaje', label: 'Gastos de Viaje/Año (€)', type: 'number' },
    { key: 'coste_total_empresa', label: 'Coste Total Empresa (€)', type: 'number' },

    // Notes & Comments
    { key: 'notas', label: 'Notas', type: 'text' },
    { key: 'comentarios_manager', label: 'Comentarios del Manager', type: 'text' }
  ];

  // Generate 500 rows of data
  const rows = Array.from({ length: 500 }, (_, index) => {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const birthDate = randomDate(new Date('1970-01-01'), new Date('2000-12-31'));
    const hireDate = randomDate(new Date('2015-01-01'), new Date('2024-01-01'));
    const contractEndDate = randomBoolean() ? randomDate(hireDate, new Date('2025-12-31')) : null;
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDate.getFullYear();
    const experienceYears = Math.max(0, currentYear - hireDate.getFullYear());
    const baseSalary = randomInt(25000, 120000);
    const isManager = randomBoolean() && experienceYears > 2;
    const department = randomElement(DEPARTMENTS);
    const city = randomElement(CITIES);
    const country = randomElement(COUNTRIES);
    const ventas_mes = randomInt(1000, 50000);
    const meta_anual = randomInt(50000, 500000);
    const progreso = randomInt(0, 150);

    return {
      _id: index,
      // Personal Information
      id: index + 1,
      nombre: firstName,
      apellido: lastName,
      nombre_completo: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      telefono: generatePhone(),
      edad: age,
      fecha_nacimiento: formatDate(birthDate),
      genero: randomElement(['Masculino', 'Femenino', 'No especificado']),
      nacionalidad: country,

      // Employment Details
      salario: baseSalary,
      activo: randomBoolean(),
      departamento: department,
      puesto: `${department} ${randomElement(['Specialist', 'Analyst', 'Coordinator', 'Manager', 'Director', 'Senior', 'Junior'])}`,
      nivel_jerarquico: randomElement(['Junior', 'Senior', 'Lead', 'Manager', 'Director', 'VP', 'C-Level']),
      tipo_contrato: randomElement(CONTRACT_TYPES),
      fecha_contratacion: formatDate(hireDate),
      fecha_fin_contrato: contractEndDate ? formatDate(contractEndDate) : '',
      experiencia_años: experienceYears,
      es_manager: isManager,

      // Location & Office
      ciudad: city,
      pais: country,
      codigo_postal: randomInt(10000, 99999).toString(),
      direccion_completa: `Calle ${randomElement(['Mayor', 'Principal', 'del Sol', 'de la Paz', 'Real'])} ${randomInt(1, 200)}, ${city}`,
      oficina: randomElement(OFFICE_LOCATIONS),
      region: randomElement(REGIONS),
      zona_horaria: 'CET',

      // Performance & Evaluation
      puntuacion: randomFloat(1, 10, 1),
      rating_rendimiento: randomElement(PERFORMANCE_RATINGS),
      satisfaccion_cliente: randomInt(60, 100),
      productividad_score: randomFloat(70, 100, 1),
      fecha_evaluacion: formatDate(randomDate(new Date('2023-01-01'), new Date())),
      fecha_promocion: formatDate(randomDate(new Date('2020-01-01'), new Date())),
      incremento_salarial: randomFloat(0, 15, 1),

      // Sales & Business Metrics
      ventas_ultimo_mes: ventas_mes,
      ventas_trimestre: ventas_mes * 3 + randomInt(-5000, 5000),
      ventas_año: ventas_mes * 12 + randomInt(-20000, 20000),
      comision: randomFloat(0, 15, 1),
      meta_anual: meta_anual,
      progreso_meta: progreso,
      clientes_activos: randomInt(5, 50),
      nuevos_clientes: randomInt(0, 10),
      canal_ventas: randomElement(SALES_CHANNELS),
      tipo_cliente: randomElement(CLIENT_TYPES),

      // Skills & Education
      nivel_educacion: randomElement(EDUCATION_LEVELS),
      universidad: `Universidad de ${randomElement(CITIES)}`,
      carrera: randomElement(['Ingeniería', 'Administración', 'Marketing', 'Informática', 'Economía', 'Derecho', 'Psicología', 'Diseño']),
      idiomas: randomInt(1, 5),
      idioma_principal: randomElement(LANGUAGES),
      skill_principal: randomElement(SKILLS),
      certificaciones: randomInt(0, 8),
      certificacion_principal: randomElement(CERTIFICATIONS),
      formacion_horas: randomInt(10, 120),

      // Work Patterns & Preferences
      horas_trabajadas: randomInt(20, 50),
      modalidad_trabajo: randomElement(['Presencial', 'Remoto', 'Híbrido']),
      flexibilidad_horaria: randomBoolean(),
      viajes_trabajo: randomInt(0, 20),
      preferencia_comunicacion: randomElement(COMMUNICATION_PREFERENCES),
      vacaciones_dias: randomInt(15, 35),
      dias_enfermedad: randomInt(0, 15),

      // Projects & Activities
      proyectos_activos: randomInt(0, 15),
      proyecto_principal: randomElement(PROJECTS),
      industria_principal: randomElement(INDUSTRIES),
      fecha_ultima_actividad: formatDate(randomDate(new Date('2024-01-01'), new Date())),
      reuniones_semana: randomInt(2, 20),
      emails_dia: randomInt(10, 100),

      // Personal Assets & Benefits
      tiene_coche: randomBoolean(),
      seguro_medico: randomBoolean(),
      seguro_dental: randomBoolean(),
      plan_pension: randomBoolean(),
      stock_options: randomBoolean(),
      gimnasio: randomBoolean(),
      formacion_budget: randomInt(500, 5000),

      // Status & Classifications
      estado: randomElement(STATUSES),
      prioridad: randomElement(PRIORITIES),
      categoria: randomElement(CATEGORIES),
      riesgo_rotacion: randomElement(['Bajo', 'Medio', 'Alto']),
      potencial_liderazgo: randomElement(['Bajo', 'Medio', 'Alto', 'Muy Alto']),

      // Financial Details
      bonus_anual: randomInt(0, baseSalary * 0.3),
      gastos_viaje: randomInt(0, 10000),
      coste_total_empresa: baseSalary + randomInt(5000, 25000),

      // Notes & Comments
      notas: `Empleado ${index + 1} - ${randomElement(['Excelente rendimiento', 'Buen colaborador', 'En desarrollo', 'Potencial de crecimiento', 'Necesita apoyo', 'Líder natural', 'Muy motivado', 'Orientado a resultados', 'Innovador', 'Detallista', 'Proactivo', 'Colaborativo'])}`,
      comentarios_manager: randomElement(['Supera expectativas consistentemente', 'Cumple objetivos regularmente', 'Necesita seguimiento adicional', 'Candidato para promoción', 'Requiere formación específica', 'Excelente mentor para juniors', 'Fuerte orientación al cliente', 'Habilidades técnicas sobresalientes'])
    };
  });

  return {
    columns,
    rows,
    sheetNames: ['Datos de Empleados'],
    activeSheet: 'Datos de Empleados'
  };
};
