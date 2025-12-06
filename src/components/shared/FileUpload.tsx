'use client';
import { useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type FileUploadProps = {
  onFileSelect: (file: File | null) => void;
  className?: string;
};

export function FileUpload({ onFileSelect, className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    setFile(droppedFile);
    onFileSelect(droppedFile);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  if (file) {
    return (
      <div className={cn("p-4 rounded-lg border border-dashed flex items-center justify-between", className)}>
        <div className="flex items-center gap-3">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={removeFile}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-colors",
        isDragging ? "border-primary bg-primary/10" : "border-input",
        className
      )}
    >
      <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-center text-muted-foreground mb-2">
        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 800x400px)</p>
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
    </div>
  );
}
