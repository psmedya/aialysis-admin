import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted">
      {children}
    </div>
  );
}
