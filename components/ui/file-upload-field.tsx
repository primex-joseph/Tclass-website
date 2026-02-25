"use client";

import { useId, useRef } from "react";
import { FileText, ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FileUploadFieldProps = {
  label: string;
  file: File | null;
  accept?: string;
  helperText?: string;
  className?: string;
  onFileChange: (file: File | null) => void;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileUploadField({
  label,
  file,
  accept,
  helperText = "Accepted: image files (all formats) or PDF, max 5MB.",
  className,
  onFileChange,
}: FileUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = Boolean(file?.type?.startsWith("image/"));

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId}>{label}</Label>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm transition dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/90 px-3 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-white/15 dark:bg-white/5 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/10"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                {file ? "Change file" : "Choose file"}
              </span>
              <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                {file ? file.name : helperText}
              </span>
            </span>
          </button>

          {file ? (
            <div className="flex items-center gap-2 sm:shrink-0">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {isImage ? <ImageIcon className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                <span className="max-w-[11rem] truncate">{file.name}</span>
                <span className="text-slate-400">•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-xl"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = "";
                  onFileChange(null);
                }}
                aria-label={`Remove ${label} file`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        {file ? `Selected: ${file.name}` : helperText}
      </p>
    </div>
  );
}
