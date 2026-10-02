"use client";

import { useRef, useState } from "react";
import { SpinnerGapIcon, UploadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { uploadCmsImage } from "@/lib/cms/upload-image";

export function ImageUploadButton({
  hint,
  onUploaded,
  folder = "blog",
}: {
  hint: string;
  onUploaded: (url: string) => void;
  folder?: "blog" | "work";
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const url = await uploadCmsImage(file, hint, folder);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-text transition hover:bg-cream disabled:opacity-60"
      >
        {isUploading ? <SpinnerGapIcon size={12} className="animate-spin" /> : <UploadSimpleIcon size={12} />}
        {isUploading ? "Uploading…" : "Upload"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      {error && <p className="w-fit rounded bg-cream px-2 py-1 text-xs text-text">{error}</p>}
    </div>
  );
}
