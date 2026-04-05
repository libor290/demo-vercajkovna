import {
  ArrowLeft,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/demo-client/components/ui/dialog";
import { Label } from "@/demo-client/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/demo-client/components/ui/popover";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Textarea } from "@/demo-client/components/ui/textarea";
import { SubmittedWork } from "@/demo-client/data/mockData";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface SubmittedWorkScreenProps {
  submittedWork: SubmittedWork[];
  onBack: () => void;
  onIssueClick?: (date: Date) => void;
  onUpdateWork?: (id: string, updates: Partial<SubmittedWork>) => void;
  adminName?: string;
}

export function SubmittedWorkScreen({ submittedWork, onBack, onIssueClick, onUpdateWork, adminName = "Administrátor" }: SubmittedWorkScreenProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "submitted" | "approved" | "rejected">("all");
  const [sortBy, setSortBy] = useState<"date" | "employee">("date");
  const [showFilters, setShowFilters] = useState(false);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [workToReject, setWorkToReject] = useState<SubmittedWork | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Confirmation dialog state (for reverting / switching status)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Initialize with all months expanded
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(
    new Set(submittedWork.map((w) => {
      const date = new Date(w.workDate);
      return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    }))
  );

  // Czech month names in nominative form
  const czechMonths = ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"];

  const getMonthHeader = (date: Date): string => {
    const monthName = czechMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${monthName[0].toUpperCase()}${monthName.slice(1)} ${year}`;
  };

  // Get unique employees
  const employees = useMemo(() => {
    const unique = Array.from(new Set(submittedWork.map((w) => w.employeeId)));
    return unique.map((id) => ({
      id,
      name: submittedWork.find((w) => w.employeeId === id)?.employeeName || "",
    }));
  }, [submittedWork]);

  // Approve (no confirmation needed — it's the primary action from "submitted")
  const handleApprove = (work: SubmittedWork) => {
    if (!onUpdateWork) return;
    onUpdateWork(work.id, {
      status: "approved",
      reviewedBy: adminName,
      reviewedAt: new Date(),
    });
  };

  // Open reject dialog (from any state)
  const openRejectDialog = (work: SubmittedWork) => {
    setWorkToReject(work);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  // Confirm rejection
  const handleConfirmReject = () => {
    if (!workToReject || !onUpdateWork) return;
    onUpdateWork(workToReject.id, {
      status: "rejected",
      reviewedBy: adminName,
      reviewedAt: new Date(),
      rejectionReason: rejectionReason.trim() || undefined,
    });
    setRejectDialogOpen(false);
    setWorkToReject(null);
    setRejectionReason("");
  };

  // Ask for confirmation before a sensitive state change
  const askConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setPendingAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    pendingAction?.();
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  // Revert to "submitted" (with confirmation)
  const handleRevert = (work: SubmittedWork) => {
    askConfirm(
      `Opravdu chcete vrátit práci zaměstnance ${work.employeeName} zpět ke schválení?`,
      () => onUpdateWork?.(work.id, {
        status: "submitted",
        reviewedBy: undefined,
        reviewedAt: undefined,
        rejectionReason: undefined,
      })
    );
  };

  // Switch approved → rejected (with confirmation, then opens reason dialog)
  const handleApprovedToRejected = (work: SubmittedWork) => {
    askConfirm(
      `Opravdu chcete změnit stav z „Schváleno" na „Zamítnuto"?`,
      () => openRejectDialog(work)
    );
  };

  // Switch rejected → approved (with confirmation)
  const handleRejectedToApproved = (work: SubmittedWork) => {
    askConfirm(
      `Opravdu chcete změnit stav z „Zamítnuto" na „Schváleno"?`,
      () => onUpdateWork?.(work.id, {
        status: "approved",
        reviewedBy: adminName,
        reviewedAt: new Date(),
        rejectionReason: undefined,
      })
    );
  };

  // Filter and sort
  const filteredWork = useMemo(() => {
    let result = submittedWork.filter((work) => {
      const matchesEmployee = selectedEmployee === "all" || work.employeeId === selectedEmployee;
      const matchesStatus = selectedStatus === "all" || work.status === selectedStatus;
      return matchesEmployee && matchesStatus;
    });

    // Sort
    if (sortBy === "date") {
      result.sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
    } else {
      result.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    }

    return result;
  }, [submittedWork, selectedEmployee, sortBy]);

  // Group by month
  const workByMonth = useMemo(() => {
    const grouped: Record<string, SubmittedWork[]> = {};

    filteredWork.forEach((work) => {
      const date = new Date(work.workDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(work);
    });

    // Sort each month's work by date
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => b.workDate.getTime() - a.workDate.getTime());
    });

    return grouped;
  }, [filteredWork]);

  // Get sorted month keys (newest first)
  const sortedMonths = useMemo(() => {
    return Object.keys(workByMonth).sort((a, b) => {
      const dateA = new Date(workByMonth[a][0].workDate);
      const dateB = new Date(workByMonth[b][0].workDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [workByMonth]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const getStatusBadge = (work: SubmittedWork) => {
    if (work.status === "submitted" && onUpdateWork) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted transition-colors select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <Clock className="w-3 h-3 mr-1" />
              Čeká na schválení
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5" align="end" onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-green-50 text-green-700 transition-colors"
              onClick={() => handleApprove(work)}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Schválit
            </button>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-red-50 text-red-600 transition-colors"
              onClick={() => openRejectDialog(work)}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Zamítnout
            </button>
          </PopoverContent>
        </Popover>
      );
    }

    if (work.status === "approved" && onUpdateWork) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              className="bg-green-600 text-white text-xs cursor-pointer hover:bg-green-700 transition-colors select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Schváleno
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1.5" align="end" onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-red-50 text-red-600 transition-colors"
              onClick={() => handleApprovedToRejected(work)}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Změnit na zamítnuto
            </button>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted text-muted-foreground transition-colors"
              onClick={() => handleRevert(work)}
            >
              <Clock className="w-3.5 h-3.5" />
              Vrátit ke schválení
            </button>
          </PopoverContent>
        </Popover>
      );
    }

    if (work.status === "rejected" && onUpdateWork) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              className="bg-red-600 text-white text-xs cursor-pointer hover:bg-red-700 transition-colors select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Zamítnuto
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1.5" align="end" onClick={(e) => e.stopPropagation()}>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-green-50 text-green-700 transition-colors"
              onClick={() => handleRejectedToApproved(work)}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Změnit na schváleno
            </button>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-muted text-muted-foreground transition-colors"
              onClick={() => handleRevert(work)}
            >
              <Clock className="w-3.5 h-3.5" />
              Vrátit ke schválení
            </button>
          </PopoverContent>
        </Popover>
      );
    }

    switch (work.status) {
      case "approved":
        return (
          <Badge className="bg-green-600 text-white text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Schváleno
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 text-white text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Zamítnuto
          </Badge>
        );
      case "submitted":
        return (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Čeká na schválení
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Zkontrolováno
          </Badge>
        );
      default:
        return <Badge className="text-xs">{work.status}</Badge>;
    }
  };

  const handleExport = (work?: SubmittedWork, month?: string) => {
    let dataToExport: SubmittedWork[] = [];
    let filename = "";

    if (work) {
      // Export single work
      dataToExport = [work];
      filename = `odevzdana_prace_${work.employeeName}_${format(new Date(work.workDate), "dd-MM-yyyy")}.csv`;
    } else if (month) {
      // Export specific month
      dataToExport = workByMonth[month] || [];
      const monthSlug = month.toLowerCase().replace(/\s+/g, "_");
      filename = `odevzdane_prace_${monthSlug}.csv`;
    } else {
      // Export all filtered work
      dataToExport = filteredWork;
      filename = `odevzdane_prace_${format(new Date(), "dd-MM-yyyy")}.csv`;
    }

    const csv = [
      ["Zaměstnanec", "Datum práce", "Odevzdáno", "Celkem", "Splněno", "Závady", "Nelze", "Stav"].join(","),
      ...dataToExport.map((w) =>
        [
          w.employeeName,
          format(new Date(w.workDate), "d. M. yyyy", { locale: cs }),
          format(new Date(w.submittedDate), "d. M. yyyy HH:mm", { locale: cs }),
          w.totalChecks,
          w.completedChecks,
          w.issueCount,
          w.cannotCompleteCount,
          w.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg md:text-xl truncate">Odevzdané práce</h2>
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="mt-3 bg-card p-3 rounded-lg border border-border space-y-3">
              <div>
                <label className="text-xs font-medium block mb-2">Zaměstnanec</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedEmployee === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEmployee("all")}
                  >
                    Všichni
                  </Button>
                  {employees.map((emp) => (
                    <Button
                      key={emp.id}
                      variant={selectedEmployee === emp.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedEmployee(emp.id)}
                    >
                      {emp.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-2">Stav</label>
                <div className="flex flex-wrap gap-2">
                  {(["all", "submitted", "approved", "rejected"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={selectedStatus === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus(s)}
                    >
                      {s === "all" ? "Vše" : s === "submitted" ? "Čeká" : s === "approved" ? "Schváleno" : "Zamítnuto"}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium block mb-2">Řazení</label>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "date" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("date")}
                  >
                    Podle data
                  </Button>
                  <Button
                    variant={sortBy === "employee" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("employee")}
                  >
                    Podle zaměstnance
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work List by Month */}
      <ScrollArea className="h-[calc(100vh-300px)] sm:h-[calc(100vh-350px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {filteredWork.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">Žádné odevzdané práce neodpovídají filtrům</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {sortedMonths.map((monthKey) => {
                const monthWorks = workByMonth[monthKey];
                return (
                  <div key={monthKey}>
                    {/* Month Header */}
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => toggleMonth(monthKey)}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-lg font-semibold">{getMonthHeader(monthWorks[0].workDate)}</h3>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${expandedMonths.has(monthKey) ? "rotate-180" : ""}`}
                        />
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(undefined, monthKey)}
                        className="min-h-[32px]"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs">Export měsíce</span>
                      </Button>
                    </div>

                    {/* Month's Work Cards */}
                    {expandedMonths.has(monthKey) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 items-start">
                      {monthWorks.map((work) => {
                        const hasIssues = work.issueCount > 0;
                        const isIncomplete = work.completedChecks < work.totalChecks;

                        return (
                          <Card
                            key={work.id}
                            className={`p-2.5 sm:p-3 transition-shadow ${
                              hasIssues || work.cannotCompleteCount > 0
                                ? "cursor-pointer hover:shadow-md"
                                : "hover:shadow-md"
                            } ${
                              hasIssues
                                ? "border-red-500/50 bg-red-50/30"
                                : isIncomplete
                                ? "border-yellow-500/50 bg-yellow-50/30"
                                : ""
                            }`}
                            onClick={() => {
                              if ((hasIssues || work.cannotCompleteCount > 0) && onIssueClick) {
                                onIssueClick(new Date(work.workDate));
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2 flex-1">
                                <h3 className="text-sm sm:text-base font-semibold">
                                  {format(new Date(work.workDate), "d. M. yyyy", { locale: cs })}
                                </h3>
                                {hasIssues && (
                                  <div title="Obsahuje závady">
                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                  </div>
                                )}
                                {!hasIssues && isIncomplete && (
                                  <div title="Nekompletní">
                                    <XCircle className="w-4 h-4 text-yellow-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {getStatusBadge(work)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleExport(work)}
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  title="Exportovat"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground mb-2">
                              {work.employeeName} • {format(new Date(work.submittedDate), "d. M. HH:mm", { locale: cs })}
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                              <span className="text-muted-foreground">Celkem: <span className="font-semibold text-foreground">{work.totalChecks}</span></span>
                              <span className="text-green-700">Splněno: <span className="font-semibold">{work.completedChecks}</span></span>
                              {work.issueCount > 0 && (
                                <span className="text-red-700">Závady: <span className="font-semibold">{work.issueCount}</span></span>
                              )}
                              {work.cannotCompleteCount > 0 && (
                                <span className="text-gray-500">Nelze: <span className="font-semibold">{work.cannotCompleteCount}</span></span>
                              )}
                            </div>

                            {/* Reviewer info + rejection reason — compact, inline */}
                            {work.reviewedBy && work.reviewedAt && (
                              <div className="mt-1.5 text-xs text-muted-foreground">
                                {work.status === "approved" ? "Schválil(a)" : "Zamítl(a)"}: {work.reviewedBy} •{" "}
                                {format(new Date(work.reviewedAt), "d. M. HH:mm", { locale: cs })}
                                {work.status === "rejected" && work.rejectionReason && (
                                  <span className="block text-red-600 mt-0.5">
                                    Důvod: {work.rejectionReason}
                                  </span>
                                )}
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Potvrdit změnu</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{confirmMessage}</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleConfirmAction}>
              Potvrdit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Zamítnout práci</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Zamítáte práci zaměstnance <strong>{workToReject?.employeeName}</strong> za{" "}
            <strong>
              {workToReject && format(new Date(workToReject.workDate), "d. M. yyyy", { locale: cs })}
            </strong>.
          </p>
          <div className="mt-2">
            <Label htmlFor="rejection-reason">Důvod zamítnutí (volitelné)</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Popište důvod zamítnutí..."
              className="mt-2 min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Zrušit
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Zamítnout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
