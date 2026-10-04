"use client";
import { useI18n } from "@/lib/i18n/client";


import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface ManagedVideo {
  id: string; src: string; title: string; caption: string; sortOrder: number;
}

export function VideoManager({ propertyId, initialVideos }: { propertyId: string; initialVideos: ManagedVideo[] }) {
  const { t } = useI18n();
  const [videos, setVideos] = useState(initialVideos);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ file: File; src: string } | null>(null);
  const previewUrl = useRef<string | null>(null);
  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  function clearSelection() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setSelectedVideo(null);
    if (input.current) input.current.value = "";
  }

  function selectVideo() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const file = input.current?.files?.[0];
    const src = file ? URL.createObjectURL(file) : null;
    previewUrl.current = src;
    setSelectedVideo(file && src ? { file, src } : null);
  }
  const router = useRouter();
  const endpoint = `/api/admin/properties/${propertyId}/videos`;

  async function upload() {
    const file = input.current?.files?.[0];
    if (!file) return;
    if (!["video/mp4", "video/webm"].includes(file.type) || file.size > 50*1024*1024) { setMessage("Choose MP4 or WebM up to 50 MB."); return; }
    setBusy(true); setMessage(""); setProgress(0);
    const data = new FormData(); data.append("file", file);
    try {
      await new Promise<void>((resolve,reject) => {
        const xhr = new XMLHttpRequest(); xhr.open("POST",endpoint);
        xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded/event.total*100)); };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            let error = "Upload failed. Try again.";
            try { error = JSON.parse(xhr.responseText).error || error; } catch {}
            reject(new Error(error));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
        xhr.send(data);
      });
      clearSelection();
      setMessage("Video uploaded."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : t("Upload failed")); }
    finally { setBusy(false); }
  }

  async function mutate(method: string, body: unknown) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(endpoint,{ method,headers:{"Content-Type":"application/json"},body:JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save video");
      setMessage("Video changes saved."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : t("Request failed")); }
    finally { setBusy(false); }
  }

  return <div className="admin-field-full">
    <div className="admin-upload"><input ref={input} type="file" accept="video/mp4,video/webm" aria-label={t("Video file")} onChange={selectVideo} disabled={busy} /><button type="button" className="admin-button-secondary" disabled={busy || !selectedVideo} onClick={upload}>{busy ? `${t("Working")} ${progress}%` : t("Upload video")}</button><span className="text-xs text-muted">{t("MP4 / WebM, up to 50 MB")}</span></div>
    {selectedVideo ? <section className="admin-local-selection" aria-label={t("Selected video")}>
      <div className="admin-selection-heading"><h4>{t("Selected video")}</h4><span>{t("Selected locally")}</span></div>
      <video key={selectedVideo.src} src={selectedVideo.src} controls preload="metadata" playsInline className="admin-selected-video" aria-label={`${t("Selected video:")} ${selectedVideo.file.name}`} />
      <p className="admin-selected-filename">{selectedVideo.file.name}</p>
      <div className="admin-selection-summary"><p role="status">{(selectedVideo.file.size / (1024 * 1024)).toFixed(1)} MB</p><button type="button" className="admin-button-secondary" disabled={busy} onClick={clearSelection}>{t("Clear selection")}</button></div>
    </section> : null}
    {message ? <p role="status" className="mt-3 text-sm">{t(message)}</p> : null}
    <h4 className="mt-5 text-sm font-semibold">{t("Uploaded videos")}</h4>
    {!videos.length ? <p className="admin-empty">{t("No videos uploaded.")}</p> : <div className="mt-4 grid gap-4 sm:grid-cols-2">{videos.map((video,index) => <article key={video.id} className="border-b border-line pb-4">
      <video src={video.src} controls preload="none" playsInline className="aspect-video w-full bg-ink" aria-label={video.title || "Property video"} />
      <label className="admin-field mt-3"><span>{t("Title")}</span><input value={video.title} maxLength={160} onChange={event => setVideos(items => items.map(item => item.id === video.id ? {...item,title:event.target.value} : item))} /></label>
      <label className="admin-field mt-3"><span>{t("Caption")}</span><input value={video.caption} maxLength={500} onChange={event => setVideos(items => items.map(item => item.id === video.id ? {...item,caption:event.target.value} : item))} /></label>
      <div className="admin-media-actions">
        <button type="button" disabled={busy || index === 0} onClick={() => { const next=[...videos]; [next[index-1],next[index]]=[next[index],next[index-1]]; void mutate("PATCH",{order:next.map(item=>item.id)}); }}>{t("Up")}</button>
        <button type="button" disabled={busy || index === videos.length-1} onClick={() => { const next=[...videos]; [next[index+1],next[index]]=[next[index],next[index+1]]; void mutate("PATCH",{order:next.map(item=>item.id)}); }}>{t("Down")}</button>
        <button type="button" disabled={busy} onClick={() => mutate("PATCH",{videoId:video.id,title:video.title,caption:video.caption})}>{t("Save")}</button>
        <button type="button" disabled={busy} onClick={() => { if(window.confirm(t("Delete this video from the property and storage?"))) void mutate("DELETE",{videoId:video.id}); }}>{t("Delete")}</button>
      </div>
    </article>)}</div>}
  </div>;
}
