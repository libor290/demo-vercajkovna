import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { ClipboardCheck, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface RegisterScreenProps {
  onRegister: (name: string, email: string) => void;
  onBack: () => void;
}

export function RegisterScreen({ onRegister, onBack }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "Jméno je povinné";
    if (!lastName.trim()) newErrors.lastName = "Příjmení je povinné";

    if (!email.trim()) {
      newErrors.email = "E-mail je povinný";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Zadejte platnou e-mailovou adresu";
    }

    if (!password) {
      newErrors.password = "Heslo je povinné";
    } else if (password.length < 6) {
      newErrors.password = "Heslo musí mít alespoň 6 znaků";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Potvrďte heslo";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Hesla se neshodují";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate async registration
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  const handleContinue = () => {
    const fullName = `${firstName} ${lastName}`;
    onRegister(fullName, email);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card shadow-[var(--elevation-sm)]">
          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--success, #22c55e)" }}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="mb-2">Účet byl vytvořen!</h1>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "8px" }}>
              Vítejte, <strong>{firstName} {lastName}</strong>
            </p>
            <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)", marginBottom: "32px" }}>
              Váš účet byl úspěšně zaregistrován. Nyní čeká na schválení administrátorem.
            </p>
            <Button className="w-full" onClick={handleContinue}>
              Přejít na přihlášení
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-[var(--elevation-sm)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <ClipboardCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-center mb-2">Nový účet</h1>
          <p className="text-center" style={{ color: "var(--muted-foreground)" }}>
            Vyplňte údaje pro registraci
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jméno + Příjmení */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Jméno</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
                placeholder="Jan"
                className="bg-input-background"
                style={errors.firstName ? { borderColor: "var(--destructive)" } : {}}
              />
              {errors.firstName && (
                <p style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Příjmení</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
                placeholder="Novák"
                className="bg-input-background"
                style={errors.lastName ? { borderColor: "var(--destructive)" } : {}}
              />
              {errors.lastName && (
                <p style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="jan.novak@firma.cz"
              className="bg-input-background"
              style={errors.email ? { borderColor: "var(--destructive)" } : {}}
            />
            {errors.email && (
              <p style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Heslo */}
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                className="bg-input-background pr-10"
                style={errors.password ? { borderColor: "var(--destructive)" } : {}}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Potvrzení hesla */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                placeholder="••••••••"
                className="bg-input-background pr-10"
                style={errors.confirmPassword ? { borderColor: "var(--destructive)" } : {}}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={{ color: "var(--destructive)", fontSize: "var(--text-xs)" }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registruji..." : "Vytvořit účet"}
          </Button>
        </form>

        {/* Zpět na přihlášení */}
        <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2"
            style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na přihlášení
          </button>
        </div>
      </Card>
    </div>
  );
}
