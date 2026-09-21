"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DynamicField } from "@/components/media/dynamic-field";
import { MediaUploadDropzone, type UploadedFile } from "@/components/media/media-upload-dropzone";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Business, BusinessTypeConfigField, Media } from "@/lib/types";

export function UploadModal({
  business,
  fields,
  mediaLabel,
  open,
  onOpenChange,
  media,
  onSaved,
}: {
  business: Business;
  fields: BusinessTypeConfigField[];
  mediaLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media?: Media | null;
  onSaved: () => void;
}) {
  const supabase = useSupabase();
  const [values, setValues] = useState<Record<string, unknown>>(() => media?.metadata ?? {});
  const [file, setFile] = useState<UploadedFile | null>(
    media ? { url: media.file_url, type: media.file_type } : null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function setFieldValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSave() {
    const nextErrors: Record<string, string> = {};
    for (const field of fields) {
      if (field.required && !values[field.key]) {
        nextErrors[field.key] = `${field.label} is required`;
      }
    }
    if (!file) {
      toast.error("Please upload a video or image");
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);

    const title = typeof values.title === "string" && values.title ? values.title : "Untitled";
    const price = typeof values.price === "number" ? values.price : null;
    const description = typeof values.description === "string" ? values.description : null;

    const payload = {
      business_id: business.id,
      business_type: business.business_type,
      title,
      price,
      description,
      file_url: file.url,
      file_type: file.type,
      active: media?.active ?? true,
      metadata: values,
    };

    const { error } = media
      ? await supabase.from("media").update(payload).eq("id", media.id)
      : await supabase.from("media").insert(payload);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(media ? "Item updated" : "Item added");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{media ? `Edit ${mediaLabel.slice(0, -1)}` : `Add ${mediaLabel.slice(0, -1)}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Media</Label>
            <MediaUploadDropzone businessId={business.id} value={file} onChange={setFile} />
          </div>

          {fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={values[field.key]}
              onChange={(value) => setFieldValue(field.key, value)}
              error={errors[field.key]}
            />
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
