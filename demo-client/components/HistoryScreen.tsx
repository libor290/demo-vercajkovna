import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  Filter,
  XCircle
} from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Progress } from "@/demo-client/components/ui/progress";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/demo-client/components/ui/tabs";
import { Check, intervalLabels, locationLabels, machines, type CheckInterval, type Location } from "@/demo-client/data/mockData";
import { isJiraConfigured } from "@/demo-client/lib/jira";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface HistoryScreenProps {
  checks: Check[];
  onBack: () => void;
  onCheckClick: (check: Check) => void;
  onStatusClick?: (status: Check["status"]) => void;
  onSubmittedWork?: () => void;
  initialIssueDate?: Date;
}

export function HistoryScreen({ checks, onBack, onCheckClick, onStatusClick, onSubmittedWork, initialIssueDate }: HistoryScreenProps) {
  // Date filters
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [historyDate, setHistoryDate] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(
    initialIssueDate ? format(initialIssueDate, "yyyy-MM-dd") : ""
  );

  // Filters for pending checks
  const [pendingIntervalFilter, setPendingIntervalFilter] = useState<CheckInterval | "all">("all");
  const [pendingLocationFilter, setPendingLocationFilter] = useState<Location | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter checks by selected date for summary tab
  const dateFilteredChecks = useMemo(() => {
    return checks.filter((check) => {
      const schedDate = new Date(check.scheduledDate);
      schedDate.setHours(0, 0, 0, 0);
      return schedDate.getTime() === selectedDate.getTime();
    });
  }, [checks, selectedDate]);

  // Calculate statistics based on date-filtered checks
  const completedChecks = dateFilteredChecks.filter((c) => c.status === "completed");
  const issueChecks = dateFilteredChecks.filter((c) => c.status === "issue");
  const cannotCompleteChecks = dateFilteredChecks.filter((c) => c.status === "cannot_complete");
  const pendingChecks = dateFilteredChecks.filter((c) => c.status === "pending");

  // Filtered issue checks for Issues tab
  const filteredIssueChecks = useMemo(() => {
    let result = checks.filter((c) => c.status === "issue");
    if (issueDate) {
      const filterDate = new Date(issueDate);
      filterDate.setHours(0, 0, 0, 0);
      result = result.filter((check) => {
        const schedDate = new Date(check.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        return schedDate.getTime() === filterDate.getTime();
      });
    }
    return result;
  }, [checks, issueDate]);

  // Filtered cannot complete checks for Issues tab
  const filteredCannotCompleteChecks = useMemo(() => {
    let result = checks.filter((c) => c.status === "cannot_complete");
    if (issueDate) {
      const filterDate = new Date(issueDate);
      filterDate.setHours(0, 0, 0, 0);
      result = result.filter((check) => {
        const schedDate = new Date(check.scheduledDate);
        schedDate.setHours(0, 0, 0, 0);
        return schedDate.getTime() === filterDate.getTime();
      });
    }
    return result;
  }, [checks, issueDate]);

  // Filtered pending checks with useMemo
  const filteredPendingChecks = useMemo(() => {
    return pendingChecks.filter((check) => {
      const machine = machines.find((m) => m.id === check.machineId);
      if (!machine) return false;

      // Interval filter
      if (pendingIntervalFilter !== "all" && check.interval !== pendingIntervalFilter) {
        return false;
      }

      // Location filter
      if (pendingLocationFilter !== "all" && machine.location !== pendingLocationFilter) {
        return false;
      }

      return true;
    });
  }, [pendingChecks, pendingIntervalFilter, pendingLocationFilter]);

  const totalChecks = dateFilteredChecks.length;
  const completionRate =
    totalChecks > 0
      ? ((completedChecks.length / totalChecks) * 100).toFixed(1)
      : "0";

  // Group checks by date - filter by historyDate if selected
  const historyFilteredChecks = useMemo(() => {
    if (!historyDate) return checks;

    const filterDate = new Date(historyDate);
    filterDate.setHours(0, 0, 0, 0);

    return checks.filter((check) => {
      const schedDate = new Date(check.scheduledDate);
      schedDate.setHours(0, 0, 0, 0);
      return schedDate.getTime() === filterDate.getTime();
    });
  }, [checks, historyDate]);

  const checksByDate = historyFilteredChecks.reduce((acc, check) => {
    const dateKey = check.scheduledDate.toLocaleDateString("cs-CZ");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(check);
    return acc;
  }, {} as Record<string, Check[]>);

  const sortedDates = Object.keys(checksByDate).sort(
    (a, b) => new Date(b.split(".").reverse().join("-")).getTime() - new Date(a.split(".").reverse().join("-")).getTime()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-[var(--elevation-sm)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl truncate">Historie a reporty</h2>
            </div>
            {onSubmittedWork && (
              <Button variant="outline" size="sm" onClick={onSubmittedWork} className="min-h-[36px] sm:min-h-[40px]">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline text-sm">Export</span>
                <span className="sm:hidden text-xs">Export</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <Tabs defaultValue={initialIssueDate ? "issues" : "summary"} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="summary" className="text-xs sm:text-sm py-2">Přehled</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm py-2">Historie</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs sm:text-sm py-2">Závady</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {/* Overall Stats */}
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg">Celkové statistiky</h3>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    newDate.setHours(0, 0, 0, 0);
                    setSelectedDate(newDate);
                  }}
                  className="text-xs sm:text-sm px-2 py-1 border rounded-md"
                />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm">
                      Míra splnění
                    </span>
                    <span className="text-xs sm:text-sm font-semibold">
                      {completionRate}%
                    </span>
                  </div>
                  <Progress value={parseFloat(completionRate)} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div
                    className="p-2 sm:p-3 bg-[var(--chart-2)]/10 rounded-lg text-left min-h-[80px] sm:min-h-[auto] cursor-pointer"
                    onClick={() => onStatusClick?.("completed")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--chart-2)" }} />
                      <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Splněno
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                      {completedChecks.length}
                    </p>
                  </div>

                  <div
                    className="p-2 sm:p-3 bg-[var(--chart-1)]/10 rounded-lg text-left min-h-[80px] sm:min-h-[auto] cursor-pointer"
                    onClick={() => onStatusClick?.("issue")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--chart-1)" }} />
                      <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Závady
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                      {issueChecks.length}
                    </p>
                  </div>

                  <div
                    className="p-2 sm:p-3 bg-muted rounded-lg text-left min-h-[80px] sm:min-h-[auto] cursor-pointer"
                    onClick={() => onStatusClick?.("pending")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Čeká
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                      {filteredPendingChecks.length}
                    </p>
                  </div>

                  <div
                    className="p-2 sm:p-3 bg-[var(--chart-4)]/10 rounded-lg text-left min-h-[80px] sm:min-h-[auto] cursor-pointer"
                    onClick={() => onStatusClick?.("cannot_complete")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: "var(--chart-4)" }} />
                      <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Nelze provést
                      </span>
                    </div>
                    <p className="text-xl sm:text-2xl md:text-3xl font-semibold">
                      {cannotCompleteChecks.length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Missed Checks */}
            {pendingChecks.length > 0 && (
              <Card className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm sm:text-base">Nesplněné kontroly</h4>
                  <Button
                    variant={showFilters ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
                
                {/* Filters - Collapsible */}
                {showFilters && (
                  <div className="mb-3 space-y-2 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "8px" }}>
                        Interval
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={pendingIntervalFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPendingIntervalFilter("all")}
                        >
                          Vše
                        </Button>
                        {Object.entries(intervalLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            variant={pendingIntervalFilter === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPendingIntervalFilter(key as CheckInterval)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "8px" }}>
                        Umístění
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant={pendingLocationFilter === "all" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPendingLocationFilter("all")}
                        >
                          Vše
                        </Button>
                        {Object.entries(locationLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            variant={pendingLocationFilter === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPendingLocationFilter(key as Location)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {filteredPendingChecks.slice(0, 5).map((check) => {
                    const machine = machines.find((m) => m.id === check.machineId);
                    if (!machine) return null;
                    return (
                      <div
                        key={check.id}
                        className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => onCheckClick(check)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                              {machine.name}
                            </p>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                              {check.task}
                            </p>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginTop: "4px" }}>
                              {locationLabels[machine.location]}
                            </p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--destructive)", marginTop: "4px", fontWeight: "var(--font-weight-medium)" }}>
                              Termín: {format(new Date(check.scheduledDate), "d. M. yyyy", { locale: cs })}
                            </p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
                            {intervalLabels[check.interval]}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {filteredPendingChecks.length > 5 && (
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", textAlign: "center", marginTop: "8px" }}>
                      a dalších {filteredPendingChecks.length - 5}...
                    </p>
                  )}
                  {filteredPendingChecks.length === 0 && (
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", textAlign: "center", padding: "16px" }}>
                      Žádné kontroly neodpovídají filtrům
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="p-3 sm:p-4">
              <h4 className="mb-3 text-sm sm:text-base">Poslední aktivita</h4>
              <div className="space-y-2 sm:space-y-3">
                {checks
                  .filter((c) => c.completedAt)
                  .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
                  .slice(0, 5)
                  .map((check) => {
                    const machine = machines.find((m) => m.id === check.machineId);
                    if (!machine) return null;
                    return (
                      <div
                        key={check.id}
                        className="flex items-start gap-3 pb-3 cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onClick={() => onCheckClick?.(check)}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              check.status === "completed"
                                ? "var(--chart-2)"
                                : check.status === "issue"
                                ? "var(--chart-1)"
                                : "var(--chart-4)",
                          }}
                        >
                          {check.status === "completed" && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                          {check.status === "issue" && (
                            <AlertTriangle className="w-4 h-4 text-white" />
                          )}
                          {check.status === "cannot_complete" && (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                            {machine.name}
                          </p>
                          <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                            {check.task}
                          </p>
                          <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginTop: "4px" }}>
                            {check.completedBy} •{" "}
                            {check.completedAt?.toLocaleString("cs-CZ", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {/* Date filter for history */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {historyDate ? "Filtrováno podle data" : "Všechna data"}
              </h3>
              <div className="flex items-center gap-2">
                {historyDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHistoryDate("")}
                    className="h-8 text-xs"
                  >
                    Zrušit filtr
                  </Button>
                )}
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="text-xs sm:text-sm px-2 py-1 border rounded-md"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-340px)]">
              <div className="space-y-3 sm:space-y-4">
                {sortedDates.map((dateKey) => {
                  const dateChecks = checksByDate[dateKey];
                  const completed = dateChecks.filter(
                    (c) => c.status === "completed" || c.status === "issue" || c.status === "cannot_complete"
                  ).length;
                  const total = dateChecks.length;
                  const percentage = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <Card key={dateKey} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4>{dateKey}</h4>
                        <Badge variant="outline">
                          {completed} / {total}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="h-2 mb-3" />
                      <div className="space-y-2">
                        {dateChecks.map((check) => {
                          const machine = machines.find(
                            (m) => m.id === check.machineId
                          );
                          if (!machine) return null;
                          return (
                            <div
                              key={check.id}
                              className="p-2 bg-muted rounded flex items-center justify-between"
                            >
                              <div>
                                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                                  {machine.name}
                                </p>
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                                  {check.task}
                                </p>
                              </div>
                              {check.status === "completed" && (
                                <CheckCircle2
                                  className="w-5 h-5"
                                  style={{ color: "var(--chart-2)" }}
                                />
                              )}
                              {check.status === "issue" && (
                                <AlertTriangle
                                  className="w-5 h-5"
                                  style={{ color: "var(--chart-1)" }}
                                />
                              )}
                              {check.status === "cannot_complete" && (
                                <XCircle
                                  className="w-5 h-5"
                                  style={{ color: "var(--chart-4)" }}
                                />
                              )}
                              {check.status === "pending" && (
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
            {/* Date filter for issues */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {issueDate ? "Filtrováno podle data" : "Všechna data"}
              </h3>
              <div className="flex items-center gap-2">
                {issueDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIssueDate("")}
                    className="h-8 text-xs"
                  >
                    Zrušit filtr
                  </Button>
                )}
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="text-xs sm:text-sm px-2 py-1 border rounded-md"
                />
              </div>
            </div>

            <Card className="p-3 sm:p-4">
              <p className="text-sm text-muted-foreground">
                {isJiraConfigured()
                  ? "Nově nahlášené závady se automaticky zkouší založit i do Jira."
                  : "Jira není nakonfigurovaná. Vyplňte hodnoty v .env podle .env.example."}
              </p>
            </Card>

            {filteredIssueChecks.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" style={{ color: "var(--chart-2)" }} />
                <p className="text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
                  Žádné nahlášené závady
                </p>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredIssueChecks.map((check) => {
                  const machine = machines.find((m) => m.id === check.machineId);
                  if (!machine) return null;
                  return (
                    <Card key={check.id} className="p-4 border-destructive/20">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: "var(--chart-1)" }}
                        >
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-1">{machine.name}</h4>
                          <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginBottom: "8px" }}>
                            {locationLabels[machine.location]} • {check.task}
                          </p>
                          <div className="p-3 bg-destructive/10 rounded-lg">
                            <p style={{ fontSize: "var(--text-sm)" }}>{check.issue}</p>
                          </div>
                          {(check.jiraIssueKey || check.jiraSyncError) && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {check.jiraIssueUrl && check.jiraIssueKey && (
                                <Button asChild size="sm" variant="outline">
                                  <a href={check.jiraIssueUrl} target="_blank" rel="noreferrer">
                                    Jira: {check.jiraIssueKey}
                                  </a>
                                </Button>
                              )}
                              {check.jiraSyncError && (
                                <Badge variant="outline" className="border-destructive/30 text-destructive">
                                  Jira sync: chyba
                                </Badge>
                              )}
                            </div>
                          )}
                          {check.jiraSyncError && (
                            <p className="mt-2 text-sm text-destructive">{check.jiraSyncError}</p>
                          )}
                          {check.completedBy && check.completedAt && (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginTop: "8px" }}>
                              Nahlásil: {check.completedBy} •{" "}
                              {check.completedAt.toLocaleString("cs-CZ", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Cannot Complete Checks */}
            {filteredCannotCompleteChecks.length > 0 && (
              <>
                <h4 className="pt-4">Nelze provést</h4>
                <div className="space-y-3">
                  {filteredCannotCompleteChecks.map((check) => {
                    const machine = machines.find((m) => m.id === check.machineId);
                    if (!machine) return null;
                    return (
                      <Card key={check.id} className="p-4" style={{ borderColor: "var(--chart-4)/20" }}>
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "var(--chart-4)" }}
                          >
                            <XCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-1">{machine.name}</h4>
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginBottom: "8px" }}>
                              {locationLabels[machine.location]} • {check.task}
                            </p>
                            {check.note && (
                              <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--chart-4)/10" }}>
                                <p style={{ fontSize: "var(--text-sm)" }}>{check.note}</p>
                              </div>
                            )}
                            {check.completedBy && check.completedAt && (
                              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)", marginTop: "8px" }}>
                                Nahlásil: {check.completedBy} •{" "}
                                {check.completedAt.toLocaleString("cs-CZ", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
