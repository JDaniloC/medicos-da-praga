// components/builder/MediaPicker.tsx
// Campo de mídia: key manual + procurar no bucket + enviar arquivo, com preview.
// kind "image": a key R2 é o próprio valor (ex.: scenes/cena1.webp).
// kind "ambient": o valor é a key sem "sfx/" e sem extensão (amb/hospital) —
// o motor de áudio resolve sfx/<valor>.mp3, então só aceitamos .mp3.
"use client";

import { useEffect, useRef, useState } from "react";
import { imageUrl } from "@/lib/images/assets";
import { ambientValueFromKey } from "@/lib/builder/media-utils";
import { AssetImage } from "@/components/AssetImage";
import { Button, Modal, TextInput } from "./ui";

export function MediaPicker({
  value, onChange, kind, prefix,
}: {
  value: string;
  onChange: (value: string) => void;
  kind: "image" | "ambient";
  prefix?: string; // só para image (ex.: "scenes", "portraits")
}) {
  const effectivePrefix = kind === "ambient" ? "sfx/amb" : (prefix ?? "scenes");
  const accept = kind === "ambient" ? ".mp3" : ".webp,.png,.jpg,.jpeg";
  const toValue = (key: string) => (kind === "ambient" ? ambientValueFromKey(key) : key);
  const previewUrl = value
    ? kind === "ambient"
      ? imageUrl(`sfx/${value}.mp3`)
      : imageUrl(value)
    : "";

  const [browsing, setBrowsing] = useState(false);
  const [keys, setKeys] = useState<string[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!browsing || keys !== null || listError !== null) return;
    fetch(`/api/builder/assets?prefix=${encodeURIComponent(effectivePrefix + "/")}`)
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as
          | { keys?: string[]; error?: string }
          | null;
        if (!res.ok || !json?.keys) throw new Error(json?.error ?? `HTTP ${res.status}`);
        setKeys(json.keys);
      })
      .catch((e: Error) => setListError(e.message));
  }, [browsing, keys, listError, effectivePrefix]);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("prefix", effectivePrefix);
      const res = await fetch("/api/builder/upload", { method: "POST", body: form });
      const json = (await res.json().catch(() => null)) as
        | { key?: string; error?: string }
        | null;
      if (!res.ok || !json?.key) throw new Error(json?.error ?? `HTTP ${res.status}`);
      onChange(toValue(json.key));
      setKeys(null); // força recarregar a listagem com o novo arquivo
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setUploading(false);
    }
  }

  const pick = (key: string) => {
    onChange(toValue(key));
    setBrowsing(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-72">
          <TextInput
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={kind === "ambient" ? "amb/nome" : `${effectivePrefix}/nome.webp`}
            className="font-mono"
          />
        </div>
        <Button variant="ghost" onClick={() => setBrowsing(true)}>
          Procurar
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "Enviando…" : "Enviar arquivo"}
        </Button>
        <input
          hidden
          type="file"
          ref={fileRef}
          accept={accept}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>
      {uploadError && <p className="mt-1 text-xs text-blood">{uploadError}</p>}
      {previewUrl &&
        (kind === "image" ? (
          <AssetImage
            path={value}
            alt={value}
            className="mt-2 h-28 rounded-lg border border-edge object-cover"
          />
        ) : (
          <audio controls src={previewUrl} className="mt-2 h-9" />
        ))}
      <Modal open={browsing} onClose={() => setBrowsing(false)} title={`Assets em ${effectivePrefix}/`}>
        {listError ? (
          <p className="text-sm text-blood">
            Não foi possível listar ({listError}). Informe a key manualmente ou envie um arquivo.
          </p>
        ) : keys === null ? (
          <p className="text-sm text-ink-soft">Carregando…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum arquivo neste prefixo ainda.</p>
        ) : kind === "image" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {keys.map((k) => (
              <button
                key={k}
                onClick={() => pick(k)}
                className="rounded-lg border border-edge bg-panel p-2 text-left transition-all hover:border-accent hover:shadow-md"
              >
                <AssetImage path={k} alt={k} className="h-24 w-full rounded object-cover" />
                <p className="mt-1 break-all font-mono text-[10px] text-ink-soft">{k}</p>
              </button>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k} className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-panel p-2">
                <span className="break-all font-mono text-xs text-ink">{k}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <audio controls src={imageUrl(k)} className="h-8 w-44" preload="none" />
                  <Button variant="ghost" onClick={() => pick(k)}>
                    Usar
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}
