import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RESEND_SECONDS = 30; // 30s cooldown as requested

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [loading, setLoading] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Start/maintain the 30s resend cooldown timer
  useEffect(() => {
    if (resendLeft <= 0) return;
    const t = setInterval(() => setResendLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendLeft]);

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

  const canResend = resendLeft === 0 && step === "verify" && phone.length > 0;
  const formattedCountdown = useMemo(() => `0:${String(resendLeft).padStart(2, "0")}`,[resendLeft]);

  const sendOtp = async () => {
    if (!phone.trim()) {
      toast({ title: "Phone required", description: "Enter a valid phone number including country code." });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: { channel: "sms", shouldCreateUser: true },
      });
      if (error) throw error;
      toast({ title: "Code sent", description: `We texted a code to ${phone}.` });
      setStep("verify");
      setResendLeft(RESEND_SECONDS);
    } catch (err: any) {
      toast({
        title: "Failed to send code",
        description: err?.message ?? "Please check your number and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (code.trim().length < 6) {
      toast({ title: "Invalid code", description: "Enter the 6‑digit code." });
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        type: "sms",
        phone: phone.trim(),
        token: code.trim(),
      });
      if (error) throw error;
      if (data?.user) {
        toast({ title: "Signed in", description: "Welcome back!" });
        navigate("/chats", { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.message ?? "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "phone") sendOtp();
    else verifyOtp();
  };

  return (
    <main className="min-h-screen container mx-auto px-6 py-16">
      <section className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Sign in with phone</h1>
        <p className="text-muted-foreground mb-8">We’ll send you a one-time code to verify your number.</p>

        <form onSubmit={onSubmit} className="space-y-6">
          {step === "phone" ? (
            <div>
              <label htmlFor="phone" className="text-sm">Phone number</label>
              <Input
                id="phone"
                placeholder="+1 555 555 1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm">Enter 6‑digit code</label>
                <span className="text-xs text-muted-foreground">to {phone}</span>
              </div>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  {[0,1,2,3,4,5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground">
                  {resendLeft > 0 ? `Resend in ${formattedCountdown}` : "Didn’t get a code?"}
                </span>
                <Button type="button" variant="outline" size="sm" disabled={!canResend} onClick={sendOtp}>
                  Resend code
                </Button>
              </div>
            </div>
          )}

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {step === "phone" ? (loading ? "Sending…" : "Send code") : (loading ? "Verifying…" : "Verify")}
          </Button>

          {step === "verify" && (
            <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("phone"); setCode(""); }}>
              Use a different number
            </Button>
          )}
        </form>
      </section>
    </main>
  );
};

export default Auth;
