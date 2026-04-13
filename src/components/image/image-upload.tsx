'use client';

import { useCallback, useState, useRef } from 'react';

interface ImageUploadProps {
  image: string | null; // base64
  onImageChange: (base64: string | null) => void;
}

export function ImageUpload({ image, onImageChange }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/...;base64, 부분 제거
      const base64 = result.split(',')[1];
      onImageChange(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) processFile(file);
        break;
      }
    }
  }, [processFile]);

  if (image) {
    return (
      <div className="relative rounded-xl border border-border bg-card overflow-hidden">
        <img
          src={`data:image/jpeg;base64,${image}`}
          alt="업로드된 이미지"
          className="max-h-80 w-full object-contain bg-black/5 dark:bg-white/5"
        />
        <button
          onClick={() => onImageChange(null)}
          className="absolute top-2 right-2 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5 text-xs font-medium border border-border hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          이미지 제거
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onPaste={handlePaste}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/40 hover:bg-accent/30'
      }`}
    >
      <svg className="h-10 w-10 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
        <p className="text-xs text-muted-foreground mt-1">또는 Ctrl+V로 붙여넣기 (최대 10MB)</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
        }}
      />
    </div>
  );
}
