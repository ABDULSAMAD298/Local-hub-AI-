"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, ImageOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MediaCard } from "@/components/media/media-card";
import { UploadModal } from "@/components/media/upload-modal";
import { useBusiness } from "@/components/providers/business-provider";
import { useSupabase } from "@/components/providers/supabase-provider";
import type { BusinessTypeConfig, Media } from "@/lib/types";

type Filter = "all" | "video" | "image" | "active" | "hidden";

export default function MediaLibraryPage() {
  const supabase = useSupabase();
  const { business, loading: businessLoading } = useBusiness();
  const [config, setConfig] = useState<BusinessTypeConfig | null>(null);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  const loadMedia = useCallback(async () => {
    if (!business) return;
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });
    setItems((data as Media[]) ?? []);
  }, [supabase, business]);

  useEffect(() => {
    if (!business) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data: configData }] = await Promise.all([
        supabase
          .from("business_type_config")
          .select("*")
          .eq("type_key", business!.business_type)
          .maybeSingle(),
        loadMedia(),
      ]);
      if (cancelled) return;
      setConfig(configData as BusinessTypeConfig | null);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  if (!businessLoading && !business) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold text-text-primary">No business found</p>
      </div>
    );
  }

  const mediaLabel = config?.media_label ?? "Media";

  const filtered = items.filter((item) => {
    if (filter === "video") return item.file_type === "video";
    if (filter === "image") return item.file_type === "image";
    if (filter === "active") return item.active;
    if (filter === "hidden") return !item.active;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-text-primary">
          {mediaLabel} — {items.length} items
        </h1>
        <Button
          variant="gradient"
          onClick={() => {
            setEditingMedia(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border py-16 text-center">
          <ImageOff className="h-8 w-8 text-text-muted" />
          <p className="text-sm font-medium text-text-primary">Nothing here yet</p>
          <p className="max-w-xs text-sm text-text-secondary">
            Add your first item to start sending it to customers automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              onChanged={loadMedia}
              onEdit={() => {
                setEditingMedia(item);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {business && config && (
        <UploadModal
          business={business}
          fields={config.fields}
          mediaLabel={mediaLabel}
          open={modalOpen}
          onOpenChange={setModalOpen}
          media={editingMedia}
          onSaved={loadMedia}
        />
      )}
    </div>
  );
}
