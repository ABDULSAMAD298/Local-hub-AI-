"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { Media } from "@/lib/types";

export function MediaCard({
  media,
  onChanged,
  onEdit,
}: {
  media: Media;
  onChanged: () => void;
  onEdit: () => void;
}) {
  const supabase = useSupabase();
  const [active, setActive] = useState(media.active);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function toggleActive(next: boolean) {
    setActive(next);
    const { error } = await supabase.from("media").update({ active: next }).eq("id", media.id);
    if (error) {
      toast.error(error.message);
      setActive(!next);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("media").delete().eq("id", media.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Item deleted");
    setConfirmOpen(false);
    onChanged();
  }

  return (
    <div className="overflow-hidden rounded-card border border-border bg-bg-secondary transition-shadow hover:shadow-accent-glow">
      <div className="group relative h-40 bg-bg-tertiary">
        {media.file_type === "video" ? (
          <video
            src={media.file_url}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={media.file_url} alt={media.title} className="h-full w-full object-cover" />
        )}
        <Badge
          variant="secondary"
          className="absolute left-2 top-2 uppercase tracking-wide"
        >
          {media.file_type}
        </Badge>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-text-primary">{media.title}</p>
          {media.price !== null && (
            <Badge>AED {media.price.toLocaleString()}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={toggleActive} />
            <span className="text-xs text-text-secondary">{active ? "Active" : "Hidden"}</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="rounded-control p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-control p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-error"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{media.title}&rdquo;. This can&rsquo;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
