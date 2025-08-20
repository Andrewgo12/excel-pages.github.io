/* shared/table-customization.js
   Converted from shared/table-customization.ts — Type annotations removed.
   Keeps all runtime constants and utility functions.
*/

// Default presets and utility functions for table customization

export const DEFAULT_FONT_SETTINGS = {
  family: "Inter, system-ui, sans-serif",
  size: 14,
  weight: "normal",
  style: "normal",
  lineHeight: 1.5,
};

export const DEFAULT_HEADER_FONT_SETTINGS = {
  family: "Inter, system-ui, sans-serif",
  size: 14,
  weight: "bold",
  style: "normal",
  lineHeight: 1.4,
};

export const DEFAULT_ALIGNMENT = {
  horizontal: "left",
  vertical: "middle",
};

export const DEFAULT_COLOR_SCHEME = {
  background: "#ffffff",
  text: "#1f2937",
  border: "#e5e7eb",
  hover: "#f9fafb",
  selected: "#e0f2fe",
  striped: "#f8fafc",
};

export const DEFAULT_DARK_COLOR_SCHEME = {
  background: "#111827",
  text: "#f9fafb",
  border: "#374151",
  hover: "#1f2937",
  selected: "#1e40af",
  striped: "#1f2937",
};

export const DEFAULT_BORDER_SETTINGS = {
  style: "solid",
  width: 1,
  color: "#e5e7eb",
  radius: 4,
};

export const DEFAULT_SPACING_SETTINGS = {
  padding: {
    top: 12,
    right: 16,
    bottom: 12,
    left: 16,
  },
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  gap: 0,
};

export const DEFAULT_COLUMN_CUSTOMIZATION = {
  resizable: true,
  pinned: "none",
  visible: true,
  sortable: true,
  filterable: true,
  formatter: "default",
};

export const DEFAULT_TABLE_CUSTOMIZATION = {
  id: "default",
  name: "Default Table Style",
  description: "Clean, professional table styling with good readability",

  headerFont: DEFAULT_HEADER_FONT_SETTINGS,
  cellFont: DEFAULT_FONT_SETTINGS,

  defaultAlignment: DEFAULT_ALIGNMENT,
  headerAlignment: { horizontal: "left", vertical: "middle" },

  theme: "light",
  colorScheme: DEFAULT_COLOR_SCHEME,
  headerColorScheme: {
    background: "#f9fafb",
    text: "#374151",
    border: "#e5e7eb",
    hover: "#f3f4f6",
    selected: "#e0f2fe",
  },
  alternateRowColors: true,

  borderSettings: DEFAULT_BORDER_SETTINGS,
  spacing: DEFAULT_SPACING_SETTINGS,

  showHoverEffects: true,
  showShadows: false,
  showStriping: true,
  stripingInterval: 1,

  columnCustomizations: {},

  stickyHeader: true,
  virtualization: false,
  virtualizationThreshold: 1000,

  responsive: true,
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },

  includeInExport: true,
  exportFormat: "current",

  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

