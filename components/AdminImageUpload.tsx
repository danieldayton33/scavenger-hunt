'use client';

import { useRef, useState } from 'react';
import { Button } from './ui/button';

type UploadType = 'hunt-item' | 'hunt';

export interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  uploadType: UploadType;
  huntId?: number;
  itemId?: number;
  slug?: string;
  disabled?: boolean;
}

export function AdminImageUpload({
  value,
  onChange,
  uploadType,
  huntId,
  itemId,
  slug,
  disabled = false,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.set('file', file);
      formData.set('type', uploadType);
      if (uploadType === 'hunt-item') {
        if (huntId != null) formData.set('huntId', String(huntId));
        if (itemId != null) formData.set('itemId', String(itemId));
      } else {
        if (slug) formData.set('slug', slug);
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (typeof data.url === 'string') {
        onChange(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white file:text-sm"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
          >
            Remove image
          </Button>
        )}
      </div>
      {uploading && <p className="text-sm text-muted-foreground">Uploading…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="max-h-40 rounded border object-contain"
          />
        </div>
      )}
    </div>
  );
}
