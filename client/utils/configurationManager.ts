import { FilterGroup, PaginationConfig } from '@shared/excel-types';

export interface SavedConfiguration {
  id: string;
  name: string;
  description?: string;
  created: Date;
  updated: Date;
  config: {
    selectedColumns: string[];
    filterGroups: FilterGroup[];
    globalSearch: string;
    searchMode: 'normal' | 'regex' | 'pattern';
    columnFilters: Record<string, string>;
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
    pagination: PaginationConfig;
  };
}

export interface UserPreferences {
  defaultPageSize: number;
  autoSaveConfigurations: boolean;
  showStatsOnLoad: boolean;
  showVisualizationOnLoad: boolean;
  dateFormat: 'es-ES' | 'en-US' | 'ISO';
  numberFormat: 'es-ES' | 'en-US';
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  defaultSearchMode: 'normal' | 'regex' | 'pattern';
  maxRecentConfigurations: number;
}

const STORAGE_KEYS = {
  CONFIGURATIONS: 'excel-explorer-configurations',
  PREFERENCES: 'excel-explorer-preferences',
  RECENT: 'excel-explorer-recent'
};

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultPageSize: 25,
  autoSaveConfigurations: true,
  showStatsOnLoad: false,
  showVisualizationOnLoad: false,
  dateFormat: 'es-ES',
  numberFormat: 'es-ES',
  theme: 'system',
  compactMode: false,
  defaultSearchMode: 'normal',
  maxRecentConfigurations: 10
};

// Configuration Management
export const saveConfiguration = (config: Omit<SavedConfiguration, 'id' | 'created' | 'updated'>): SavedConfiguration => {
  const configurations = getSavedConfigurations();
  const newConfig: SavedConfiguration = {
    ...config,
    id: Date.now().toString(),
    created: new Date(),
    updated: new Date()
  };

  configurations.push(newConfig);
  localStorage.setItem(STORAGE_KEYS.CONFIGURATIONS, JSON.stringify(configurations));
  
  return newConfig;
};

export const updateConfiguration = (id: string, updates: Partial<SavedConfiguration>): SavedConfiguration | null => {
  const configurations = getSavedConfigurations();
  const index = configurations.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  configurations[index] = {
    ...configurations[index],
    ...updates,
    updated: new Date()
  };
  
  localStorage.setItem(STORAGE_KEYS.CONFIGURATIONS, JSON.stringify(configurations));
  return configurations[index];
};

export const deleteConfiguration = (id: string): boolean => {
  const configurations = getSavedConfigurations();
  const filtered = configurations.filter(c => c.id !== id);
  
  if (filtered.length === configurations.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.CONFIGURATIONS, JSON.stringify(filtered));
  return true;
};

export const getSavedConfigurations = (): SavedConfiguration[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIGURATIONS);
    if (!saved) return [];
    
    const configurations = JSON.parse(saved);
    return configurations.map((config: any) => ({
      ...config,
      created: new Date(config.created),
      updated: new Date(config.updated)
    }));
  } catch (error) {
    console.error('Error loading saved configurations:', error);
    return [];
  }
};

export const getConfigurationById = (id: string): SavedConfiguration | null => {
  const configurations = getSavedConfigurations();
  return configurations.find(c => c.id === id) || null;
};

// Preferences Management
export const getUserPreferences = (): UserPreferences => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!saved) return DEFAULT_PREFERENCES;
    
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const saveUserPreferences = (preferences: Partial<UserPreferences>): UserPreferences => {
  const current = getUserPreferences();
  const updated = { ...current, ...preferences };
  
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
  return updated;
};

export const resetPreferences = (): UserPreferences => {
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  return DEFAULT_PREFERENCES;
};

// Recent Configurations
export const addToRecentConfigurations = (configId: string): void => {
  try {
    const recent = getRecentConfigurations();
    const filtered = recent.filter(id => id !== configId);
    const preferences = getUserPreferences();
    
    filtered.unshift(configId);
    
    if (filtered.length > preferences.maxRecentConfigurations) {
      filtered.splice(preferences.maxRecentConfigurations);
    }
    
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error updating recent configurations:', error);
  }
};

export const getRecentConfigurations = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENT);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading recent configurations:', error);
    return [];
  }
};

export const clearRecentConfigurations = (): void => {
  localStorage.removeItem(STORAGE_KEYS.RECENT);
};

// Auto-save functionality
export const autoSaveConfiguration = (
  name: string,
  config: SavedConfiguration['config']
): SavedConfiguration | null => {
  const preferences = getUserPreferences();
  
  if (!preferences.autoSaveConfigurations) return null;
  
  // Check if a configuration with this name already exists
  const existing = getSavedConfigurations().find(c => c.name === name);
  
  if (existing) {
    return updateConfiguration(existing.id, { config });
  } else {
    return saveConfiguration({
      name,
      description: 'Configuración guardada automáticamente',
      config
    });
  }
};

// Export/Import configurations
export const exportConfigurations = (): string => {
  const configurations = getSavedConfigurations();
  const preferences = getUserPreferences();
  
  return JSON.stringify({
    configurations,
    preferences,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }, null, 2);
};

export const importConfigurations = (jsonData: string): { success: boolean; message: string; imported: number } => {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.configurations || !Array.isArray(data.configurations)) {
      return { success: false, message: 'Formato de archivo inválido', imported: 0 };
    }
    
    const currentConfigs = getSavedConfigurations();
    let imported = 0;
    
    data.configurations.forEach((config: any) => {
      // Check if configuration already exists
      const exists = currentConfigs.some(c => c.name === config.name);
      
      if (!exists) {
        saveConfiguration({
          name: config.name,
          description: config.description || 'Configuración importada',
          config: config.config
        });
        imported++;
      }
    });
    
    // Import preferences if available
    if (data.preferences) {
      saveUserPreferences(data.preferences);
    }
    
    return { 
      success: true, 
      message: `Se importaron ${imported} configuraciones correctamente`, 
      imported 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Error al procesar el archivo de configuración', 
      imported: 0 
    };
  }
};

// Utility functions
export const formatConfigurationDate = (date: Date): string => {
  const preferences = getUserPreferences();
  return date.toLocaleDateString(preferences.dateFormat, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateConfigurationName = (baseData: any): string => {
  const timestamp = new Date().toLocaleDateString('es-ES');
  const filterCount = baseData.filterGroups?.length || 0;
  const columnCount = baseData.selectedColumns?.length || 0;
  
  return `Config ${timestamp} (${columnCount} cols, ${filterCount} filtros)`;
};
