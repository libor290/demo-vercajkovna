import { ArrowLeft, CreditCard, Save } from "lucide-react";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { PaymentSettings } from "@/demo-client/data/mockData";
import { useState } from "react";

interface SettingsScreenProps {
  paymentSettings: PaymentSettings;
  onBack: () => void;
  onSavePaymentSettings: (settings: PaymentSettings) => void;
}

export function SettingsScreen({
  paymentSettings,
  onBack,
  onSavePaymentSettings,
}: SettingsScreenProps) {
  const [accountNumber, setAccountNumber] = useState(paymentSettings.accountNumber);
  const [iban, setIban] = useState(paymentSettings.iban);
  const [bankName, setBankName] = useState(paymentSettings.bankName);
  const [bic, setBic] = useState(paymentSettings.bic);
  const [variableSymbolNote, setVariableSymbolNote] = useState(paymentSettings.variableSymbolNote);
  const [paymentNote, setPaymentNote] = useState(paymentSettings.paymentNote);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSavePaymentSettings({
      accountNumber: accountNumber.trim(),
      iban: iban.trim(),
      bankName: bankName.trim(),
      bic: bic.trim(),
      variableSymbolNote: variableSymbolNote.trim(),
      paymentNote: paymentNote.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-[var(--elevation-sm)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1">
              <h2 className="text-base sm:text-lg md:text-xl">Nastavení systému</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">

        {/* Payment settings card */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `var(--chart-1)15` }}
            >
              <CreditCard className="w-5 h-5" style={{ color: "var(--chart-1)" }} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">Platební údaje</h3>
              <p className="text-xs text-muted-foreground">
                Zobrazí se nájemci po potvrzení objednávky
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="s-account">Číslo účtu</Label>
                <Input
                  id="s-account"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="123456789/0800"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="s-bank">Název banky</Label>
                <Input
                  id="s-bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Česká spořitelna"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="s-iban">IBAN</Label>
              <Input
                id="s-iban"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="CZ65 0800 0000 0012 3456 7890"
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="s-bic">BIC / SWIFT</Label>
              <Input
                id="s-bic"
                value={bic}
                onChange={(e) => setBic(e.target.value)}
                placeholder="GIBACZPX"
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="s-vs">Pokyn k variabilnímu symbolu</Label>
              <Input
                id="s-vs"
                value={variableSymbolNote}
                onChange={(e) => setVariableSymbolNote(e.target.value)}
                placeholder="Použijte vaše IČO jako variabilní symbol"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Zobrazí se nájemci jako instrukce, co uvést jako VS.
              </p>
            </div>

            <div>
              <Label htmlFor="s-note">Zpráva pro příjemce</Label>
              <Input
                id="s-note"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Platba za servisní služby"
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            {saved && (
              <span className="text-xs text-green-600 dark:text-green-400">
                Uloženo
              </span>
            )}
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Uložit
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
