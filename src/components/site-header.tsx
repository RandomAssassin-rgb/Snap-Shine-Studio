import { Link, useRouter } from "@tanstack/react-router";
import { Camera, Images, LogIn, LogOut, User as UserIcon, Calendar, Video, Sparkles, Film } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-mark.png";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <img src={logoMark} alt="SnapBooth logo" width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span>SnapBooth</span>
        </Link>
        <nav className="ml-4 hidden gap-1 sm:flex">
          <Link to="/booth"><Button variant="ghost" size="sm"><Camera className="mr-1 h-4 w-4" />Booth</Button></Link>
          <Link to="/booth/film"><Button variant="ghost" size="sm"><Film className="mr-1 h-4 w-4" />Film Strips</Button></Link>
          <Link to="/video"><Button variant="ghost" size="sm"><Video className="mr-1 h-4 w-4" />Video</Button></Link>
          <Link to="/tools"><Button variant="ghost" size="sm"><Sparkles className="mr-1 h-4 w-4" />AI tools</Button></Link>
          {user && <Link to="/gallery"><Button variant="ghost" size="sm"><Images className="mr-1 h-4 w-4" />Gallery</Button></Link>}
          {user && <Link to="/account"><Button variant="ghost" size="sm"><Calendar className="mr-1 h-4 w-4" />Events</Button></Link>}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link to="/account"><Button variant="ghost" size="sm"><UserIcon className="mr-1 h-4 w-4" />{user.email?.split("@")[0]}</Button></Link>
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
                <LogOut className="mr-1 h-4 w-4" />Sign out
              </Button>
            </>
          ) : (
            <Link to="/auth"><Button size="sm"><LogIn className="mr-1 h-4 w-4" />Sign in</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}