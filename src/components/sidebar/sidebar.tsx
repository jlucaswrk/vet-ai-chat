"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  Trash2,
  Key,
  Moon,
  Sun,
  Menu,
  CheckCircle2,
  XCircle,
  Stethoscope,
  BookOpen,
  Loader2,
  Github,
} from "lucide-react";
import { useTheme } from "next-themes";
import { PDFDocument } from "@/lib/types";

interface SidebarProps {
  documents: PDFDocument[];
  onDocumentsChange: (docs: PDFDocument[]) => void;
  apiKey: string | null;
  onApiKeyChange: (key: string | null) => void;
  showApiKeyDialog: boolean;
  onShowApiKeyDialogChange: (show: boolean) => void;
}

export function Sidebar({
  documents,
  onDocumentsChange,
  apiKey,
  onApiKeyChange,
  showApiKeyDialog,
  onShowApiKeyDialogChange,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao fazer upload");
        }

        setUploadProgress(100);

        const newDocument: PDFDocument = {
          id: crypto.randomUUID(),
          name: data.name,
          content: data.content,
          uploadedAt: new Date(),
        };

        onDocumentsChange([...documents, newDocument]);

        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Erro desconhecido"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [documents, onDocumentsChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter((doc) => doc.id !== id));
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      onApiKeyChange(tempApiKey.trim());
      localStorage.setItem("vet-ai-api-key", tempApiKey.trim());
    }
    onShowApiKeyDialogChange(false);
    setTempApiKey("");
  };

  const handleRemoveApiKey = () => {
    onApiKeyChange(null);
    localStorage.removeItem("vet-ai-api-key");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text">VetAI</h1>
            <p className="text-xs text-muted-foreground">
              Assistente Veterinário
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        {/* API Key Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">OpenAI API Key</span>
          </div>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              {apiKey ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Configurada</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveApiKey}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm">Não configurada</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onShowApiKeyDialogChange(true)}
                    className="h-8"
                  >
                    Configurar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator className="mb-6" />

        {/* Upload Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Material de Estudo</span>
          </div>

          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }
              ${isUploading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Processando PDF...
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Solte o arquivo aqui..."
                    : "Arraste um PDF ou clique para selecionar"}
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {uploadError}
            </p>
          )}
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-muted-foreground">
              Documentos Carregados ({documents.length})
            </span>
            {documents.map((doc) => (
              <Card key={doc.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.content.length / 1000).toFixed(1)}k caracteres
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-80 border-r bg-card h-screen flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* API Key Dialog */}
      <Dialog
        open={showApiKeyDialog}
        onOpenChange={onShowApiKeyDialogChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar OpenAI API Key</DialogTitle>
            <DialogDescription>
              Insira sua chave de API da OpenAI para usar o assistente
              veterinário. A chave será salva localmente no seu navegador.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave em{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onShowApiKeyDialogChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!tempApiKey.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
