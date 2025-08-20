import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  X,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Zap
} from 'lucide-react';
import { ExcelData, ExcelColumn } from '@shared/excel-types';
import {
  createMLModel,
  getNumericColumns,
  getCategoricalColumns,
  formatModelType,
  formatAccuracy,
  MLModel,
  MLModelConfig,
  MLPrediction,
  LinearRegressionResult,
  ClassificationResult
} from '@/utils/machineLearning';

interface MachineLearningProps {
  data: ExcelData;
  filteredData: Record<string, any>[];
  selectedColumns: string[];
  onClose: () => void;
  onApplyPredictions?: (predictions: MLPrediction[]) => void;
}

export function MachineLearning({
  data,
  filteredData,
  selectedColumns,
  onClose,
  onApplyPredictions
}: MachineLearningProps) {
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [modelType, setModelType] = useState<'linear_regression' | 'naive_bayes'>('linear_regression');
  const [trainTestSplit, setTrainTestSplit] = useState<number>(0.8);
  const [isTraining, setIsTraining] = useState(false);
  const [trainedModel, setTrainedModel] = useState<MLModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericColumns = useMemo(() => 
    getNumericColumns(data.columns).filter(col => selectedColumns.includes(col.key)),
    [data.columns, selectedColumns]
  );

  const categoricalColumns = useMemo(() => 
    getCategoricalColumns(data.columns).filter(col => selectedColumns.includes(col.key)),
    [data.columns, selectedColumns]
  );

  const availableTargets = useMemo(() => {
    return modelType === 'linear_regression' ? numericColumns : [...numericColumns, ...categoricalColumns];
  }, [modelType, numericColumns, categoricalColumns]);

  const availableFeatures = useMemo(() => {
    return data.columns.filter(col => 
      selectedColumns.includes(col.key) && col.key !== targetColumn
    );
  }, [data.columns, selectedColumns, targetColumn]);

  const handleFeatureToggle = (columnKey: string, checked: boolean) => {
    if (checked) {
      setFeatureColumns(prev => [...prev, columnKey]);
    } else {
      setFeatureColumns(prev => prev.filter(key => key !== columnKey));
    }
  };

  const handleTrainModel = async () => {
    if (!targetColumn || featureColumns.length === 0) {
      setError('Please select target column and at least one feature column');
      return;
    }

    setIsTraining(true);
    setError(null);

    try {
      const config: MLModelConfig = {
        targetColumn,
        featureColumns,
        modelType,
        trainTestSplit
      };

      const model = createMLModel(filteredData, config, data.columns);
      setTrainedModel(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsTraining(false);
    }
  };

  const resetModel = () => {
    setTrainedModel(null);
    setTargetColumn('');
    setFeatureColumns([]);
    setError(null);
  };

  const applyPredictions = () => {
    if (trainedModel && onApplyPredictions) {
      onApplyPredictions(trainedModel.predictions);
    }
  };

  return (
    <Card>
      <CardHeader className="p-responsive">
        <CardTitle className="text-responsive-lg flex items-center justify-between">
          <div className="flex items-center gap-responsive-sm">
            <Brain className="h-responsive-input w-responsive-input text-primary" />
            Machine Learning
            <Badge variant="secondary" className="text-responsive-xs">
              {filteredData.length.toLocaleString()} registros
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="button-responsive">
            <X className="h-responsive-input w-responsive-input" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-responsive">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-responsive-xs">
            <TabsTrigger value="setup" className="text-responsive-xs">
              Configuración
            </TabsTrigger>
            <TabsTrigger value="results" className="text-responsive-xs" disabled={!trainedModel}>
              Resultados
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-responsive-xs" disabled={!trainedModel}>
              Predicciones
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-responsive">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-responsive-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-responsive">
              {/* Model Type Selection */}
              <div>
                <Label className="text-responsive-sm font-medium">Tipo de Modelo</Label>
                <Select value={modelType} onValueChange={(value: 'linear_regression' | 'naive_bayes') => setModelType(value)}>
                  <SelectTrigger className="control-responsive mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear_regression">Regresión Lineal</SelectItem>
                    <SelectItem value="naive_bayes">Clasificación (Naive Bayes)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-responsive-xs text-muted-foreground mt-1">
                  {modelType === 'linear_regression' 
                    ? 'Predice valores numéricos continuos'
                    : 'Clasifica datos en categorías discretas'
                  }
                </div>
              </div>

              {/* Target Column Selection */}
              <div>
                <Label className="text-responsive-sm font-medium">Columna Objetivo</Label>
                <Select value={targetColumn} onValueChange={setTargetColumn}>
                  <SelectTrigger className="control-responsive mt-1">
                    <SelectValue placeholder="Seleccionar columna objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTargets.map(col => (
                      <SelectItem key={col.key} value={col.key}>
                        <div className="flex items-center gap-2">
                          <span>{col.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {col.type}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-responsive-xs text-muted-foreground mt-1">
                  La variable que el modelo intentará predecir
                </div>
              </div>

              {/* Feature Selection */}
              <div>
                <Label className="text-responsive-sm font-medium">
                  Características (Features)
                  <Badge variant="outline" className="ml-2 text-responsive-xs">
                    {featureColumns.length} seleccionadas
                  </Badge>
                </Label>
                <ScrollArea className="h-40 border rounded-lg mt-1">
                  <div className="p-responsive-sm space-y-2">
                    {availableFeatures.map(col => (
                      <div key={col.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={col.key}
                          checked={featureColumns.includes(col.key)}
                          onCheckedChange={(checked) => handleFeatureToggle(col.key, !!checked)}
                        />
                        <Label htmlFor={col.key} className="text-responsive-sm flex-1 cursor-pointer">
                          {col.label}
                        </Label>
                        <Badge variant="secondary" className="text-responsive-xs">
                          {col.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="text-responsive-xs text-muted-foreground mt-1">
                  Variables que el modelo usará para hacer predicciones
                </div>
              </div>

              {/* Train/Test Split */}
              <div>
                <Label className="text-responsive-sm font-medium">
                  División Entrenamiento/Prueba: {Math.round(trainTestSplit * 100)}% / {Math.round((1 - trainTestSplit) * 100)}%
                </Label>
                <Slider
                  value={[trainTestSplit]}
                  onValueChange={(value) => setTrainTestSplit(value[0])}
                  min={0.5}
                  max={0.95}
                  step={0.05}
                  className="mt-2"
                />
                <div className="text-responsive-xs text-muted-foreground mt-1">
                  Porcentaje de datos para entrenamiento vs evaluación
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-responsive-sm pt-responsive">
                <Button
                  onClick={handleTrainModel}
                  disabled={isTraining || !targetColumn || featureColumns.length === 0}
                  className="flex-1 gap-1"
                >
                  {isTraining ? (
                    <>
                      <RefreshCw className="h-responsive-input w-responsive-input animate-spin" />
                      Entrenando...
                    </>
                  ) : (
                    <>
                      <Play className="h-responsive-input w-responsive-input" />
                      Entrenar Modelo
                    </>
                  )}
                </Button>
                {trainedModel && (
                  <Button variant="outline" onClick={resetModel} className="gap-1">
                    <RefreshCw className="h-responsive-input w-responsive-input" />
                    Nuevo
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-responsive">
            {trainedModel && (
              <div className="space-y-responsive">
                <div className="flex items-center justify-between">
                  <h3 className="text-responsive-base font-medium">
                    {formatModelType(trainedModel.config.modelType)}
                  </h3>
                  <Badge variant="default" className="text-responsive-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Entrenado
                  </Badge>
                </div>

                {/* Model Configuration */}
                <Card>
                  <CardContent className="p-responsive-sm">
                    <div className="grid grid-cols-2 gap-responsive text-responsive-sm">
                      <div>
                        <span className="text-muted-foreground">Objetivo:</span>
                        <div className="font-medium">{trainedModel.config.targetColumn}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Features:</span>
                        <div className="font-medium">{trainedModel.config.featureColumns.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Datos entrenamiento:</span>
                        <div className="font-medium">
                          {Math.round(filteredData.length * trainedModel.config.trainTestSplit)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Datos prueba:</span>
                        <div className="font-medium">
                          {filteredData.length - Math.round(filteredData.length * trainedModel.config.trainTestSplit)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-responsive-base">Métricas de Rendimiento</CardTitle>
                  </CardHeader>
                  <CardContent className="p-responsive-sm">
                    {trainedModel.config.modelType === 'linear_regression' ? (
                      <div className="space-y-responsive-sm">
                        {(() => {
                          const metrics = trainedModel.modelMetrics as LinearRegressionResult;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">R² (Coeficiente de Determinación)</span>
                                <div className="flex items-center gap-responsive-sm">
                                  <Progress value={metrics.rSquared * 100} className="w-20 h-2" />
                                  <span className="text-responsive-sm font-mono">
                                    {metrics.rSquared.toFixed(3)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">Error Cuadrático Medio (MSE)</span>
                                <span className="text-responsive-sm font-mono">
                                  {metrics.mse.toFixed(3)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">Error Absoluto Medio (MAE)</span>
                                <span className="text-responsive-sm font-mono">
                                  {metrics.mae.toFixed(3)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">Pendiente</span>
                                <span className="text-responsive-sm font-mono">
                                  {metrics.slope.toFixed(3)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">Intercepto</span>
                                <span className="text-responsive-sm font-mono">
                                  {metrics.intercept.toFixed(3)}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-responsive-sm">
                        {(() => {
                          const metrics = trainedModel.modelMetrics as ClassificationResult;
                          return (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-responsive-sm">Precisión Global</span>
                                <div className="flex items-center gap-responsive-sm">
                                  <Progress value={metrics.accuracy * 100} className="w-20 h-2" />
                                  <span className="text-responsive-sm font-mono">
                                    {formatAccuracy(metrics.accuracy)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="mt-responsive">
                                <div className="text-responsive-sm font-medium mb-2">Métricas por Clase</div>
                                <div className="space-y-1">
                                  {Object.keys(metrics.precision).map(className => (
                                    <div key={className} className="text-responsive-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{className}</span>
                                        <div className="flex gap-responsive-sm text-xs">
                                          <span>P: {(metrics.precision[className] * 100).toFixed(1)}%</span>
                                          <span>R: {(metrics.recall[className] * 100).toFixed(1)}%</span>
                                          <span>F1: {(metrics.f1Score[className] * 100).toFixed(1)}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-responsive">
            {trainedModel && (
              <div className="space-y-responsive">
                <div className="flex items-center justify-between">
                  <h3 className="text-responsive-base font-medium">
                    Predicciones en Datos de Prueba
                  </h3>
                  <div className="flex items-center gap-responsive-sm">
                    <Badge variant="outline" className="text-responsive-xs">
                      {trainedModel.predictions.length} predicciones
                    </Badge>
                    {onApplyPredictions && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={applyPredictions}
                        className="button-responsive gap-1"
                      >
                        <Target className="h-responsive-input w-responsive-input" />
                        Aplicar a Tabla
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-80">
                  <div className="space-y-responsive-sm">
                    {trainedModel.predictions.slice(0, 50).map((prediction, index) => (
                      <Card key={index} className="border-l-4 border-l-primary/20">
                        <CardContent className="p-responsive-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-responsive-sm">
                              <Badge variant="outline" className="text-responsive-xs">
                                Fila {prediction.rowIndex + 1}
                              </Badge>
                              <span className="text-responsive-sm">
                                Real: <span className="font-mono">{prediction.actualValue}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-responsive-sm">
                              <span className="text-responsive-sm">
                                Predicho: <span className="font-mono">{
                                  typeof prediction.predictedValue === 'number' 
                                    ? prediction.predictedValue.toFixed(2)
                                    : prediction.predictedValue
                                }</span>
                              </span>
                              {prediction.residual !== undefined && (
                                <Badge 
                                  variant={Math.abs(prediction.residual) < 1 ? 'default' : 'secondary'}
                                  className="text-responsive-xs"
                                >
                                  Error: {prediction.residual.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {trainedModel.predictions.length > 50 && (
                      <div className="text-center text-responsive-sm text-muted-foreground py-responsive">
                        ... y {trainedModel.predictions.length - 50} predicciones más
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
