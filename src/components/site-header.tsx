import { Link } from "@tanstack/react-router";
import { Camera, Video, Sparkles, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-mark.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <img src={logoMark} alt="Snap & Shine Studio logo" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span>Snap &amp; Shine Studio</span>
        </Link>
        <nav className="ml-4 hidden gap-1 sm:flex">
          <Link to="/booth"><Button variant="ghost" size="sm"><Camera className="mr-1 h-4 w-4" />Booth</Button></Link>
          <Link to="/booth/film"><Button variant="ghost" size="sm"><Film className="mr-1 h-4 w-4" />Film Strips</Button></Link>
          <Link to="/video"><Button variant="ghost" size="sm"><Video className="mr-1 h-4 w-4" />Video</Button></Link>
          <Link to="/tools"><Button variant="ghost" size="sm"><Sparkles className="mr-1 h-4 w-4" />AI Tools</Button></Link>
        </nav>
      </div>
    </header>
  );
}