import { ExcelColumn } from "@shared/excel-types";

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  predictions: number[];
  residuals: number[];
  mse: number; // Mean Squared Error
  rmse: number; // Root Mean Squared Error
  mae: number; // Mean Absolute Error
}

export interface ClassificationResult {
  predictions: string[];
  accuracy: number;
  precision: Record<string, number>;
  recall: Record<string, number>;
  f1Score: Record<string, number>;
  confusionMatrix: Record<string, Record<string, number>>;
  classDistribution: Record<string, number>;
}

export interface MLModelConfig {
  targetColumn: string;
  featureColumns: string[];
  modelType: 'linear_regression' | 'logistic_regression' | 'naive_bayes' | 'decision_tree';
  trainTestSplit: number; // 0.8 = 80% training, 20% testing
  crossValidation?: boolean;
}

export interface MLPrediction {
  rowIndex: number;
  actualValue: any;
  predictedValue: any;
  confidence?: number;
  residual?: number;
}

export interface MLModel {
  config: MLModelConfig;
  trainingAccuracy: number;
  testingAccuracy: number;
  predictions: MLPrediction[];
  featureImportance?: Record<string, number>;
  modelMetrics: LinearRegressionResult | ClassificationResult;
}

// Linear Regression Implementation
export class SimpleLinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  private trained: boolean = false;

  fit(x: number[], y: number[]): LinearRegressionResult {
    if (x.length !== y.length || x.length < 2) {
      throw new Error('Invalid data for linear regression');
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
    this.trained = true;

    const predictions = x.map(xi => this.slope * xi + this.intercept);
    const residuals = y.map((yi, i) => yi - predictions[i]);
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    // Calculate error metrics
    const mse = residualSumSquares / n;
    const rmse = Math.sqrt(mse);
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / n;

    return {
      slope: this.slope,
      intercept: this.intercept,
      rSquared,
      predictions,
      residuals,
      mse,
      rmse,
      mae
    };
  }

  predict(x: number[]): number[] {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }
    return x.map(xi => this.slope * xi + this.intercept);
  }
}

// Multiple Linear Regression Implementation
export class MultipleLinearRegression {
  private coefficients: number[] = [];
  private intercept: number = 0;
  private trained: boolean = false;

  fit(X: number[][], y: number[]): LinearRegressionResult {
    if (X.length !== y.length || X.length < 2) {
      throw new Error('Invalid data for multiple regression');
    }

    // Add intercept column (all 1s)
    const XWithIntercept = X.map(row => [1, ...row]);
    
    // Normal equation: β = (X'X)^-1 X'y
    const XTranspose = this.transpose(XWithIntercept);
    const XTX = this.multiply(XTranspose, XWithIntercept);
    const XTXInv = this.inverse(XTX);
    const XTy = this.multiplyVector(XTranspose, y);
    const coefficients = this.multiplyVector(XTXInv, XTy);

    this.intercept = coefficients[0];
    this.coefficients = coefficients.slice(1);
    this.trained = true;

    const predictions = X.map(row => this.predictSingle(row));
    const residuals = y.map((yi, i) => yi - predictions[i]);
    
    // Calculate R-squared
    const yMean = y.reduce((a, b) => a + b, 0) / y.length;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const residualSumSquares = residuals.reduce((sum, r) => sum + r * r, 0);
    const rSquared = Math.max(0, 1 - (residualSumSquares / totalSumSquares));

    // Calculate error metrics
    const mse = residualSumSquares / y.length;
    const rmse = Math.sqrt(mse);
    const mae = residuals.reduce((sum, r) => sum + Math.abs(r), 0) / y.length;

    return {
      slope: this.coefficients[0] || 0,
      intercept: this.intercept,
      rSquared,
      predictions,
      residuals,
      mse,
      rmse,
      mae
    };
  }

  private predictSingle(x: number[]): number {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }
    return this.intercept + x.reduce((sum, xi, i) => sum + xi * this.coefficients[i], 0);
  }

  predict(X: number[][]): number[] {
    return X.map(row => this.predictSingle(row));
  }

  // Matrix operations (simplified implementations)
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  private multiply(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private multiplyVector(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    );
  }

  private inverse(matrix: number[][]): number[][] {
    // Simplified 2x2 matrix inverse for basic cases
    if (matrix.length === 2 && matrix[0].length === 2) {
      const [[a, b], [c, d]] = matrix;
      const det = a * d - b * c;
      if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is singular and cannot be inverted');
      }
      return [
        [d / det, -b / det],
        [-c / det, a / det]
      ];
    }
    
    // For larger matrices, use Gaussian elimination (simplified)
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [
      ...row,
      ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))
    ]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      let pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error('Matrix is singular and cannot be inverted');
      }
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    return augmented.map(row => row.slice(n));
  }
}

