import {
  ArrowLeft,
  Building2,
  ClipboardList,
  Settings,
  User,
  Users,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";

interface AdminMenuScreenProps {
  onBack: () => void;
  onMachineManagement: () => void;
  onUserManagement: () => void;
  onTenantManagement: () => void;
  onHistory: () => void;
  onSubmittedWork?: () => void;
  adminName?: string;
}

export function AdminMenuScreen({
  onBack,
  onMachineManagement,
  onUserManagement,
  onTenantManagement,
  onHistory,
  onSubmittedWork,
  adminName = "Administrátor",
}: AdminMenuScreenProps) {

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
              <h2 className="text-base sm:text-lg md:text-xl">Administrace</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Profile Card */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-primary"
            >
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold mb-1">{adminName}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Administrátor systému</p>
            </div>
          </div>
        </Card>

        {/* Menu items */}
        <div className="space-y-2 sm:space-y-3">
          {/* Přehled kontrol a historie */}
          <Card
            className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-all cursor-pointer"
            onClick={onHistory}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `var(--chart-1)15` }}
              >
                <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-1)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold mb-1">Přehled kontrol a historie</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Kompletní přehled všech kontrol, statistiky a reporty
                </p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          {/* Odevzdané práce */}
          {onSubmittedWork && (
            <Card
              className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-all cursor-pointer"
              onClick={onSubmittedWork}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `var(--chart-2)15` }}
                >
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-2)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold mb-1">Odevzdané práce</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Správa a export odevzdaných prací zaměstnanců
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          )}

          {/* Správa strojů */}
          <Card
            className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-all cursor-pointer"
            onClick={onMachineManagement}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `var(--chart-3)15` }}
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-3)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold mb-1">Správa strojů</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Přidávat, upravovat a mazat stroje a jejich kontroly
                </p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          {/* Správa uživatelů */}
          <Card
            className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-all cursor-pointer"
            onClick={onUserManagement}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `var(--chart-4)15` }}
              >
                <Users className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-4)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold mb-1">Správa uživatelů</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Schvalování přístupů, přiřazování tenantů
                </p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          {/* Správa tenantů a lokací */}
          <Card
            className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-all cursor-pointer"
            onClick={onTenantManagement}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `var(--chart-5)15` }}
              >
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-5)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold mb-1">Správa tenantů a lokací</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Přidávání a správa tenantů a jejich provozoven
                </p>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
