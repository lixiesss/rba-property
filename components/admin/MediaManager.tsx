"use client";
import { useI18n } from "@/lib/i18n/client";


import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface ManagedImage {
  id: string;
  storagePath: string;
  src: string;
  altText: string;
  caption: string;
  sortOrder: number;
  isThumbnail: boolean;
}

export function MediaManager({ propertyId, initialImages }: { propertyId: string; initialImages: ManagedImage[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<{ file: File; src: string }[]>([]);
  const previewUrls = useRef<string[]>([]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function clearSelection() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current = [];
    setSelectedPhotos([]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function selectPhotos() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    const selected = Array.from(fileInput.current?.files ?? []).map((file) => ({ file, src: URL.createObjectURL(file) }));
    previewUrls.current = selected.map((photo) => photo.src);
    setSelectedPhotos(selected);
  }

  async function upload() {
    const files = fileInput.current?.files;
    if (!files?.length) return;
    setMessage("");
    setBusy("upload");
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("files", file));
    try {
      await uploadWithProgress(`/api/admin/properties/${propertyId}/images`, data, setProgress);
      setMessage(`${files.length} ${t("Images uploaded.")}`);
      clearSelection();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("Upload failed"));
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  async function saveDetails(image: ManagedImage) {
    setBusy(image.id); setMessage("");
    try {
      await request(`/api/admin/properties/${propertyId}/images/${image.id}`, { method: "PATCH", body: JSON.stringify({ altText: image.altText, caption: image.caption }) });
      setMessage("Image details saved.");
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed"); }
    finally { setBusy(null); }
  }

  async function setThumbnail(imageId: string) {
    const previous = images;
    setImages((items) => items.map((item) => ({ ...item, isThumbnail: item.id === imageId })));
    setBusy(imageId); setMessage("");
    try {
      await request(`/api/admin/properties/${propertyId}/images/${imageId}`, { method: "PATCH", body: JSON.stringify({ isThumbnail: true }) });
      setMessage("Thumbnail updated."); router.refresh();
    } catch (error) { setImages(previous); setMessage(error instanceof Error ? error.message : "Update failed"); }
    finally { setBusy(null); }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const previous = images;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    setBusy("order"); setMessage("");
    try {
      await request(`/api/admin/properties/${propertyId}/images`, { method: "PATCH", body: JSON.stringify({ order: next.map((image) => image.id) }) });
      setMessage("Gallery order saved."); router.refresh();
    } catch (error) { setImages(previous); setMessage(error instanceof Error ? error.message : t("Reorder failed")); }
    finally { setBusy(null); }
  }

  async function remove(image: ManagedImage) {
    if (!window.confirm(t("Delete this image from the property and storage?"))) return;
    setBusy(image.id); setMessage("");
    try {
      await request(`/api/admin/properties/${propertyId}/images/${image.id}`, { method: "DELETE" });
      setImages((items) => items.filter((item) => item.id !== image.id));
      setMessage("Image deleted."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : t("Delete failed")); }
    finally { setBusy(null); }
  }

  return <div className="admin-field-full">
    <div className="admin-upload"><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple aria-label={t("Property images")} onChange={selectPhotos} disabled={busy === "upload"} /><button type="button" className="admin-button-secondary" onClick={upload} disabled={!selectedPhotos.length || busy === "upload"}>{busy === "upload" ? `${t("Uploading")} ${progress ?? 0}%` : selectedPhotos.length ? `${t("Upload")} ${selectedPhotos.length} ${t(selectedPhotos.length === 1 ? "photo" : "photos")}` : t("Upload photos")}</button></div>
    {selectedPhotos.length ? <section className="admin-local-selection" aria-label={t("Selected photos")}>
      <div className="admin-selection-heading"><h4>{t("Selected photos")}</h4><span>{t("Selected locally")}</span></div>
      <div className="admin-selection-grid">{selectedPhotos.map(({ file, src }) => <figure key={src}>
        <div className="relative aspect-[4/3]"><Image src={src} alt={`${t("Selected photo:")} ${file.name}`} fill unoptimized className="object-contain" /></div>
        <figcaption>{file.name}</figcaption>
      </figure>)}</div>
      <div className="admin-selection-summary"><p role="status">{selectedPhotos.length} {t(selectedPhotos.length === 1 ? "photo" : "photos")} {t("selected")} &middot; {(selectedPhotos.reduce((total, photo) => total + photo.file.size, 0) / (1024 * 1024)).toFixed(1)} MB {t("total")}</p><button type="button" className="admin-button-secondary" onClick={clearSelection} disabled={busy === "upload"}>{t("Clear selection")}</button></div>
    </section> : null}
    {message ? <p className="mt-3 text-sm" role="status">{t(message)}</p> : null}
    <h4 className="mt-5 text-sm font-semibold">{t("Uploaded photos")}</h4>
    {images.length ? <div className="admin-media-grid">{images.map((image, index) => <article className="admin-media-item" key={image.id}>
      <div className="relative aspect-[4/3] overflow-hidden bg-sandstone"><Image src={image.src} alt={image.altText || "Property image"} fill unoptimized className="object-cover" />{image.isThumbnail ? <span className="admin-thumbnail-label">{t("Thumbnail")}</span> : null}</div>
      <label className="admin-field"><span>{t("Alt text")}</span><input value={image.altText} onChange={(event) => setImages(items => items.map(item => item.id === image.id ? { ...item, altText: event.target.value } : item))} /></label>
      <label className="admin-field"><span>{t("Caption")}</span><input value={image.caption} onChange={(event) => setImages(items => items.map(item => item.id === image.id ? { ...item, caption: event.target.value } : item))} /></label>
      <div className="admin-media-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0 || busy === "order"} aria-label={t("Move image earlier")}>{t("Up")}</button><button type="button" onClick={() => move(index, 1)} disabled={index === images.length - 1 || busy === "order"} aria-label={t("Move image later")}>{t("Down")}</button><button type="button" onClick={() => saveDetails(image)} disabled={busy === image.id}>{t("Save")}</button>{!image.isThumbnail ? <button type="button" onClick={() => setThumbnail(image.id)} disabled={busy === image.id}>{t("Set thumbnail")}</button> : null}<button type="button" className="text-clay" onClick={() => remove(image)} disabled={busy === image.id}>{t("Delete")}</button></div>
    </article>)}</div> : <p className="admin-empty">{t("No images yet. Upload at least one image before publishing.")}</p>}
  </div>;
}

async function request(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

function uploadWithProgress(url: string, data: FormData, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => {
      const body = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(body.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(data);
  });
}
