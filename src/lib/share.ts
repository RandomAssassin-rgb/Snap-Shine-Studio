import QRCode from "qrcode";

export async function generateQR(text: string, size = 512): Promise<string> {
  return QRCode.toDataURL(text, { width: size, margin: 1, color: { dark: "#001858", light: "#fef6e4" } });
}

export async function shareOrCopy(opts: { title?: string; text?: string; url?: string; files?: File[] }) {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  try {
    if (nav.share && opts.files && nav.canShare?.({ files: opts.files })) {
      await nav.share({ title: opts.title, text: opts.text, files: opts.files });
      return { ok: true, method: "native" as const };
    }
    if (nav.share) {
      await nav.share({ title: opts.title, text: opts.text, url: opts.url });
      return { ok: true, method: "native" as const };
    }
  } catch {
    /* fall through to copy */
  }
  if (opts.url) {
    await navigator.clipboard.writeText(opts.url);
    return { ok: true, method: "clipboard" as const };
  }
  return { ok: false, method: "none" as const };
}

export const shareLinks = (url: string, text = "Check out my photobooth strip!") => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
});