import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  LogOut,
  Search,
  User as UserIcon,
  XCircle,
  Send
} from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/demo-client/components/ui/dialog";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/demo-client/components/ui/select";
import { Textarea } from "@/demo-client/components/ui/textarea";
import { NotificationPanel } from "@/demo-client/components/NotificationPanel";
import { Check, Notification, users, intervalLabels, locationLabels, machines, type CheckInterval, type CheckStatus, type Location } from "@/demo-client/data/mockData";
import { useMemo, useState } from "react";

interface DashboardScreenProps {
  checks: Check[];
  notifications: Notification[];
  role: "operator" | "admin";
  onCheckClick: (check: Check) => void;
  onLogout: () => void;
  onAdminMenuClick?: () => void;
  onHistoryClick?: () => void;
  onComplete: (checkId: string, note?: string) => void;
  onIssue: (checkId: string, issue: string, note?: string) => Promise<void> | void;
  onCannotComplete: (checkId: string, reason: string) => void;
  onResetStatus: (checkId: string) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onSendAdminReminder?: (checkId: string, userId: string) => void;
}

export function DashboardScreen({
  checks,
  notifications,
  role,
  onCheckClick,
  onLogout,
  onAdminMenuClick,
  onHistoryClick,
  onComplete,
  onIssue,
  onCannotComplete,
  onResetStatus,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onSendAdminReminder,
}: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<Location | "all">("all");
  const [intervalFilter, setIntervalFilter] = useState<CheckInterval | "all">("all");
  const [statusFilter, setStatusFilter] = useState<CheckStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showIntervalBreakdown, setShowIntervalBreakdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dialog states
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [cannotCompleteDialogOpen, setCannotCompleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [selectedCheckForAction, setSelectedCheckForAction] = useState<Check | null>(null);
  const [issueText, setIssueText] = useState("");
  const [issuePhoto, setIssuePhoto] = useState<string>("");
  const [cannotCompleteReason, setCannotCompleteReason] = useState("");
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedCheckForReminder, setSelectedCheckForReminder] = useState<Check | null>(null);
  const [selectedUserForReminder, setSelectedUserForReminder] = useState<string>("");

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const todayChecks = useMemo(() => {
    return checks.filter((check) => {
      const isToday =
        check.scheduledDate.toDateString() === new Date().toDateString();
      if (!isToday) return false;

      const machine = machines.find((m) => m.id === check.machineId);
      if (!machine) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !machine.name.toLowerCase().includes(query) &&
          !check.task.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Location filter
      if (locationFilter !== "all" && machine.location !== locationFilter) {
        return false;
      }

      // Interval filter
      if (intervalFilter !== "all" && check.interval !== intervalFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && check.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [checks, searchQuery, locationFilter, intervalFilter, statusFilter]);

  const completedCount = todayChecks.filter(
    (c) => c.status === "completed" || c.status === "issue" || c.status === "cannot_complete"
  ).length;
  const totalCount = todayChecks.length;

  // Count by interval
  const intervalCounts = useMemo(() => {
    const counts: Record<CheckInterval, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    };

    todayChecks.forEach((check) => {
      counts[check.interval]++;
    });

    return counts;
  }, [todayChecks]);

  const getStatusBadge = (status: Check["status"]) => {
    switch (status) {
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

  const handleCompleteClick = (e: React.MouseEvent, check: Check) => {
    e.stopPropagation();
    onComplete(check.id);
  };

  const handleIssueClick = (e: React.MouseEvent, check: Check) => {
    e.stopPropagation();
    setSelectedCheckForAction(check);
    setIssueText("");
    setIssuePhoto("");
    setIssueDialogOpen(true);
  };

  const handleCannotCompleteClick = (e: React.MouseEvent, check: Check) => {
    e.stopPropagation();
    setSelectedCheckForAction(check);
    setCannotCompleteReason("");
    setCannotCompleteDialogOpen(true);
  };

  const handleIssueSubmit = () => {
    if (!issueText.trim()) {
      alert("Prosím vyplňte popis závady");
      return;
    }
    if (selectedCheckForAction) {
      onIssue(selectedCheckForAction.id, issueText, issuePhoto);
    }
    setIssueDialogOpen(false);
    setIssueText("");
    setIssuePhoto("");
    setSelectedCheckForAction(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIssuePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setIssuePhoto("");
  };

  const handleCannotCompleteSubmit = () => {
    if (!cannotCompleteReason.trim()) {
      alert("Prosím vyplňte důvod");
      return;
    }
    if (selectedCheckForAction) {
      onCannotComplete(selectedCheckForAction.id, cannotCompleteReason);
    }
    setCannotCompleteDialogOpen(false);
    setCannotCompleteReason("");
    setSelectedCheckForAction(null);
  };

  const handleReminderClick = (e: React.MouseEvent, check: Check) => {
    e.stopPropagation();
    setSelectedCheckForReminder(check);
    setSelectedUserForReminder("");
    setReminderDialogOpen(true);
  };

  const handleReminderSubmit = () => {
    if (!selectedUserForReminder) {
      alert("Prosím vyberte uživatele");
      return;
    }
    if (selectedCheckForReminder && onSendAdminReminder) {
      onSendAdminReminder(selectedCheckForReminder.id, selectedUserForReminder);
      alert("Upozornění odesláno");
    }
    setReminderDialogOpen(false);
    setSelectedUserForReminder("");
    setSelectedCheckForReminder(null);
  };

  const handleStatusBadgeClick = (e: React.MouseEvent, check: Check) => {
    e.stopPropagation();
    if (check.status !== "pending") {
      setSelectedCheckForAction(check);
      setResetDialogOpen(true);
    }
  };

  const handleResetConfirm = () => {
    if (selectedCheckForAction) {
      onResetStatus(selectedCheckForAction.id);
    }
    setResetDialogOpen(false);
    setSelectedCheckForAction(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-[var(--elevation-sm)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="mb-1 text-lg sm:text-xl md:text-2xl">Kontroly</h2>
              <p className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                {role === "admin" ? "Administrátor" : "Operátor"}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(true)}
                className="relative h-9 w-9 sm:h-10 sm:w-10"
                title="Upozornění"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                    {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                  </span>
                )}
              </Button>
              {role === "admin" && onAdminMenuClick && (
                <Button variant="ghost" size="icon" onClick={onAdminMenuClick} className="h-9 w-9 sm:h-10 sm:w-10" title="Administrace">
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onLogout} className="h-9 w-9 sm:h-10 sm:w-10" title="Odhlásit">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Stats Card */}
          <Card
            className="p-3 sm:p-4 mb-3 sm:mb-4 bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
            onClick={onHistoryClick}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs sm:text-sm" style={{ opacity: 0.9 }}>Dnes vás čeká</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl mt-1">
                  {totalCount} {totalCount === 1 ? "kontrola" : totalCount < 5 ? "kontroly" : "kontrol"}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm" style={{ opacity: 0.9 }}>Splněno</p>
                <h1 className="text-xl sm:text-2xl md:text-3xl mt-1">
                  {completedCount} / {totalCount}
                </h1>
              </div>
            </div>

            {/* Expandable interval breakdown toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowIntervalBreakdown(!showIntervalBreakdown);
              }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-primary-foreground/10 transition-colors text-primary-foreground text-xs sm:text-sm font-medium"
            >
              <span>Detail podle intervalu</span>
              <ChevronDown
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform flex-shrink-0 ${showIntervalBreakdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Interval breakdown summary */}
            {showIntervalBreakdown && (
              <div
                className="mt-3 pt-3 flex flex-wrap gap-2"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.entries(intervalCounts).map(([interval, count]) => {
                  return (
                    <div
                      key={interval}
                      className="flex items-center gap-2 text-primary-foreground py-1.5 px-3 rounded bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                    >
                      <span className="text-xs sm:text-sm" style={{ opacity: 0.9 }}>
                        {intervalLabels[interval as CheckInterval]}:
                      </span>
                      <span className="text-sm sm:text-base font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hledat stroj nebo úkon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input-background"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtry
              </Button>
              {(locationFilter !== "all" || intervalFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocationFilter("all");
                    setIntervalFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Zrušit
                </Button>
              )}
            </div>

            {showFilters && (
              <div className="bg-card p-3 rounded-lg border border-border space-y-3">
                <div>
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "8px" }}>
                    Umístění
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={locationFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocationFilter("all")}
                    >
                      Vše
                    </Button>
                    {Object.entries(locationLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={locationFilter === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLocationFilter(key as Location)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "8px" }}>
                    Interval
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={intervalFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIntervalFilter("all")}
                    >
                      Vše
                    </Button>
                    {Object.entries(intervalLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={intervalFilter === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIntervalFilter(key as CheckInterval)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", display: "block", marginBottom: "8px" }}>
                    Stav
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      Vše
                    </Button>
                    {Object.entries({
                      completed: "Splněno",
                      issue: "Závada",
                      cannot_complete: "Nelze provést",
                      pending: "Čeká",
                    }).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={statusFilter === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(key as CheckStatus)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Statistics Cards */}
      {role === "admin" && (
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-1.5">
          <div className="grid grid-cols-4 gap-1">
            {/* Total Checks */}
            <Card
              className="p-1.5 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setStatusFilter("all")}
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-foreground/80 leading-none">Celkem</div>
                <div className="text-base font-bold leading-none">{todayChecks.length}</div>
              </div>
            </Card>

            {/* Pending */}
            <Card
              className="p-1.5 cursor-pointer hover:bg-amber-50 transition-colors border-l-2"
              style={{ borderLeftColor: "var(--chart-4)" }}
              onClick={() => setStatusFilter("pending")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-foreground/80 leading-none">
                  <Clock className="w-2 h-2" />
                  <span>Čekají</span>
                </div>
                <div className="text-base font-bold leading-none" style={{ color: "var(--chart-4)" }}>
                  {todayChecks.filter((c) => c.status === "pending").length}
                </div>
              </div>
            </Card>

            {/* Issues */}
            <Card
              className="p-1.5 cursor-pointer hover:bg-red-50 transition-colors border-l-2"
              style={{ borderLeftColor: "var(--chart-1)" }}
              onClick={() => setStatusFilter("issue")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-foreground/80 leading-none">
                  <AlertTriangle className="w-2 h-2" />
                  <span>Závady</span>
                </div>
                <div className="text-base font-bold leading-none text-destructive">
                  {todayChecks.filter((c) => c.status === "issue").length}
                </div>
              </div>
            </Card>

            {/* Completed */}
            <Card
              className="p-1.5 cursor-pointer hover:bg-green-50 transition-colors border-l-2"
              style={{ borderLeftColor: "var(--chart-2)" }}
              onClick={() => setStatusFilter("completed")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-foreground/80 leading-none">
                  <CheckCircle2 className="w-2 h-2" />
                  <span>Splněno</span>
                </div>
                <div className="text-base font-bold leading-none" style={{ color: "var(--chart-2)" }}>
                  {todayChecks.filter((c) => c.status === "completed").length}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Checks List */}
      <ScrollArea className="h-[calc(100vh-350px)] sm:h-[calc(100vh-400px)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 pb-20 sm:pb-24">
          {todayChecks.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
                {searchQuery || locationFilter !== "all" || intervalFilter !== "all" || statusFilter !== "all"
                  ? "Žádné kontroly neodpovídají filtrům"
                  : "Žádné kontroly pro dnes"}
              </p>
            </Card>
          ) : (
            todayChecks.map((check) => {
              const machine = machines.find((m) => m.id === check.machineId);
              if (!machine) return null;

              const isCompleted = check.status === "completed" || check.status === "issue" || check.status === "cannot_complete";

              return (
                <Card
                  key={check.id}
                  className={`p-3 sm:p-4 hover:shadow-md transition-shadow active:bg-muted/50 ${isCompleted ? "opacity-50" : ""}`}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onCheckClick(check)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm sm:text-base font-semibold">
                            {machine.name}
                          </h3>
                          <div
                            onClick={(e) => handleStatusBadgeClick(e, check)}
                            className={check.status !== "pending" ? "cursor-pointer" : ""}
                          >
                            {getStatusBadge(check.status)}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                          {locationLabels[machine.location]} • {intervalLabels[check.interval]}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {role === "admin" && onSendAdminReminder && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary hover:bg-primary/20 hover:text-primary transition-all"
                            onClick={(e) => handleReminderClick(e, check)}
                            title="Upozornit zaměstnance"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm mt-2">
                      {check.task}
                    </p>
                    {check.completedBy && (
                      <p className="text-xs sm:text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
                        Provedl: {check.completedBy} •{" "}
                        {check.completedAt?.toLocaleTimeString("cs-CZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons - only show for pending checks */}
                  {check.status === "pending" && (
                    <div
                      className="flex flex-col gap-2 mt-3 pt-3"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-[var(--chart-2)] hover:bg-[var(--chart-2)]/90 text-white min-h-[44px]"
                          onClick={(e) => handleCompleteClick(e, check)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-sm sm:text-base">Splněno</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 btn-issue-outline min-h-[44px]"
                          onClick={(e) => handleIssueClick(e, check)}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-sm sm:text-base">Závada</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 min-h-[44px] hover:bg-muted/50 transition-colors"
                          onClick={(e) => handleCannotCompleteClick(e, check)}
                        >
                          <XCircle className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-sm sm:text-base">Nelze</span>
                        </Button>
                      </div>
                      {role === "admin" && onSendAdminReminder && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full min-h-[44px] border-primary text-primary hover:bg-primary/10"
                          onClick={(e) => handleReminderClick(e, check)}
                        >
                          <Bell className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="text-sm sm:text-base">Upozornit zaměstnance</span>
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Floating Submit Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--elevation-md)] rounded-full px-4 sm:px-6 h-12 sm:h-14"
          onClick={() => setSubmitDialogOpen(true)}
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Odevzdat</span>
        </Button>
      </div>

      {/* Issue Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Záznam závady</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="issueText">Popis závady</Label>
            <Textarea
              id="issueText"
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Popis závady..."
            />
            <div className="mt-2">
              <Label htmlFor="issuePhoto">Fotografie závady</Label>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById("issuePhotoInput")?.click()}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Přidat fotografii
                </Button>
                {issuePhoto && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRemovePhoto}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Odebrat fotografii
                  </Button>
                )}
                <input
                  id="issuePhotoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              {issuePhoto && (
                <div className="mt-2">
                  <img
                    src={issuePhoto}
                    alt="Issue"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIssueDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleIssueSubmit}
            >
              Potvrdit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cannot Complete Dialog */}
      <Dialog open={cannotCompleteDialogOpen} onOpenChange={setCannotCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Důvod nelze provést</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="cannotCompleteReason">Důvod nelze provést</Label>
            <Textarea
              id="cannotCompleteReason"
              value={cannotCompleteReason}
              onChange={(e) => setCannotCompleteReason(e.target.value)}
              placeholder="Důvod nelze provést..."
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCannotCompleteDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCannotCompleteSubmit}
            >
              Potvrdit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Status Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetovat stav kontroly</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
              Opravdu chcete resetovat stav kontroly?
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleResetConfirm}
            >
              Potvrdit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Work Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odevzdat dnešní práci</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                  Přehled dnešních kontrol
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                    Celkem kontrol:
                  </span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                    {totalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                    Splněno:
                  </span>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                    {completedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-destructive/10 rounded-lg border border-destructive/20">
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--destructive)" }}>
                    Nesplněno:
                  </span>
                  <span style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-bold)", color: "var(--destructive)" }}>
                    {totalCount - completedCount}
                  </span>
                </div>
              </div>
            </div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
              Potvrzením odevzdáte dnešní práci. Administrátor bude informován o dokončení kontrol.
            </p>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitDialogOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSubmitDialogOpen(false);
                setSubmitConfirmOpen(true);
              }}
            >
              Odevzdat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potvrdit odevzdání</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p style={{ fontSize: "var(--text-sm)" }}>
              Opravdu chcete odevzdat dnešní práci? Máte {totalCount - completedCount} nesplněných kontrol.
            </p>
            <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              <p style={{ fontSize: "var(--text-xs)", color: "var(--destructive)", fontWeight: "var(--font-weight-medium)" }}>
                Nesplněné kontroly: {totalCount - completedCount}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitConfirmOpen(false)}
            >
              Zrušit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSubmitConfirmOpen(false);
                alert("Dnešní práce byla úspěšně odevzdána!");
              }}
            >
              Odevzdat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upozornit zaměstnance</DialogTitle>
          </DialogHeader>
          {selectedCheckForReminder && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Vyberte zaměstnance, kterého chcete upozornit na kontrolu:{" "}
                <strong>{selectedCheckForReminder.task}</strong>
              </p>
              <div>
                <Label htmlFor="user-select">Zaměstnanec *</Label>
                <Select value={selectedUserForReminder} onValueChange={setSelectedUserForReminder}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Vyberte zaměstnance" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.role === "operator" && u.status === "approved")
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button onClick={handleReminderSubmit}>
                  <Bell className="w-4 h-4 mr-2" />
                  Odeslat upozornění
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          checks={checks}
          onNotificationClick={(notification) => {
            // If notification has checkId, navigate to that check
            if (notification.checkId) {
              const check = checks.find((c) => c.id === notification.checkId);
              if (check) {
                onCheckClick(check);
              }
            }
            setShowNotifications(false);
          }}
          onMarkAsRead={onMarkNotificationAsRead}
          onMarkAllAsRead={onMarkAllNotificationsAsRead}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