// Built-in presets
export const BUILT_IN_PRESETS = [
  {
    id: "business-professional",
    name: "Business Professional",
    description: "Clean, corporate style with subtle borders and professional typography",
    category: "business",
    tags: ["professional", "corporate", "clean"],
    customization: {
      headerFont: {
        ...DEFAULT_HEADER_FONT_SETTINGS,
        family: "system-ui, sans-serif",
      },
      cellFont: { ...DEFAULT_FONT_SETTINGS, family: "system-ui, sans-serif" },
      colorScheme: {
        background: "#ffffff",
        text: "#1f2937",
        border: "#d1d5db",
        hover: "#f9fafb",
        selected: "#dbeafe",
        striped: "#f8fafc",
      },
      headerColorScheme: {
        background: "#f3f4f6",
        text: "#111827",
        border: "#d1d5db",
        hover: "#e5e7eb",
        selected: "#dbeafe",
      },
      showStriping: false,
      showShadows: true,
    },
  },
  {
    id: "creative-colorful",
    name: "Creative & Colorful",
    description: "Vibrant colors and modern typography for creative projects",
    category: "creative",
    tags: ["colorful", "modern", "creative"],
    customization: {
      headerFont: { ...DEFAULT_HEADER_FONT_SETTINGS, weight: "bold", size: 15 },
      cellFont: { ...DEFAULT_FONT_SETTINGS, size: 14 },
      colorScheme: {
        background: "#ffffff",
        text: "#1f2937",
        border: "#e0e7ff",
        hover: "#f0f9ff",
        selected: "#ddd6fe",
        striped: "#faf5ff",
      },
      headerColorScheme: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        text: "#ffffff",
        border: "#6366f1",
        hover: "#818cf8",
        selected: "#a78bfa",
      },
      showStriping: true,
      stripingInterval: 1,
      borderSettings: { ...DEFAULT_BORDER_SETTINGS, radius: 8 },
    },
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Ultra-clean design with minimal borders and excellent readability",
    category: "minimal",
    tags: ["minimal", "clean", "simple"],
    customization: {
      headerFont: {
        ...DEFAULT_HEADER_FONT_SETTINGS,
        weight: "normal",
        size: 13,
      },
      cellFont: { ...DEFAULT_FONT_SETTINGS, size: 13, lineHeight: 1.6 },
      colorScheme: {
        background: "#ffffff",
        text: "#374151",
        border: "transparent",
        hover: "#f9fafb",
        selected: "#f0f9ff",
        striped: "transparent",
      },
      headerColorScheme: {
        background: "transparent",
        text: "#6b7280",
        border: "#f3f4f6",
        hover: "#f9fafb",
        selected: "#f0f9ff",
      },
      borderSettings: { ...DEFAULT_BORDER_SETTINGS, style: "none", width: 0 },
      showStriping: false,
      showShadows: false,
    },
  },
  {
    id: "dark-theme",
    name: "Dark Professional",
    description: "Dark mode optimized table for low-light environments",
    category: "modern",
    tags: ["dark", "modern", "professional"],
    customization: {
      theme: "dark",
      headerFont: { ...DEFAULT_HEADER_FONT_SETTINGS, size: 14 },
      cellFont: { ...DEFAULT_FONT_SETTINGS, size: 14 },
      colorScheme: DEFAULT_DARK_COLOR_SCHEME,
      headerColorScheme: {
        background: "#1f2937",
        text: "#f9fafb",
        border: "#4b5563",
        hover: "#374151",
        selected: "#1e40af",
      },
      borderSettings: { ...DEFAULT_BORDER_SETTINGS, color: "#4b5563" },
    },
  },
  {
    id: "classic-grid",
    name: "Classic Grid",
    description: "Traditional spreadsheet-style with visible grid lines",
    category: "classic",
    tags: ["classic", "grid", "spreadsheet"],
    customization: {
      headerFont: {
        ...DEFAULT_HEADER_FONT_SETTINGS,
        family: "monospace",
        size: 13,
      },
      cellFont: { ...DEFAULT_FONT_SETTINGS, family: "monospace", size: 12 },
      colorScheme: {
        background: "#ffffff",
        text: "#000000",
        border: "#cccccc",
        hover: "#f0f0f0",
        selected: "#cce7ff",
        striped: "#f8f8f8",
      },
      headerColorScheme: {
        background: "#e0e0e0",
        text: "#000000",
        border: "#cccccc",
        hover: "#d0d0d0",
        selected: "#cce7ff",
      },
      borderSettings: { ...DEFAULT_BORDER_SETTINGS, style: "solid", width: 1 },
      showStriping: true,
      spacing: {
        ...DEFAULT_SPACING_SETTINGS,
        padding: { top: 8, right: 12, bottom: 8, left: 12 },
      },
    },
  },
];

// Utility functions
export const applyCustomizationToColumn = (baseCustomization, overrides) => {
  return { ...baseCustomization, ...overrides };
};

export const getColumnCustomization = (tableCustomization, columnKey) => {
  return {
    ...DEFAULT_COLUMN_CUSTOMIZATION,
    columnKey,
    alignment: tableCustomization.defaultAlignment,
    fontSettings: tableCustomization.cellFont,
    colorScheme: tableCustomization.colorScheme,
    borderSettings: tableCustomization.borderSettings,
    ...tableCustomization.columnCustomizations[columnKey],
  };
};

export const generateTableStyles = (customization) => {
  const {
    colorScheme,
    headerColorScheme,
    cellFont,
    headerFont,
    borderSettings,
    spacing,
  } = customization;

  return {
    // CSS variables for dynamic styling
    "--table-bg": colorScheme.background,
    "--table-text": colorScheme.text,
    "--table-border": colorScheme.border,
    "--table-hover": colorScheme.hover,
    "--table-selected": colorScheme.selected,
    "--table-striped": colorScheme.striped,

    "--header-bg": headerColorScheme.background,
    "--header-text": headerColorScheme.text,
    "--header-border": headerColorScheme.border,
    "--header-hover": headerColorScheme.hover,

    "--cell-font-family": cellFont.family,
    "--cell-font-size": `${cellFont.size}px`,
    "--cell-font-weight": cellFont.weight,
    "--cell-font-style": cellFont.style,
    "--cell-line-height": cellFont.lineHeight,

    "--header-font-family": headerFont.family,
    "--header-font-size": `${headerFont.size}px`,
    "--header-font-weight": headerFont.weight,
    "--header-font-style": headerFont.style,
    "--header-line-height": headerFont.lineHeight,

    "--border-style": borderSettings.style,
    "--border-width": `${borderSettings.width}px`,
    "--border-color": borderSettings.color,
    "--border-radius": `${borderSettings.radius}px`,

    "--cell-padding-top": `${spacing.padding.top}px`,
    "--cell-padding-right": `${spacing.padding.right}px`,
    "--cell-padding-bottom": `${spacing.padding.bottom}px`,
    "--cell-padding-left": `${spacing.padding.left}px`,
  };
};
