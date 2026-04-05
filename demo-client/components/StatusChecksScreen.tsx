import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Input } from "@/demo-client/components/ui/input";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Check, intervalLabels, locationLabels, machines, type CheckInterval, type Location } from "@/demo-client/data/mockData";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface StatusChecksScreenProps {
  checks: Check[];
  status: Check["status"];
  onBack: () => void;
  onCheckClick: (check: Check) => void;
  onStatusChange?: (status: Check["status"]) => void;
}

export function StatusChecksScreen({ checks, status: initialStatus, onBack, onCheckClick, onStatusChange }: StatusChecksScreenProps) {
  const [selectedStatus, setSelectedStatus] = useState<Check["status"]>(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterval, setSelectedInterval] = useState<CheckInterval | "all">("all");
  const [selectedLocation, setSelectedLocation] = useState<Location | "all">("all");

  const filteredChecks = checks.filter((c) => c.status === selectedStatus);

  const getStatusBadge = (checkStatus: Check["status"]) => {
    switch (checkStatus) {
      case "completed":
        return (
          <Badge className="bg-[var(--chart-2)] text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Splněno
          </Badge>
        );
      case "issue":
        return (
          <Badge className="bg-[var(--chart-1)] text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Závada
          </Badge>
        );
      case "cannot_complete":
        return (
          <Badge className="bg-[var(--chart-4)] text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Nelze provést
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Čeká
          </Badge>
        );
    }
  };

  const filteredAndSortedChecks = useMemo(() => {
    return filteredChecks
      .filter((check) => {
        const machine = machines.find((m) => m.id === check.machineId);
        if (!machine) return false;
        return (
          check.task.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedInterval === "all" || check.interval === selectedInterval) &&
          (selectedLocation === "all" || machine.location === selectedLocation)
        );
      })
      .sort((a, b) => {
        if (a.completedAt && b.completedAt) {
          return a.completedAt.getTime() - b.completedAt.getTime();
        }
        return 0;
      });
  }, [filteredChecks, searchTerm, selectedInterval, selectedLocation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-[var(--elevation-sm)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl truncate">Přehled kontrol</h2>
            </div>
          </div>

          {/* Status Display Cards */}
          <div className="grid grid-cols-4 gap-1">
            {/* Completed */}
            <Card
              className={`cursor-pointer p-2 ${
                selectedStatus === "completed" ? "border-2 bg-green-50" : ""
              }`}
              style={{ borderColor: selectedStatus === "completed" ? "var(--chart-2)" : undefined }}
              onClick={() => {
                setSelectedStatus("completed");
                onStatusChange?.("completed");
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--chart-2)" }} />
                <div className="text-[10px] font-semibold text-center leading-none">Splněno</div>
                <div className="text-sm font-bold" style={{ color: "var(--chart-2)" }}>
                  {checks.filter((c) => c.status === "completed").length}
                </div>
              </div>
            </Card>

            {/* Issues */}
            <Card
              className={`cursor-pointer p-2 ${
                selectedStatus === "issue" ? "border-2 bg-red-50" : ""
              }`}
              style={{ borderColor: selectedStatus === "issue" ? "var(--chart-1)" : undefined }}
              onClick={() => {
                setSelectedStatus("issue");
                onStatusChange?.("issue");
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--chart-1)" }} />
                <div className="text-[10px] font-semibold text-center leading-none">Závady</div>
                <div className="text-sm font-bold text-destructive">
                  {checks.filter((c) => c.status === "issue").length}
                </div>
              </div>
            </Card>

            {/* Pending */}
            <Card
              className={`cursor-pointer p-2 ${
                selectedStatus === "pending" ? "border-2 bg-amber-50" : ""
              }`}
              style={{ borderColor: selectedStatus === "pending" ? "var(--chart-4)" : undefined }}
              onClick={() => {
                setSelectedStatus("pending");
                onStatusChange?.("pending");
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <Clock className="w-4 h-4" style={{ color: "var(--chart-4)" }} />
                <div className="text-[10px] font-semibold text-center leading-none">Čeká</div>
                <div className="text-sm font-bold" style={{ color: "var(--chart-4)" }}>
                  {checks.filter((c) => c.status === "pending").length}
                </div>
              </div>
            </Card>

            {/* Cannot Complete */}
            <Card
              className={`cursor-pointer p-2 ${
                selectedStatus === "cannot_complete" ? "border-2 bg-gray-50" : ""
              }`}
              style={{ borderColor: selectedStatus === "cannot_complete" ? "var(--chart-4)" : undefined }}
              onClick={() => {
                setSelectedStatus("cannot_complete");
                onStatusChange?.("cannot_complete");
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <XCircle className="w-4 h-4 text-muted-foreground" />
                <div className="text-[10px] font-semibold text-center leading-none">Nelze</div>
                <div className="text-sm font-bold text-muted-foreground">
                  {checks.filter((c) => c.status === "cannot_complete").length}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder="Hledat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchTerm("")}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant={selectedInterval === "all" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedInterval("all")}
          >
            <Filter className="w-5 h-5" />
          </Button>
          {Object.keys(intervalLabels).map((interval) => (
            <Button
              key={interval}
              variant={selectedInterval === interval ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedInterval(interval as CheckInterval)}
            >
              <Calendar className="w-5 h-5" />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Button
            variant={selectedLocation === "all" ? "default" : "outline"}
            size="icon"
            onClick={() => setSelectedLocation("all")}
          >
            <Filter className="w-5 h-5" />
          </Button>
          {Object.keys(locationLabels).map((location) => (
            <Button
              key={location}
              variant={selectedLocation === location ? "default" : "outline"}
              size="icon"
              onClick={() => setSelectedLocation(location as Location)}
            >
              <Search className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>

      {/* Checks List */}
      <ScrollArea className="h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
          {filteredAndSortedChecks.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
                Žádné kontroly v tomto stavu
              </p>
            </Card>
          ) : (
            filteredAndSortedChecks.map((check) => {
              const machine = machines.find((m) => m.id === check.machineId);
              if (!machine) return null;

              return (
                <Card
                  key={check.id}
                  className="p-3 sm:p-4 hover:shadow-md active:bg-muted/50 transition-shadow cursor-pointer"
                  onClick={() => onCheckClick(check)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)" }}>
                          {machine.name}
                        </h3>
                        {getStatusBadge(check.status)}
                      </div>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
                        {locationLabels[machine.location]} • {intervalLabels[check.interval]}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                  <p style={{ fontSize: "var(--text-sm)", marginTop: "8px" }}>
                    {check.task}
                  </p>
                  {check.completedBy && (
                    <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)", marginTop: "8px" }}>
                      Provedl: {check.completedBy} •{" "}
                      {check.completedAt?.toLocaleDateString("cs-CZ")} {check.completedAt?.toLocaleTimeString("cs-CZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {check.issue && (
                    <div className="mt-2 p-2 bg-[var(--chart-1)]/10 rounded" style={{ border: "1px solid var(--chart-1)" }}>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--chart-1)", fontWeight: "var(--font-weight-medium)" }}>
                        Závada: {check.issue}
                      </p>
                    </div>
                  )}
                  {check.status === "cannot_complete" && check.note && (
                    <div className="mt-2 p-2 bg-[var(--chart-4)]/10 rounded" style={{ border: "1px solid var(--chart-4)" }}>
                      <p style={{ fontSize: "var(--text-sm)", color: "var(--chart-4)", fontWeight: "var(--font-weight-medium)" }}>
                        Důvod: {check.note}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
