import { ExcelColumn } from "@shared/excel-types";
import { ColumnStats } from "./statisticalAnalysis";

export interface CorrelationResult {
  column1: string;
  column2: string;
  correlation: number;
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  direction: 'positive' | 'negative';
  significance: number; // p-value approximation
}

export interface OutlierResult {
  column: string;
  outliers: Array<{
    rowIndex: number;
    value: any;
    zScore: number;
    method: 'zscore' | 'iqr' | 'isolation';
  }>;
  totalOutliers: number;
  outlierPercentage: number;
}

export interface AdvancedStats {
  correlations: CorrelationResult[];
  outliers: OutlierResult[];
  normalityTests: Array<{
    column: string;
    isNormal: boolean;
    shapiroWilk?: number;
    kolmogorovSmirnov?: number;
  }>;
  trendAnalysis: Array<{
    column: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'cyclical';
    confidence: number;
    seasonality?: boolean;
  }>;
}

// Pearson correlation coefficient
export const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

// Spearman rank correlation (non-parametric)
export const calculateSpearmanCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length < 2) return 0;

  // Create rank arrays
  const rankX = getRanks(x);
  const rankY = getRanks(y);

  return calculatePearsonCorrelation(rankX, rankY);
};

const getRanks = (arr: number[]): number[] => {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = new Array(arr.length);
  
  for (let i = 0; i < sorted.length; i++) {
    ranks[sorted[i].idx] = i + 1;
  }
  
  return ranks;
};

// Classify correlation strength
export const classifyCorrelationStrength = (correlation: number): {
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  direction: 'positive' | 'negative';
} => {
  const abs = Math.abs(correlation);
  let strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  
  if (abs < 0.1) strength = 'very_weak';
  else if (abs < 0.3) strength = 'weak';
  else if (abs < 0.5) strength = 'moderate';
  else if (abs < 0.7) strength = 'strong';
  else strength = 'very_strong';

  return {
    strength,
    direction: correlation >= 0 ? 'positive' : 'negative'
  };
};

// Z-score outlier detection
export const detectOutliersZScore = (
  data: Record<string, any>[],
  column: string,
  threshold: number = 2.5
): OutlierResult => {
  const values = data
    .map((row, index) => ({ value: row[column], index }))
    .filter(item => typeof item.value === 'number' && !isNaN(item.value));

  if (values.length < 3) {
    return {
      column,
      outliers: [],
      totalOutliers: 0,
      outlierPercentage: 0
    };
  }

  const numbers = values.map(item => item.value);
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const variance = numbers.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / numbers.length;
  const stdDev = Math.sqrt(variance);

  const outliers = values
    .map(item => ({
      rowIndex: item.index,
      value: item.value,
      zScore: Math.abs((item.value - mean) / stdDev),
      method: 'zscore' as const
    }))
    .filter(item => item.zScore > threshold);

  return {
    column,
    outliers,
    totalOutliers: outliers.length,
    outlierPercentage: (outliers.length / values.length) * 100
  };
};

// IQR outlier detection
export const detectOutliersIQR = (
  data: Record<string, any>[],
  column: string
): OutlierResult => {
  const values = data
    .map((row, index) => ({ value: row[column], index }))
    .filter(item => typeof item.value === 'number' && !isNaN(item.value));

  if (values.length < 4) {
    return {
      column,
      outliers: [],
      totalOutliers: 0,
      outlierPercentage: 0
    };
  }

  const sortedValues = [...values].sort((a, b) => a.value - b.value);
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  
  const q1 = sortedValues[q1Index].value;
  const q3 = sortedValues[q3Index].value;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = values
    .filter(item => item.value < lowerBound || item.value > upperBound)
    .map(item => ({
      rowIndex: item.index,
      value: item.value,
      zScore: 0, // Not applicable for IQR
      method: 'iqr' as const
    }));

  return {
    column,
    outliers,
    totalOutliers: outliers.length,
    outlierPercentage: (outliers.length / values.length) * 100
  };
};