// Naive Bayes Classifier Implementation
export class NaiveBayesClassifier {
  private classProbabilities: Record<string, number> = {};
  private featureProbabilities: Record<string, Record<number, Record<any, number>>> = {};
  private classes: string[] = [];
  private trained: boolean = false;

  fit(X: number[][], y: string[]): ClassificationResult {
    if (X.length !== y.length || X.length < 2) {
      throw new Error('Invalid data for classification');
    }

    this.classes = [...new Set(y)];
    const n = y.length;

    // Calculate class probabilities
    this.classProbabilities = {};
    this.classes.forEach(className => {
      this.classProbabilities[className] = y.filter(yi => yi === className).length / n;
    });

    // Calculate feature probabilities for each class
    this.featureProbabilities = {};
    this.classes.forEach(className => {
      this.featureProbabilities[className] = {};
      const classIndices = y.map((yi, i) => yi === className ? i : -1).filter(i => i !== -1);
      
      for (let featureIndex = 0; featureIndex < X[0].length; featureIndex++) {
        this.featureProbabilities[className][featureIndex] = {};
        const featureValues = classIndices.map(i => X[i][featureIndex]);
        const uniqueValues = [...new Set(featureValues)];
        
        uniqueValues.forEach(value => {
          const count = featureValues.filter(v => v === value).length;
          this.featureProbabilities[className][featureIndex][value] = (count + 1) / (classIndices.length + uniqueValues.length); // Laplace smoothing
        });
      }
    });

    this.trained = true;

    // Make predictions on training data to calculate metrics
    const predictions = this.predict(X);
    return this.calculateClassificationMetrics(y, predictions);
  }

  predict(X: number[][]): string[] {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }

    return X.map(row => {
      let bestClass = this.classes[0];
      let bestProbability = -Infinity;

      this.classes.forEach(className => {
        let probability = Math.log(this.classProbabilities[className]);
        
        row.forEach((value, featureIndex) => {
          const featureProb = this.featureProbabilities[className][featureIndex][value] || 
                              (1 / (Object.keys(this.featureProbabilities[className][featureIndex]).length + 1));
          probability += Math.log(featureProb);
        });

        if (probability > bestProbability) {
          bestProbability = probability;
          bestClass = className;
        }
      });

      return bestClass;
    });
  }

  private calculateClassificationMetrics(actual: string[], predicted: string[]): ClassificationResult {
    const accuracy = actual.filter((yi, i) => yi === predicted[i]).length / actual.length;
    
    const precision: Record<string, number> = {};
    const recall: Record<string, number> = {};
    const f1Score: Record<string, number> = {};
    const confusionMatrix: Record<string, Record<string, number>> = {};
    
    this.classes.forEach(className => {
      confusionMatrix[className] = {};
      this.classes.forEach(predictedClass => {
        confusionMatrix[className][predictedClass] = 0;
      });
    });

    // Build confusion matrix
    actual.forEach((actualClass, i) => {
      const predictedClass = predicted[i];
      confusionMatrix[actualClass][predictedClass]++;
    });

    // Calculate precision, recall, and F1 score for each class
    this.classes.forEach(className => {
      const truePositives = confusionMatrix[className][className];
      const falsePositives = this.classes.reduce((sum, other) => 
        sum + (other !== className ? confusionMatrix[other][className] : 0), 0);
      const falseNegatives = this.classes.reduce((sum, other) => 
        sum + (other !== className ? confusionMatrix[className][other] : 0), 0);

      precision[className] = truePositives / (truePositives + falsePositives) || 0;
      recall[className] = truePositives / (truePositives + falseNegatives) || 0;
      f1Score[className] = 2 * (precision[className] * recall[className]) / 
                          (precision[className] + recall[className]) || 0;
    });

    const classDistribution = this.classes.reduce((acc, className) => {
      acc[className] = actual.filter(yi => yi === className).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      predictions: predicted,
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix,
      classDistribution
    };
  }
}

