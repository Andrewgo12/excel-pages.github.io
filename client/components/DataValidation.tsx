import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExcelColumn } from '@shared/excel-types';
import { 
  ValidationRule, 
  validateData, 
  getValidationTemplates,
  generateAutoValidationRules,
  QualityReport
} from '@/utils/dataValidation';
import { Shield, AlertTriangle, Info, CheckCircle, X, Plus, Play, Zap, BarChart3 } from 'lucide-react';

interface DataValidationProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
}

export const DataValidation: React.FC<DataValidationProps> = ({
  data,
  columns,
  selectedColumns
}) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<ValidationRule>>({});
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);

  const availableColumns = columns.filter(col => selectedColumns.includes(col.key));
  const templates = getValidationTemplates();

  // Run validation
  const runValidation = () => {
    if (validationRules.length === 0) {
      alert('Agrega al menos una regla de validación');
      return;
    }
    
    const report = validateData(data, validationRules, columns);
    setQualityReport(report);
  };

  // Auto-generate validation rules
  const generateAutoRules = () => {
    const autoRules = generateAutoValidationRules(data, availableColumns);
    setValidationRules([...validationRules, ...autoRules]);
  };

  // Add validation rule
  const addValidationRule = () => {
    if (!newRule.name || !newRule.column || !newRule.type) return;
    
    const rule: ValidationRule = {
      id: Date.now().toString(),
      name: newRule.name,
      column: newRule.column,
      type: newRule.type as any,
      parameters: newRule.parameters || {},
      severity: newRule.severity || 'error',
      description: newRule.description
    };
    
    setValidationRules([...validationRules, rule]);
    setNewRule({});
  };

  // Remove validation rule
  const removeValidationRule = (id: string) => {
    setValidationRules(validationRules.filter(r => r.id !== id));
  };

  // Load template rule
  const loadTemplate = (template: Partial<ValidationRule>) => {
    setNewRule({
      ...template,
      column: availableColumns[0]?.key || ''
    });
  };

  // Filter issues for display
  const filteredIssues = useMemo(() => {
    if (!qualityReport) return [];
    
    let issues = qualityReport.issues;
    
    if (showOnlyIssues) {
      issues = issues.filter(issue => issue.severity === 'error');
    }
    
    return issues.slice(0, 100); // Limit for performance
  }, [qualityReport, showOnlyIssues]);

  // Get severity icon and color
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const renderRulesTab = () => (
    <div className="space-y-4">
      {/* Add New Rule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Nueva Regla de Validación
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generateAutoRules}>
                <Zap className="h-4 w-4 mr-2" />
                Auto-generar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Nombre de la regla</Label>
              <Input
                value={newRule.name || ''}
                onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                placeholder="Ej: Email válido"
              />
            </div>
            
            <div>
              <Label>Columna</Label>
              <Select 
                value={newRule.column || ''} 
                onValueChange={(value) => setNewRule({...newRule, column: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(col => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tipo de validación</Label>
              <Select 
                value={newRule.type || ''} 
                onValueChange={(value: any) => setNewRule({...newRule, type: value, parameters: {}})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Campo requerido</SelectItem>
                  <SelectItem value="format">Formato específico</SelectItem>
                  <SelectItem value="range">Rango numérico</SelectItem>
                  <SelectItem value="length">Longitud de texto</SelectItem>
                  <SelectItem value="pattern">Patrón personalizado</SelectItem>
                  <SelectItem value="enum">Valores permitidos</SelectItem>
                  <SelectItem value="unique">Valores únicos</SelectItem>
                  <SelectItem value="date_range">Rango de fechas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Severidad</Label>
              <Select 
                value={newRule.severity || 'error'} 
                onValueChange={(value: any) => setNewRule({...newRule, severity: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Dynamic parameters based on validation type */}
            {newRule.type === 'format' && (
              <div>
                <Label>Formato</Label>
                <Select 
                  value={newRule.parameters?.format || ''} 
                  onValueChange={(value) => setNewRule({
                    ...newRule, 
                    parameters: {...newRule.parameters, format: value}
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Teléfono</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="date">Fecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {newRule.type === 'range' && (
              <>
                <div>
                  <Label>Valor mínimo</Label>
                  <Input
                    type="number"
                    value={newRule.parameters?.min || ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      parameters: {...newRule.parameters, min: Number(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <Label>Valor máximo</Label>
                  <Input
                    type="number"
                    value={newRule.parameters?.max || ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      parameters: {...newRule.parameters, max: Number(e.target.value)}
                    })}
                  />
                </div>
              </>
            )}
            
            {newRule.type === 'length' && (
              <>
                <div>
                  <Label>Longitud mínima</Label>
                  <Input
                    type="number"
                    value={newRule.parameters?.min || ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      parameters: {...newRule.parameters, min: Number(e.target.value)}
                    })}
                  />
                </div>
                <div>
                  <Label>Longitud máxima</Label>
                  <Input
                    type="number"
                    value={newRule.parameters?.max || ''}
                    onChange={(e) => setNewRule({
                      ...newRule,
                      parameters: {...newRule.parameters, max: Number(e.target.value)}
                    })}
                  />
                </div>
              </>
            )}
            
            {newRule.type === 'pattern' && (
              <div>
                <Label>Expresión regular</Label>
                <Input
                  value={newRule.parameters?.pattern || ''}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    parameters: {...newRule.parameters, pattern: e.target.value}
                  })}
                  placeholder="^[A-Z]{2}[0-9]{6}$"
                />
              </div>
            )}
            
            {newRule.type === 'enum' && (
              <div>
                <Label>Valores permitidos (separados por coma)</Label>
                <Input
                  value={newRule.parameters?.allowedValues?.join(', ') || ''}
                  onChange={(e) => setNewRule({
                    ...newRule,
                    parameters: {
                      ...newRule.parameters,
                      allowedValues: e.target.value.split(',').map(v => v.trim())
                    }
                  })}
                  placeholder="Activo, Inactivo, Pendiente"
                />
              </div>
            )}
            
            <div className="flex items-end">
              <Button 
                onClick={addValidationRule}
                disabled={!newRule.name || !newRule.column || !newRule.type}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Regla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plantillas de Validación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(template)}
                className="text-left h-auto p-3"
              >
                <div>
                  <div className="font-medium text-xs">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Reglas de Validación ({validationRules.length})
            {validationRules.length > 0 && (
              <Button onClick={runValidation}>
                <Play className="h-4 w-4 mr-2" />
                Ejecutar Validación
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {validationRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay reglas de validación configuradas
            </div>
          ) : (
            <div className="space-y-3">
              {validationRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getSeverityIcon(rule.severity)}
                      <span className="font-medium">{rule.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {rule.column}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {rule.description || `Validación de tipo: ${rule.type}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeValidationRule(rule.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderResultsTab = () => {
    if (!qualityReport) {
      return (
        <div className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Ejecuta la validación para ver los resultados
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Quality Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen de Calidad de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {qualityReport.summary.validRows}
                </div>
                <div className="text-sm text-muted-foreground">Filas válidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {qualityReport.summary.invalidRows}
                </div>
                <div className="text-sm text-muted-foreground">Filas con errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {qualityReport.summary.warningRows}
                </div>
                <div className="text-sm text-muted-foreground">Filas con advertencias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {qualityReport.summary.qualityScore}%
                </div>
                <div className="text-sm text-muted-foreground">Puntuación de calidad</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Calidad general</span>
                <span>{qualityReport.summary.qualityScore}%</span>
              </div>
              <Progress value={qualityReport.summary.qualityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Column Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calidad por Columna</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Columna</TableHead>
                    <TableHead>Valores válidos</TableHead>
                    <TableHead>Errores</TableHead>
                    <TableHead>Advertencias</TableHead>
                    <TableHead>Calidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(qualityReport.columnQuality).map(([column, quality]) => (
                    <TableRow key={column}>
                      <TableCell className="font-medium">{column}</TableCell>
                      <TableCell>{quality.validValues}/{quality.totalValues}</TableCell>
                      <TableCell>
                        {quality.errorCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {quality.errorCount}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {quality.warningCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {quality.warningCount}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={quality.qualityScore} className="h-2 flex-1" />
                          <span className="text-sm w-12">{Math.round(quality.qualityScore)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Problemas Detectados ({qualityReport.issues.length})
              <div className="flex items-center gap-2">
                <Label className="text-sm">Solo errores:</Label>
                <input
                  type="checkbox"
                  checked={showOnlyIssues}
                  onChange={(e) => setShowOnlyIssues(e.target.checked)}
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <p>¡No se encontraron problemas!</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severidad</TableHead>
                      <TableHead>Fila</TableHead>
                      <TableHead>Columna</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Problema</TableHead>
                      <TableHead>Sugerencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {getSeverityIcon(issue.severity)}
                        </TableCell>
                        <TableCell>{issue.rowIndex + 1}</TableCell>
                        <TableCell className="font-medium">{issue.column}</TableCell>
                        <TableCell className="max-w-32 truncate">
                          {String(issue.value || '')}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {issue.message}
                        </TableCell>
                        <TableCell className="max-w-48 truncate text-xs text-muted-foreground">
                          {issue.suggestion}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="rules" className="w-full">
        <TabsList>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-2" />
            Reglas de Validación
          </TabsTrigger>
          <TabsTrigger value="results">
            <BarChart3 className="h-4 w-4 mr-2" />
            Resultados
            {qualityReport && (
              <Badge variant="secondary" className="ml-2">
                {qualityReport.issues.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules">
          {renderRulesTab()}
        </TabsContent>
        
        <TabsContent value="results">
          {renderResultsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
