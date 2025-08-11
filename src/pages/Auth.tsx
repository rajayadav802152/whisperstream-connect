import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Connect Supabase to enable phone auth",
      description:
        "Use the Supabase integration (top right) to set up SMS/OTP securely, then we’ll wire this form.",
    });
  };

  return (
    <main className="min-h-screen container mx-auto px-6 py-16">
      <section className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Sign in with phone</h1>
        <p className="text-muted-foreground mb-8">
          We’ll send you a one-time code to verify your number.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="text-sm">Phone number</label>
            <Input
              id="phone"
              placeholder="+1 555 555 1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="hero" className="w-full">Send code</Button>
        </form>
      </section>
    </main>
  );
};

export default Auth;
