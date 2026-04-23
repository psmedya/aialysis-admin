"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Sparkles } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Gecerli email gir"),
});
const otpSchema = z.object({
  token: z.string().min(6, "6-8 haneli kod gir").max(8),
});

type Step = "email" | "otp";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { token: "" },
  });

  async function handleSendOtp(values: z.infer<typeof emailSchema>) {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      setEmail(values.email);
      setStep("otp");
      toast.success("Kod email adresine gonderildi");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(values: z.infer<typeof otpSchema>) {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: values.token,
        type: "email",
      });
      if (error) throw error;
      toast.success("Giris basarili");
      window.location.href = "/";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl">AIALYSIS Admin</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Yonetici hesabinla giris yap"
              : `${email} adresine gonderilen kodu gir`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(handleSendOtp)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aialysis.live"
                autoComplete="email"
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kod gonder
            </Button>
          </form>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="token">Dogrulama kodu</Label>
              <Input
                id="token"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="12345678"
                {...otpForm.register("token")}
              />
              {otpForm.formState.errors.token && (
                <p className="text-sm text-destructive">
                  {otpForm.formState.errors.token.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Giris yap
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("email");
                setError(null);
              }}
            >
              Farkli email kullan
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
