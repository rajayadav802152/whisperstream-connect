import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";



const Auth = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  // Auto-redirect if already authenticated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) navigate("/chats", { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/chats", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const sendMagicLink = async () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Enter a valid email address." });
      return;
    }
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/chats`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: `We sent a sign-in link to ${email}.` });
    } catch (err: any) {
      toast({
        title: "Failed to send link",
        description: err?.message ?? "Please check your email and try again.",
      });
    } finally {
      setLoading(false);
    }
  };


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink();
  };

  return (
    <main className="min-h-screen container mx-auto px-6 py-16">
      <section className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Sign in with email</h1>
        <p className="text-muted-foreground mb-8">We’ll email you a magic link to sign in securely.</p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-sm">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send magic link"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Auth;
