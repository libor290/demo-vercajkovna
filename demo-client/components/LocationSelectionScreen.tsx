import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";

interface LocationSelectionScreenProps {
  onTenantSelect: () => void;
  onBack: () => void;
  userName: string;
}

export function LocationSelectionScreen({
  onTenantSelect,
  onBack,
  userName,
}: LocationSelectionScreenProps) {
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
              <h2 className="text-base sm:text-lg md:text-xl">Výběr pracoviště</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Vítejte, {userName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-muted-foreground">
            Vyberte pracoviště:
          </p>
        </div>

        {/* Tenant Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card
            className="p-8 sm:p-12 hover:shadow-lg transition-shadow cursor-pointer active:scale-[0.98] transition-transform"
            onClick={onTenantSelect}
          >
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">TORO</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Kliknutím vstoupíte do systému kontrol
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
