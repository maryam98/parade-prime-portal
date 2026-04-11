import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
}

const ImageUpload = ({ value, onChange, folder = 'general', className = '' }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage.from('media').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(fileName);
    onChange(urlData.publicUrl);
    setUploading(false);

    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-40 object-cover rounded-lg border border-border" />
          <div className="absolute inset-0 bg-accent/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="p-2 bg-background/80 rounded-lg text-foreground hover:bg-background transition-colors">
              <Upload className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleRemove}
              className="p-2 bg-destructive/80 rounded-lg text-destructive-foreground hover:bg-destructive transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/30 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Click to upload image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
