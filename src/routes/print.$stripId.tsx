import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signedUrl } from "@/lib/storage";

export const Route = createFileRoute("/print/$stripId")({
  head: () => ({ meta: [{ title: "Print strip — SnapBooth" }, { name: "robots", content: "noindex" }] }),
  component: PrintPage,
});

function PrintPage() {
  const { stripId } = Route.useParams();
  const [url, setUrl] = useState<string | null>(null);
  const [paper, setPaper] = useState<"a4" | "letter" | "4x6">("a4");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("strips").select("storage_path").eq("id", stripId).maybeSingle();
      if (error || !data?.storage_path) { toast.error("Strip not found"); return; }
      const signed = await signedUrl("strips", data.storage_path);
      if (!signed) { toast.error("Could not access strip image"); return; }
      setUrl(signed);
    })();
  }, [stripId]);

  const size = paper === "a4" ? { w: "210mm", h: "297mm" } : paper === "letter" ? { w: "8.5in", h: "11in" } : { w: "4in", h: "6in" };

  return (
    <div className="min-h-screen bg-gradient-soft p-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl print:hidden">
        <h1 className="font-display text-3xl">Print preview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick paper size, then click Print. Use browser dialog for actual paper size and margins.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["a4", "letter", "4x6"] as const).map((p) => (
            <button key={p} onClick={() => setPaper(p)}
              className={`rounded-lg border px-3 py-2 text-sm ${paper === p ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
              {p.toUpperCase()}
            </button>
          ))}
          <Button onClick={() => window.print()} className="ml-auto"><Printer className="mr-1 h-4 w-4" />Print</Button>
        </div>
      </div>

      <div className="mx-auto mt-6 flex justify-center print:mt-0">
        <div className="bg-white shadow-lg print:shadow-none" style={{ width: size.w, height: size.h, maxWidth: "100%" }}>
          <div className="flex h-full items-center justify-center p-8">
            {url ? <img src={url} alt="Strip" className="max-h-full max-w-full object-contain" />
              : <p className="text-muted-foreground">Loading…</p>}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: ${paper === "a4" ? "A4" : paper === "letter" ? "letter" : "4in 6in"}; margin: 8mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}