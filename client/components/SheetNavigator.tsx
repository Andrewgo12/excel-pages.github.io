import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  FileSpreadsheet,
  Search,
  Filter,
  ArrowRight,
  BarChart3,
  Database,
  Eye,
  Link,
  Grid,
  ChevronDown,
  X,
  Layers,
  TrendingUp,
  Clock,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { ExcelData } from "@shared/excel-types";
import {
  SheetAnalysis,
  SheetRelationship,
  MultiSheetAnalysis,
} from "@/utils/multiSheetExcel";

interface SheetNavigatorProps {
  excelData: ExcelData;
  analysis: MultiSheetAnalysis;
  currentSheet: string;
  onSheetChange: (sheetName: string) => void;
  onClose: () => void;
  compact?: boolean;
}

export function SheetNavigator({
  excelData,
  analysis,
  currentSheet,
  onSheetChange,
  onClose,
  compact = false,
}: SheetNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "size" | "complexity">("name");
  const [filterBy, setFilterBy] = useState<
    "all" | "data" | "empty" | "related"
  >("all");
  const [showRelationships, setShowRelationships] = useState(false);

  // Filter and sort sheets
  const filteredSheets = useMemo(() => {
    let sheets = analysis.sheetAnalyses.filter((sheet) => {
      // Search filter
      if (
        searchTerm &&
        !sheet.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      switch (filterBy) {
        case "data":
          return !sheet.isEmpty && sheet.hasHeaders;
        case "empty":
          return sheet.isEmpty;
        case "related":
          return analysis.relationships.some(
            (rel) =>
              rel.sourceSheet === sheet.name || rel.targetSheet === sheet.name,
          );
        default:
          return true;
      }
    });

    // Sort sheets
    sheets.sort((a, b) => {
      switch (sortBy) {
        case "size":
          return b.rowCount - a.rowCount;
        case "complexity":
          return b.tableRegions.length - a.tableRegions.length;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sheets;
  }, [
    analysis.sheetAnalyses,
    analysis.relationships,
    searchTerm,
    sortBy,
    filterBy,
  ]);

  // Get relationships for current sheet
  const currentSheetRelationships = useMemo(() => {
    return analysis.relationships.filter(
      (rel) =>
        rel.sourceSheet === currentSheet || rel.targetSheet === currentSheet,
    );
  }, [analysis.relationships, currentSheet]);

  // Get sheet statistics
  const getSheetComplexity = (sheet: SheetAnalysis) => {
    if (sheet.isEmpty) return { level: "empty", color: "gray" };
    if (sheet.tableRegions.length === 0)
      return { level: "simple", color: "green" };
    if (sheet.tableRegions.length <= 2 && sheet.rowCount <= 1000)
      return { level: "moderate", color: "blue" };
    if (sheet.tableRegions.length <= 5 && sheet.rowCount <= 10000)
      return { level: "complex", color: "orange" };
    return { level: "very complex", color: "red" };
  };

  if (compact) {
    return (
      <div className="flex items-center gap-responsive-sm">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 max-w-48">
              <FileSpreadsheet className="h-responsive-input w-responsive-input" />
              <span className="truncate">{currentSheet}</span>
              <Badge variant="secondary" className="text-responsive-xs">
                {analysis.totalSheets}
              </Badge>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="start">
            <DropdownMenuLabel className="text-responsive-sm">
              Hojas del Archivo ({analysis.totalSheets})
            </DropdownMenuLabel>
            <div className="p-2">
              <Input
                placeholder="Buscar hoja..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <ScrollArea className="max-h-64">
              {filteredSheets.map((sheet) => {
                const complexity = getSheetComplexity(sheet);
                const isActive = sheet.name === currentSheet;

                return (
                  <DropdownMenuItem
                    key={sheet.name}
                    onClick={() => onSheetChange(sheet.name)}
                    className={`flex items-center justify-between p-2 ${isActive ? "bg-primary/10" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {sheet.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sheet.summary}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs bg-${complexity.color}-50 border-${complexity.color}-200`}
                      >
                        {sheet.rowCount.toLocaleString()}
                      </Badge>
                      {isActive && <Eye className="h-3 w-3 text-primary" />}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowRelationships(true)}>
              <Link className="h-4 w-4 mr-2" />
              Ver Relaciones ({analysis.relationships.length})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {currentSheetRelationships.length > 0 && (
          <Badge variant="outline" className="text-responsive-xs gap-1">
            <Link className="h-3 w-3" />
            {currentSheetRelationships.length} conexión
            {currentSheetRelationships.length !== 1 ? "es" : ""}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="p-responsive">
        <CardTitle className="text-responsive-lg flex items-center justify-between">
          <div className="flex items-center gap-responsive-sm">
            <Layers className="h-responsive-input w-responsive-input text-primary" />
            Navegador de Hojas
            <Badge variant="secondary" className="text-responsive-xs">
              {analysis.totalSheets} hojas
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="button-responsive"
          >
            <X className="h-responsive-input w-responsive-input" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-responsive">
        <Tabs defaultValue="sheets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-responsive-xs">
            <TabsTrigger value="sheets" className="text-responsive-xs">
              Hojas
            </TabsTrigger>
            <TabsTrigger value="relationships" className="text-responsive-xs">
              Relaciones
            </TabsTrigger>
            <TabsTrigger value="overview" className="text-responsive-xs">
              Resumen
            </TabsTrigger>
          </TabsList>

          {/* Sheets Tab */}
          <TabsContent value="sheets" className="space-y-responsive">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-responsive-sm">
              <div className="flex-1">
                <Input
                  placeholder="Buscar hojas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="control-responsive"
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-32 control-responsive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="size">Tamaño</SelectItem>
                  <SelectItem value="complexity">Complejidad</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterBy}
                onValueChange={(value: any) => setFilterBy(value)}
              >
                <SelectTrigger className="w-32 control-responsive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="data">Con datos</SelectItem>
                  <SelectItem value="empty">Vacías</SelectItem>
                  <SelectItem value="related">Relacionadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sheets List */}
            <ScrollArea className="h-96">
              <div className="space-y-responsive-sm">
                {filteredSheets.map((sheet) => {
                  const complexity = getSheetComplexity(sheet);
                  const isActive = sheet.name === currentSheet;
                  const hasRelationships = analysis.relationships.some(
                    (rel) =>
                      rel.sourceSheet === sheet.name ||
                      rel.targetSheet === sheet.name,
                  );

                  return (
                    <Card
                      key={sheet.name}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        isActive ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => onSheetChange(sheet.name)}
                    >
                      <CardContent className="p-responsive-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-responsive-sm min-w-0 flex-1">
                            <FileSpreadsheet className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-responsive-sm font-medium truncate">
                                {sheet.name}
                              </div>
                              <div className="text-responsive-xs text-muted-foreground">
                                {sheet.summary}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isActive && (
                              <Badge
                                variant="default"
                                className="text-responsive-xs"
                              >
                                Activa
                              </Badge>
                            )}
                            {hasRelationships && (
                              <Link className="h-3 w-3 text-blue-500" />
                            )}
                            {sheet.name === analysis.recommendedStartSheet && (
                              <Star className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-responsive text-responsive-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Filas:
                            </span>
                            <div className="font-medium">
                              {sheet.rowCount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Tablas:
                            </span>
                            <div className="font-medium">
                              {sheet.tableRegions.length}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Tamaño:
                            </span>
                            <div className="font-medium">
                              {sheet.estimatedSize}
                            </div>
                          </div>
                        </div>

                        {sheet.tableRegions.length > 0 && (
                          <div className="mt-2">
                            <Progress
                              value={sheet.tableRegions[0].confidence * 100}
                              className="h-1"
                            />
                            <div className="text-responsive-xs text-muted-foreground mt-1">
                              Confianza de estructura:{" "}
                              {(sheet.tableRegions[0].confidence * 100).toFixed(
                                0,
                              )}
                              %
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Relationships Tab */}
          <TabsContent value="relationships" className="space-y-responsive">
            <div className="flex items-center justify-between">
              <h3 className="text-responsive-base font-medium">
                Relaciones Detectadas
              </h3>
              <Badge variant="outline" className="text-responsive-xs">
                {analysis.relationships.length} relaciones
              </Badge>
            </div>

            {analysis.relationships.length === 0 ? (
              <Alert>
                <Link className="h-4 w-4" />
                <AlertDescription className="text-responsive-sm">
                  No se detectaron relaciones entre las hojas. Esto puede
                  deberse a que las hojas contienen datos independientes o
                  utilizan diferentes formatos de identificadores.
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-responsive-sm">
                  {analysis.relationships
                    .filter((rel) => rel.confidence > 0.1)
                    .map((relationship, index) => (
                      <Card key={index}>
                        <CardContent className="p-responsive-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-responsive-sm">
                              <div className="text-responsive-sm font-medium">
                                {relationship.sourceSheet}
                              </div>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <div className="text-responsive-sm font-medium">
                                {relationship.targetSheet}
                              </div>
                            </div>
                            <Badge
                              variant={
                                relationship.confidence > 0.7
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-responsive-xs"
                            >
                              {(relationship.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>

                          <div className="text-responsive-xs text-muted-foreground mb-2">
                            <strong>{relationship.sourceColumn}</strong> →{" "}
                            <strong>{relationship.targetColumn}</strong>
                          </div>

                          <div className="grid grid-cols-3 gap-responsive text-responsive-xs">
                            <div>
                              <span className="text-muted-foreground">
                                Tipo:
                              </span>
                              <div className="font-medium capitalize">
                                {relationship.relationship.replace("_", " ")}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Coincidencias:
                              </span>
                              <div className="font-medium">
                                {relationship.matchCount}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Porcentaje:
                              </span>
                              <div className="font-medium">
                                {relationship.matchPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSheetChange(relationship.sourceSheet)
                              }
                              className="button-responsive text-responsive-xs"
                            >
                              Ver Origen
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSheetChange(relationship.targetSheet)
                              }
                              className="button-responsive text-responsive-xs"
                            >
                              Ver Destino
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-responsive">
            <div className="grid grid-cols-2 gap-responsive">
              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="text-center">
                    <div className="text-responsive-lg font-bold text-primary">
                      {analysis.totalSheets}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Hojas totales
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="text-center">
                    <div className="text-responsive-lg font-bold text-green-600">
                      {analysis.totalRows.toLocaleString()}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Filas totales
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="text-center">
                    <div className="text-responsive-lg font-bold text-blue-600">
                      {analysis.relationships.length}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Relaciones detectadas
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-responsive-sm">
                  <div className="text-center">
                    <div className="text-responsive-lg font-bold text-orange-600 capitalize">
                      {analysis.estimatedComplexity.replace("_", " ")}
                    </div>
                    <div className="text-responsive-xs text-muted-foreground">
                      Complejidad
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-responsive-sm">
                  Hoja Recomendada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-responsive-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-responsive-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-responsive-sm font-medium">
                      {analysis.recommendedStartSheet}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      onSheetChange(analysis.recommendedStartSheet)
                    }
                    className="button-responsive"
                  >
                    Ir a esta hoja
                  </Button>
                </div>
                <div className="text-responsive-xs text-muted-foreground mt-2">
                  Esta hoja fue seleccionada automáticamente por tener la mejor
                  estructura de datos y mayor cantidad de información útil.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-responsive-sm">
                  Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-responsive-sm">
                <div className="flex items-center gap-responsive-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-responsive-sm">
                    Tiempo de procesamiento: {analysis.processingTime}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
