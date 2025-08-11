import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="min-h-screen bg-background interactive-spotlight">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-lg font-semibold">Aurora Chat</span>
        <nav className="flex items-center gap-3">
          <Link to="/chats" className="text-sm underline-offset-4 hover:underline">Demo</Link>
          <Link to="/auth" className="text-sm underline-offset-4 hover:underline">Sign in</Link>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">Private Messaging App</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            End‑to‑end encrypted one‑to‑one and group chats with media sharing, presence, typing indicators, and more.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/auth"><Button variant="hero" size="lg">Get started</Button></Link>
            <Link to="/chats"><Button variant="outline" size="lg">Try demo</Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
