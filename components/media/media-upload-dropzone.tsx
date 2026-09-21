"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Video as VideoIcon } from "lucide-react";

import { useSupabase } from "@/components/providers/supabase-provider";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export interface UploadedFile {
  url: string;
  type: "video" | "image";
}

export function MediaUploadDropzone({
  businessId,
  value,
  onChange,
}: {
  businessId: string;
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}) {
  const supabase = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File is larger than 50MB");
      return;
    }
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) {
      toast.error("Only video or image files are supported");
      return;
    }

    const fileType: UploadedFile["type"] = file.type.startsWith("video/") ? "video" : "image";
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${businessId}/${crypto.randomUUID()}.${ext}`;

    setUploading(true);
    const { error } = await supabase.storage.from("media").upload(path, file);
    setUploading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange({ url: data.publicUrl, type: fileType });
  }

  if (value) {
    return (
      <div className="relative overflow-hidden rounded-card border border-border bg-bg-tertiary">
        {value.type === "video" ? (
          <video src={value.url} className="h-40 w-full object-cover" muted loop controls />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.url} alt="Uploaded media" className="h-40 w-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bg-primary/80 text-text-primary hover:bg-error/80"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-border bg-bg-tertiary py-10 text-center transition-colors",
        dragOver && "border-accent bg-accent/5"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {uploading ? (
        <>
          <div className="h-1.5 w-40 overflow-hidden rounded-full bg-bg-secondary">
            <div className="h-full w-1/3 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-accent" />
          </div>
          <p className="text-sm text-text-secondary">Uploading…</p>
        </>
      ) : (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-accent">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-text-primary">Drag & drop or click to upload</p>
          <p className="flex items-center gap-1 text-xs text-text-muted">
            <VideoIcon className="h-3 w-3" /> Video or image, up to 50MB
          </p>
        </>
      )}
    </div>
  );
}