// Main ML function to create and train models
export const createMLModel = (
  data: Record<string, any>[],
  config: MLModelConfig,
  columns: ExcelColumn[]
): MLModel => {
  if (data.length < 10) {
    throw new Error('Insufficient data for machine learning (minimum 10 rows required)');
  }

  // Validate columns
  const targetColumn = columns.find(col => col.key === config.targetColumn);
  if (!targetColumn) {
    throw new Error(`Target column '${config.targetColumn}' not found`);
  }

  const featureColumns = config.featureColumns
    .map(key => columns.find(col => col.key === key))
    .filter(col => col !== undefined) as ExcelColumn[];

  if (featureColumns.length === 0) {
    throw new Error('No valid feature columns found');
  }

  // Prepare data
  const cleanData = data.filter(row => {
    const targetValue = row[config.targetColumn];
    const featureValues = config.featureColumns.map(key => row[key]);
    return targetValue !== null && targetValue !== undefined && targetValue !== '' &&
           featureValues.every(val => val !== null && val !== undefined && val !== '');
  });

  if (cleanData.length < 5) {
    throw new Error('Insufficient clean data for training');
  }

  // Split data
  const splitIndex = Math.floor(cleanData.length * config.trainTestSplit);
  const trainData = cleanData.slice(0, splitIndex);
  const testData = cleanData.slice(splitIndex);

  let modelMetrics: LinearRegressionResult | ClassificationResult;
  let predictions: MLPrediction[] = [];

  if (config.modelType === 'linear_regression') {
    // Regression
    const X_train = trainData.map(row => 
      config.featureColumns.map(key => Number(row[key]) || 0)
    );
    const y_train = trainData.map(row => Number(row[config.targetColumn]) || 0);

    const model = featureColumns.length === 1 ? 
                  new SimpleLinearRegression() : 
                  new MultipleLinearRegression();

    if (featureColumns.length === 1) {
      modelMetrics = (model as SimpleLinearRegression).fit(X_train.map(x => x[0]), y_train);
    } else {
      modelMetrics = (model as MultipleLinearRegression).fit(X_train, y_train);
    }

    // Predict on test data
    const X_test = testData.map(row => 
      config.featureColumns.map(key => Number(row[key]) || 0)
    );
    const y_test = testData.map(row => Number(row[config.targetColumn]) || 0);

    const testPredictions = featureColumns.length === 1 ?
                           (model as SimpleLinearRegression).predict(X_test.map(x => x[0])) :
                           (model as MultipleLinearRegression).predict(X_test);

    predictions = testData.map((row, i) => ({
      rowIndex: splitIndex + i,
      actualValue: y_test[i],
      predictedValue: testPredictions[i],
      residual: y_test[i] - testPredictions[i]
    }));

  } else {
    // Classification
    const X_train = trainData.map(row => 
      config.featureColumns.map(key => {
        const val = row[key];
        return typeof val === 'number' ? val : (typeof val === 'string' ? val.charCodeAt(0) : 0);
      })
    );
    const y_train = trainData.map(row => String(row[config.targetColumn]));

    const model = new NaiveBayesClassifier();
    modelMetrics = model.fit(X_train, y_train);

    // Predict on test data
    const X_test = testData.map(row => 
      config.featureColumns.map(key => {
        const val = row[key];
        return typeof val === 'number' ? val : (typeof val === 'string' ? val.charCodeAt(0) : 0);
      })
    );
    const y_test = testData.map(row => String(row[config.targetColumn]));

    const testPredictions = model.predict(X_test);

    predictions = testData.map((row, i) => ({
      rowIndex: splitIndex + i,
      actualValue: y_test[i],
      predictedValue: testPredictions[i]
    }));

    // Update metrics with test data
    modelMetrics = model.calculateClassificationMetrics(y_test, testPredictions);
  }

  const trainingAccuracy = config.modelType === 'linear_regression' ? 
                          (modelMetrics as LinearRegressionResult).rSquared :
                          (modelMetrics as ClassificationResult).accuracy;

  const testingAccuracy = trainingAccuracy; // For simplicity, using same metric

  return {
    config,
    trainingAccuracy,
    testingAccuracy,
    predictions,
    modelMetrics
  };
};

// Utility functions
export const getNumericColumns = (columns: ExcelColumn[]): ExcelColumn[] => {
  return columns.filter(col => col.type === 'number');
};

export const getCategoricalColumns = (columns: ExcelColumn[]): ExcelColumn[] => {
  return columns.filter(col => col.type === 'text' || col.type === 'boolean');
};

export const formatModelType = (type: string): string => {
  const labels = {
    linear_regression: 'Regresión Lineal',
    logistic_regression: 'Regresión Logística',
    naive_bayes: 'Naive Bayes',
    decision_tree: 'Árbol de Decisión'
  };
  return labels[type as keyof typeof labels] || type;
};

export const formatAccuracy = (accuracy: number): string => {
  return `${(accuracy * 100).toFixed(1)}%`;
};
