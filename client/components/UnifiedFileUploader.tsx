import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileSpreadsheet,
  FileText,
  File as FileIcon,
  Database,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
  Info,
} from "lucide-react";
import {
  processFile,
  getSupportedFormats,
  validateFile,
  FileProcessorResult,
} from "@/utils/fileProcessor";
import { ExcelData } from "@shared/excel-types";
import { generateSampleData } from "@/utils/sampleDataGenerator";
import { generateMultiSheetData } from "@/utils/multiSheetGenerator";

interface UnifiedFileUploaderProps {
  onDataLoaded: (data: ExcelData, metadata?: any) => void;
  onError: (error: string) => void;
  className?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  currentFile?: string;
  errors: string[];
  warnings: string[];
}

export const UnifiedFileUploader: React.FC<UnifiedFileUploaderProps> = ({
  onDataLoaded,
  onError,
  className = "",
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    errors: [],
    warnings: [],
  });
  const [showFormats, setShowFormats] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      setUploadState({
        isUploading: true,
        progress: 10,
        currentFile: file.name,
        errors: [],
        warnings: [],
      });

      try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.errors.join(", "));
        }

        setUploadState((prev) => ({ ...prev, progress: 30 }));

        // Process file
        const result = await processFile(file, {
          maxRows: 50000, // Reasonable limit for browser processing
          sampleSize: 1000,
          autoDetectDelimiter: true,
        });

        setUploadState((prev) => ({ ...prev, progress: 80 }));

        // Success
        setUploadState((prev) => ({
          ...prev,
          progress: 100,
          warnings: result.warnings,
          isUploading: false,
        }));

        // Pass data to parent
        onDataLoaded(result.data, result.metadata);

        // Clear success state after delay
        setTimeout(() => {
          setUploadState((prev) => ({
            ...prev,
            progress: 0,
            currentFile: undefined,
            warnings: [],
          }));
        }, 3000);
      } catch (error) {
        setUploadState({
          isUploading: false,
          progress: 0,
          currentFile: undefined,
          errors: [String(error)],
          warnings: [],
        });
        onError(String(error));
      }
    },
    [onDataLoaded, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploadState.isUploading,
    accept: {
      // Excel files
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      // Text files
      "text/csv": [".csv"],
      "text/tab-separated-values": [".tsv"],
      "text/plain": [".txt", ".tab", ".dat"],
      // JSON files
      "application/json": [".json"],
      "application/x-ndjson": [".jsonl", ".ndjson", ".ldjson"],
    },
  });

  const loadSampleData = (type: "basic" | "complex") => {
    try {
      const data =
        type === "basic" ? generateSampleData() : generateMultiSheetData();
      onDataLoaded(data, {
        originalFilename: `datos_${type === "basic" ? "basicos" : "completos"}.xlsx`,
        detectedFormat: "sample",
        stats: {
          totalRows: data.rows.length,
          totalColumns: data.columns.length,
        },
      });
    } catch (error) {
      onError(`Error cargando datos de ejemplo: ${error}`);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-6 w-6 text-green-600" />;
      case "csv":
      case "tsv":
        return <FileText className="h-6 w-6 text-blue-600" />;
      case "json":
      case "jsonl":
        return <Database className="h-6 w-6 text-purple-600" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  const supportedFormats = getSupportedFormats();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Upload Area */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Cargar Archivo de Datos
          </CardTitle>
          <p className="text-muted-foreground">
            Soporta múltiples formatos: Excel, CSV, JSON, TSV y más
          </p>
        </CardHeader>
        <CardContent>
          {/* Upload dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-105"
                  : uploadState.isUploading
                    ? "border-muted bg-muted/20 cursor-not-allowed"
                    : "border-border hover:border-primary/50 hover:bg-accent/20"
              }`}
          >
            <input {...getInputProps()} disabled={uploadState.isUploading} />

            <div className="flex flex-col items-center space-y-4">
              {uploadState.isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <div className="w-full max-w-xs">
                    <Progress value={uploadState.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {uploadState.currentFile &&
                        `Procesando: ${uploadState.currentFile}`}
                    </p>
                  </div>
                </>
              ) : uploadState.progress === 100 ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div className="text-center">
                    <p className="font-medium text-green-700">
                      Archivo cargado exitosamente
                    </p>
                    {uploadState.currentFile && (
                      <p className="text-sm text-muted-foreground">
                        {uploadState.currentFile}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600" />
                    <FileText className="h-8 w-8 mx-auto text-blue-600" />
                    <Database className="h-8 w-8 mx-auto text-purple-600" />
                  </div>
                  {isDragActive ? (
                    <p className="text-primary font-medium text-lg">
                      Suelta el archivo aquí...
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">
                        Arrastra y suelta tu archivo aquí o haz clic para
                        seleccionar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Excel (.xlsx, .xls), CSV, TSV, JSON, JSONL, TXT
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Máximo 100MB
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Errors and Warnings */}
          {uploadState.errors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {uploadState.errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {uploadState.warnings.length > 0 && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {uploadState.warnings.map((warning, index) => (
                    <div key={index}>{warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Supported Formats Toggle */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFormats(!showFormats)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4 mr-2" />
              {showFormats ? "Ocultar" : "Ver"} formatos soportados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Supported Formats Panel */}
      {showFormats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formatos Soportados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {supportedFormats.map((category, catIndex) => (
                <div key={catIndex}>
                  <h4 className="font-medium mb-3 text-primary">
                    {category.category}
                  </h4>
                  <div className="grid gap-4">
                    {category.formats.map((format, formatIndex) => (
                      <div
                        key={formatIndex}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {format.name === "Excel" && (
                              <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            )}
                            {(format.name === "CSV" ||
                              format.name === "TSV" ||
                              format.name === "Texto Delimitado") && (
                              <FileText className="h-5 w-5 text-blue-600" />
                            )}
                            {(format.name === "JSON" ||
                              format.name === "JSON Lines") && (
                              <Database className="h-5 w-5 text-purple-600" />
                            )}
                            <span className="font-medium">{format.name}</span>
                          </div>
                          <div className="flex gap-1">
                            {format.extensions.map((ext) => (
                              <Badge
                                key={ext}
                                variant="outline"
                                className="text-xs"
                              >
                                {ext}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {format.features.map((feature) => (
                            <Badge
                              key={feature}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            ¿Quieres probar sin cargar un archivo?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={() => loadSampleData("basic")}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              disabled={uploadState.isUploading}
            >
              <Database className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Datos Básicos</div>
                <div className="text-xs text-muted-foreground">
                  80 columnas • 500 filas
                </div>
              </div>
            </Button>

            <Button
              onClick={() => loadSampleData("complex")}
              className="h-auto p-4 flex flex-col items-center space-y-2"
              disabled={uploadState.isUploading}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-medium">Demo Completo</div>
                <div className="text-xs text-muted-foreground">
                  4 hojas • Datos empresariales
                </div>
              </div>
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Los datos de ejemplo te permiten explorar todas las
              funcionalidades
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedFileUploader;
