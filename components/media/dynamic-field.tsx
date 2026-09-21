"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/media/tag-input";
import type { BusinessTypeConfigField } from "@/lib/types";

export function DynamicField({
  field,
  value,
  onChange,
  error,
}: {
  field: BusinessTypeConfigField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const label = (
    <div className="flex items-baseline justify-between">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="ml-0.5 text-error">*</span>}
      </Label>
      {field.type === "textarea" && typeof value === "string" && (
        <span className="text-xs text-text-muted">{value.length}/1000</span>
      )}
    </div>
  );

  return (
    <div className="space-y-1.5">
      {label}

      {(field.type === "text" || field.type === "url" || field.type === "number") && (
        <Input
          id={field.key}
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          placeholder={field.placeholder}
          value={(value as string | number | undefined) ?? ""}
          onChange={(e) =>
            onChange(field.type === "number" ? e.target.valueAsNumber || undefined : e.target.value)
          }
        />
      )}

      {field.type === "date" && (
        <Input
          id={field.key}
          type="date"
          value={(value as string | undefined) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          id={field.key}
          rows={3}
          maxLength={1000}
          placeholder={field.placeholder}
          value={(value as string | undefined) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === "select" && (
        <Select value={(value as string | undefined) ?? ""} onValueChange={onChange}>
          <SelectTrigger id={field.key}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "tags" && (
        <TagInput
          value={(value as string[] | undefined) ?? []}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      )}

      {field.type === "toggle" && (
        <div className="flex items-center gap-2 pt-1">
          <Switch
            id={field.key}
            checked={Boolean(value)}
            onCheckedChange={onChange}
          />
        </div>
      )}

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
