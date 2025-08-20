import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExcelColumn } from "@shared/excel-types";
import {
  TransformationRule,
  applyTransformationRule,
  applyBulkDelete,
  applyBulkUpdate,
  applyBulkDuplicate,
  cleanData,
  generateTransformationPreview,
} from "@/utils/bulkOperations";
import {
  Wand2,
  Trash2,
  Copy,
  Edit,
  Sparkles,
  Eye,
  Play,
  X,
  Plus,
} from "lucide-react";

interface BulkOperationsProps {
  data: Record<string, any>[];
  columns: ExcelColumn[];
  selectedColumns: string[];
  onDataChange: (newData: Record<string, any>[]) => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  data,
  columns,
  selectedColumns,
  onDataChange,
}) => {
  const [activeTab, setActiveTab] = useState<"transform" | "bulk" | "clean">(
    "transform",
  );
  const [transformations, setTransformations] = useState<TransformationRule[]>(
    [],
  );
  const [newTransformation, setNewTransformation] = useState<
    Partial<TransformationRule>
  >({});
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewRule, setPreviewRule] = useState<TransformationRule | null>(
    null,
  );

  // Bulk operations state
  const [bulkOperation, setBulkOperation] = useState<
    "delete" | "update" | "duplicate"
  >("delete");
  const [bulkFilter, setBulkFilter] = useState("");
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, any>>({});

  // Cleaning operations state
  const [cleaningOptions, setCleaningOptions] = useState({
    removeDuplicates: false,
    removeEmptyRows: false,
    trimWhitespace: false,
    fillEmptyValues: false,
  });
  const [fillValues, setFillValues] = useState<
    { column: string; value: any }[]
  >([]);

  const availableColumns = columns.filter((col) =>
    selectedColumns.includes(col.key),
  );
  const numericColumns = availableColumns.filter(
    (col) => col.type === "number",
  );
  const textColumns = availableColumns.filter((col) => col.type === "text");
  const dateColumns = availableColumns.filter((col) => col.type === "date");

  // Preview for transformation
  const transformationPreview = useMemo(() => {
    if (!previewRule) return null;
    return generateTransformationPreview(data, previewRule, columns, 5);
  }, [previewRule, data, columns]);

  const addTransformation = () => {
    if (
      !newTransformation.name ||
      !newTransformation.type ||
      !newTransformation.targetColumn
    )
      return;

    const rule: TransformationRule = {
      id: Date.now().toString(),
      name: newTransformation.name,
      type: newTransformation.type as any,
      sourceColumns: newTransformation.sourceColumns || [],
      targetColumn: newTransformation.targetColumn,
      parameters: newTransformation.parameters || {},
    };

    setTransformations([...transformations, rule]);
    setNewTransformation({});
  };

  const removeTransformation = (id: string) => {
    setTransformations(transformations.filter((t) => t.id !== id));
  };

  const applyTransformations = () => {
    let result = [...data];

    transformations.forEach((rule) => {
      result = applyTransformationRule(result, rule, columns);
    });

    onDataChange(result);
    setTransformations([]);
  };

  const applyBulkOperation = () => {
    if (!bulkFilter.trim()) return;

    try {
      // Create a simple condition based on the filter
      const condition = (row: Record<string, any>) => {
        return Object.values(row).some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(bulkFilter.toLowerCase()),
        );
      };

      let result;
      let message = "";

      switch (bulkOperation) {
        case "delete":
          result = applyBulkDelete(data, condition);
          message = `Se eliminaron ${result.deletedCount} filas`;
          onDataChange(result.data);
          break;
        case "update":
          result = applyBulkUpdate(data, condition, bulkUpdates);
          message = `Se actualizaron ${result.updatedCount} filas`;
          onDataChange(result.data);
          break;
        case "duplicate":
          result = applyBulkDuplicate(data, condition);
          message = `Se duplicaron ${result.duplicatedCount} filas`;
          onDataChange(result.data);
          break;
      }

      alert(message);
      setBulkFilter("");
      setBulkUpdates({});
    } catch (error) {
      alert("Error al aplicar la operación masiva");
    }
  };

  const applyDataCleaning = () => {
    const operations = {
      removeDuplicates: cleaningOptions.removeDuplicates,
      removeEmptyRows: cleaningOptions.removeEmptyRows,
      trimWhitespace: cleaningOptions.trimWhitespace,
      fillEmptyValues: cleaningOptions.fillEmptyValues ? fillValues : undefined,
    };

    const result = cleanData(data, operations);
    onDataChange(result.data);

    const summary = [
      result.cleaned.duplicates > 0
        ? `${result.cleaned.duplicates} duplicados eliminados`
        : "",
      result.cleaned.emptyRows > 0
        ? `${result.cleaned.emptyRows} filas vacías eliminadas`
        : "",
      result.cleaned.trimmed > 0
        ? `${result.cleaned.trimmed} espacios eliminados`
        : "",
      result.cleaned.filled > 0
        ? `${result.cleaned.filled} valores rellenados`
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    alert(`Limpieza completada: ${summary || "No se realizaron cambios"}`);
  };

  const renderTransformTab = () => (
    <div className="space-y-4">
      {/* Add New Transformation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva Transformación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={newTransformation.name || ""}
                onChange={(e) =>
                  setNewTransformation({
                    ...newTransformation,
                    name: e.target.value,
                  })
                }
                placeholder="Ej: Convertir a mayúsculas"
              />
            </div>

            <div>
              <Label>Tipo de Transformación</Label>
              <Select
                value={newTransformation.type || ""}
                onValueChange={(value: any) =>
                  setNewTransformation({ ...newTransformation, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="replace">
                    Reemplazar/Transformar
                  </SelectItem>
                  <SelectItem value="calculate">Calcular</SelectItem>
                  <SelectItem value="split">Dividir</SelectItem>
                  <SelectItem value="merge">Combinar</SelectItem>
                  <SelectItem value="format">Formatear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Columna Origen</Label>
              <Select
                value={newTransformation.sourceColumns?.[0] || ""}
                onValueChange={(value) =>
                  setNewTransformation({
                    ...newTransformation,
                    sourceColumns: [value],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar columna" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col.key} value={col.key}>
                      {col.label} ({col.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Columna Destino</Label>
              <Input
                value={newTransformation.targetColumn || ""}
                onChange={(e) =>
                  setNewTransformation({
                    ...newTransformation,
                    targetColumn: e.target.value,
                  })
                }
                placeholder="Nombre de nueva columna"
              />
            </div>

            {newTransformation.type === "replace" && (
              <>
                <div>
                  <Label>Operación</Label>
                  <Select
                    value={newTransformation.parameters?.operation || ""}
                    onValueChange={(value) =>
                      setNewTransformation({
                        ...newTransformation,
                        parameters: {
                          ...newTransformation.parameters,
                          operation: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uppercase">Mayúsculas</SelectItem>
                      <SelectItem value="lowercase">Minúsculas</SelectItem>
                      <SelectItem value="capitalize">Capitalizar</SelectItem>
                      <SelectItem value="trim">Eliminar espacios</SelectItem>
                      <SelectItem value="replace">Reemplazar texto</SelectItem>
                      <SelectItem value="round">Redondear</SelectItem>
                      <SelectItem value="multiply">Multiplicar</SelectItem>
                      <SelectItem value="add">Sumar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newTransformation.parameters?.operation === "replace" && (
                  <>
                    <div>
                      <Label>Buscar</Label>
                      <Input
                        value={newTransformation.parameters?.search || ""}
                        onChange={(e) =>
                          setNewTransformation({
                            ...newTransformation,
                            parameters: {
                              ...newTransformation.parameters,
                              search: e.target.value,
                            },
                          })
                        }
                        placeholder="Texto a buscar"
                      />
                    </div>
                    <div>
                      <Label>Reemplazar por</Label>
                      <Input
                        value={newTransformation.parameters?.replace || ""}
                        onChange={(e) =>
                          setNewTransformation({
                            ...newTransformation,
                            parameters: {
                              ...newTransformation.parameters,
                              replace: e.target.value,
                            },
                          })
                        }
                        placeholder="Texto de reemplazo"
                      />
                    </div>
                  </>
                )}

                {(newTransformation.parameters?.operation === "multiply" ||
                  newTransformation.parameters?.operation === "add") && (
                  <div>
                    <Label>Valor</Label>
                    <Input
                      type="number"
                      value={newTransformation.parameters?.value || ""}
                      onChange={(e) =>
                        setNewTransformation({
                          ...newTransformation,
                          parameters: {
                            ...newTransformation.parameters,
                            value: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
              </>
            )}

            {newTransformation.type === "calculate" && (
              <>
                <div>
                  <Label>Segunda Columna</Label>
                  <Select
                    value={newTransformation.sourceColumns?.[1] || ""}
                    onValueChange={(value) =>
                      setNewTransformation({
                        ...newTransformation,
                        sourceColumns: [
                          newTransformation.sourceColumns?.[0] || "",
                          value,
                        ],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Segunda columna" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((col) => (
                        <SelectItem key={col.key} value={col.key}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Operación</Label>
                  <Select
                    value={newTransformation.parameters?.operation || ""}
                    onValueChange={(value) =>
                      setNewTransformation({
                        ...newTransformation,
                        parameters: {
                          ...newTransformation.parameters,
                          operation: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Sumar</SelectItem>
                      <SelectItem value="subtract">Restar</SelectItem>
                      <SelectItem value="multiply">Multiplicar</SelectItem>
                      <SelectItem value="divide">Dividir</SelectItem>
                      <SelectItem value="percentage">Porcentaje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button
                onClick={addTransformation}
                disabled={
                  !newTransformation.name ||
                  !newTransformation.type ||
                  !newTransformation.targetColumn
                }
                className="mr-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>

              {newTransformation.name &&
                newTransformation.type &&
                newTransformation.targetColumn && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const rule: TransformationRule = {
                        id: "preview",
                        name: newTransformation.name!,
                        type: newTransformation.type as any,
                        sourceColumns: newTransformation.sourceColumns || [],
                        targetColumn: newTransformation.targetColumn!,
                        parameters: newTransformation.parameters || {},
                      };
                      setPreviewRule(rule);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </Button>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transformations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Transformaciones Pendientes ({transformations.length})
            {transformations.length > 0 && (
              <Button onClick={applyTransformations}>
                <Play className="h-4 w-4 mr-2" />
                Aplicar Todas
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transformations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay transformaciones pendientes
            </div>
          ) : (
            <div className="space-y-3">
              {transformations.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <div className="font-medium">{rule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {rule.sourceColumns.join(", ")} → {rule.targetColumn}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {rule.type}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewRule(rule);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTransformation(rule.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de Transformación</DialogTitle>
          </DialogHeader>
          {transformationPreview && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Vista previa de los primeros 5 registros:
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Antes</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transformationPreview.before.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.original.join(", ")}</TableCell>
                          <TableCell>{String(row.target || "")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Después</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origen</TableHead>
                        <TableHead>Destino</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transformationPreview.after.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.original.join(", ")}</TableCell>
                          <TableCell className="font-medium text-primary">
                            {String(row.target || "")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderBulkTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operaciones Masivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Operación</Label>
              <Select
                value={bulkOperation}
                onValueChange={(value: any) => setBulkOperation(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">Eliminar filas</SelectItem>
                  <SelectItem value="update">Actualizar filas</SelectItem>
                  <SelectItem value="duplicate">Duplicar filas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Filtro (las filas que contengan este texto)</Label>
              <Input
                value={bulkFilter}
                onChange={(e) => setBulkFilter(e.target.value)}
                placeholder="Ej: Madrid, 2024, Activo..."
              />
            </div>

            {bulkOperation === "update" && (
              <div>
                <Label>Actualizaciones</Label>
                <div className="space-y-2">
                  {availableColumns.slice(0, 3).map((col) => (
                    <div key={col.key} className="flex gap-2 items-center">
                      <Label className="w-32">{col.label}:</Label>
                      <Input
                        value={bulkUpdates[col.key] || ""}
                        onChange={(e) =>
                          setBulkUpdates({
                            ...bulkUpdates,
                            [col.key]: e.target.value,
                          })
                        }
                        placeholder={`Nuevo valor para ${col.label}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={applyBulkOperation}
              disabled={!bulkFilter.trim()}
              className="w-full"
            >
              {bulkOperation === "delete" && (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {bulkOperation === "update" && <Edit className="h-4 w-4 mr-2" />}
              {bulkOperation === "duplicate" && (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Aplicar Operación Masiva
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCleanTab = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Limpieza de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeDuplicates"
                  checked={cleaningOptions.removeDuplicates}
                  onCheckedChange={(checked) =>
                    setCleaningOptions({
                      ...cleaningOptions,
                      removeDuplicates: !!checked,
                    })
                  }
                />
                <Label htmlFor="removeDuplicates">
                  Eliminar filas duplicadas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeEmptyRows"
                  checked={cleaningOptions.removeEmptyRows}
                  onCheckedChange={(checked) =>
                    setCleaningOptions({
                      ...cleaningOptions,
                      removeEmptyRows: !!checked,
                    })
                  }
                />
                <Label htmlFor="removeEmptyRows">
                  Eliminar filas completamente vacías
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trimWhitespace"
                  checked={cleaningOptions.trimWhitespace}
                  onCheckedChange={(checked) =>
                    setCleaningOptions({
                      ...cleaningOptions,
                      trimWhitespace: !!checked,
                    })
                  }
                />
                <Label htmlFor="trimWhitespace">
                  Eliminar espacios en blanco extra
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fillEmptyValues"
                  checked={cleaningOptions.fillEmptyValues}
                  onCheckedChange={(checked) =>
                    setCleaningOptions({
                      ...cleaningOptions,
                      fillEmptyValues: !!checked,
                    })
                  }
                />
                <Label htmlFor="fillEmptyValues">Rellenar valores vacíos</Label>
              </div>
            </div>

            {cleaningOptions.fillEmptyValues && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Valores de Relleno</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableColumns.slice(0, 5).map((col) => (
                      <div key={col.key} className="flex gap-2 items-center">
                        <Label className="w-32">{col.label}:</Label>
                        <Input
                          value={
                            fillValues.find((f) => f.column === col.key)
                              ?.value || ""
                          }
                          onChange={(e) => {
                            const newFillValues = fillValues.filter(
                              (f) => f.column !== col.key,
                            );
                            if (e.target.value) {
                              newFillValues.push({
                                column: col.key,
                                value: e.target.value,
                              });
                            }
                            setFillValues(newFillValues);
                          }}
                          placeholder={`Valor por defecto para ${col.label}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={applyDataCleaning}
              disabled={!Object.values(cleaningOptions).some(Boolean)}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Limpiar Datos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "transform" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("transform")}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Transformaciones
        </Button>
        <Button
          variant={activeTab === "bulk" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("bulk")}
        >
          <Edit className="h-4 w-4 mr-2" />
          Operaciones Masivas
        </Button>
        <Button
          variant={activeTab === "clean" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("clean")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Limpieza
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "transform" && renderTransformTab()}
      {activeTab === "bulk" && renderBulkTab()}
      {activeTab === "clean" && renderCleanTab()}
    </div>
  );
};