// Calculate correlations between all numeric columns
export const calculateAllCorrelations = (
  data: Record<string, any>[],
  columns: ExcelColumn[]
): CorrelationResult[] => {
  const numericColumns = columns.filter(col => col.type === 'number');
  const correlations: CorrelationResult[] = [];

  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];

      const values1 = data
        .map(row => row[col1.key])
        .filter(val => typeof val === 'number' && !isNaN(val));
      
      const values2 = data
        .map(row => row[col2.key])
        .filter(val => typeof val === 'number' && !isNaN(val));

      if (values1.length > 2 && values2.length > 2) {
        const correlation = calculatePearsonCorrelation(values1, values2);
        const { strength, direction } = classifyCorrelationStrength(correlation);

        // Simple significance test (approximation)
        const n = Math.min(values1.length, values2.length);
        const tStat = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
        const significance = 1 - Math.abs(tStat) / (Math.abs(tStat) + Math.sqrt(n - 2));

        correlations.push({
          column1: col1.key,
          column2: col2.key,
          correlation,
          strength,
          direction,
          significance
        });
      }
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
};

// Detect outliers for all numeric columns
export const detectAllOutliers = (
  data: Record<string, any>[],
  columns: ExcelColumn[],
  method: 'zscore' | 'iqr' = 'zscore'
): OutlierResult[] => {
  const numericColumns = columns.filter(col => col.type === 'number');
  
  return numericColumns.map(col => 
    method === 'zscore' 
      ? detectOutliersZScore(data, col.key)
      : detectOutliersIQR(data, col.key)
  ).filter(result => result.totalOutliers > 0);
};

// Perform basic normality test (Shapiro-Wilk approximation for small samples)
export const testNormality = (values: number[]): { isNormal: boolean; statistic: number } => {
  if (values.length < 3) return { isNormal: true, statistic: 1 };
  
  // Simple skewness and kurtosis check
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const skewness = values.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 3), 0) / n;
  const kurtosis = values.reduce((sum, x) => sum + Math.pow((x - mean) / stdDev, 4), 0) / n - 3;
  
  // Simple heuristic: normal if |skewness| < 1 and |kurtosis| < 1
  const isNormal = Math.abs(skewness) < 1 && Math.abs(kurtosis) < 1;
  const statistic = 1 - (Math.abs(skewness) + Math.abs(kurtosis)) / 2;
  
  return { isNormal, statistic: Math.max(0, statistic) };
};

// Trend analysis using linear regression
export const analyzeTrend = (values: number[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  confidence: number;
} => {
  if (values.length < 3) return { trend: 'stable', slope: 0, confidence: 0 };

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  
  // Linear regression
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared for confidence
  const yMean = sumY / n;
  const totalSumSquares = values.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const residualSumSquares = values.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  const confidence = Math.max(0, rSquared);
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(slope) < 0.01) trend = 'stable';
  else if (slope > 0) trend = 'increasing';
  else trend = 'decreasing';
  
  return { trend, slope, confidence };
};

// Generate comprehensive advanced statistics
export const generateAdvancedStats = (
  data: Record<string, any>[],
  columns: ExcelColumn[]
): AdvancedStats => {
  const correlations = calculateAllCorrelations(data, columns);
  const outliers = detectAllOutliers(data, columns, 'zscore');
  
  const normalityTests = columns
    .filter(col => col.type === 'number')
    .map(col => {
      const values = data
        .map(row => row[col.key])
        .filter(val => typeof val === 'number' && !isNaN(val));
      
      const { isNormal, statistic } = testNormality(values);
      
      return {
        column: col.key,
        isNormal,
        shapiroWilk: statistic
      };
    });

  const trendAnalysis = columns
    .filter(col => col.type === 'number')
    .map(col => {
      const values = data
        .map(row => row[col.key])
        .filter(val => typeof val === 'number' && !isNaN(val));
      
      const { trend, confidence } = analyzeTrend(values);
      
      return {
        column: col.key,
        trend,
        confidence
      };
    });

  return {
    correlations,
    outliers,
    normalityTests,
    trendAnalysis
  };
};

// Utility functions for formatting
export const formatCorrelationStrength = (strength: string): string => {
  const labels = {
    very_weak: 'Muy Débil',
    weak: 'Débil',
    moderate: 'Moderada',
    strong: 'Fuerte',
    very_strong: 'Muy Fuerte'
  };
  return labels[strength as keyof typeof labels] || strength;
};

export const formatDirection = (direction: string): string => {
  return direction === 'positive' ? 'Positiva' : 'Negativa';
};

export const formatTrend = (trend: string): string => {
  const labels = {
    increasing: 'Creciente',
    decreasing: 'Decreciente',
    stable: 'Estable',
    cyclical: 'Cíclica'
  };
  return labels[trend as keyof typeof labels] || trend;
};
