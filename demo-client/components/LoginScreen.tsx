import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

interface LoginScreenProps {
  onLogin: (role: "operator" | "admin", userName: string) => void;
  onRegister?: () => void;
}

export function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase().includes("mal") || password === "admin") {
      onLogin("admin", "pí Nováková");
    } else {
      onLogin("operator", username || "p. Novák");
    }
  };

  const quickLogin = (role: "operator" | "admin", name: string) => {
    onLogin(role, name);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-[var(--elevation-sm)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-center mb-2">Systém kontrol</h1>
          <p className="text-center" style={{ color: "var(--muted-foreground)" }}>
            Přihlaste se pro pokračování
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Jan.Novak@chovservis.cz"
              className="bg-input-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-input-background"
            />
          </div>

          <Button type="submit" className="w-full">
            Přihlásit se
          </Button>

          {onRegister && (
            <p className="text-center" style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginTop: "12px" }}>
              Nemáte účet?{" "}
              <button
                type="button"
                onClick={onRegister}
                style={{ color: "var(--primary)", fontWeight: 500 }}
              >
                Registrovat se
              </button>
            </p>
          )}
        </form>

        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)", marginBottom: "12px" }}>
            Rychlé přihlášení (demo):
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => quickLogin("operator", "p. Novák")}
            >
              Operátor (p. Novák)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => quickLogin("admin", "pí Nováková")}
            >
              Administrátor (pí Nováková)
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
