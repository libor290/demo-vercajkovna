import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Label } from "@/demo-client/components/ui/label";
import { Textarea } from "@/demo-client/components/ui/textarea";
import { Check, intervalLabels, locationLabels, machines } from "@/demo-client/data/mockData";
import { isJiraConfigured } from "@/demo-client/lib/jira";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Settings as SettingsIcon,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface CheckDetailScreenProps {
  check: Check;
  onBack: () => void;
  onComplete: (checkId: string, note?: string) => void;
  onIssue: (checkId: string, issue: string, note?: string) => Promise<void> | void;
  onCannotComplete: (checkId: string, reason: string) => void;
}

export function CheckDetailScreen({
  check,
  onBack,
  onComplete,
  onIssue,
  onCannotComplete,
}: CheckDetailScreenProps) {
  const [note, setNote] = useState(check.note || "");
  const [issueText, setIssueText] = useState(check.issue || "");
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showCannotCompleteForm, setShowCannotCompleteForm] = useState(false);
  const [cannotCompleteReason, setCannotCompleteReason] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  const machine = machines.find((m) => m.id === check.machineId);
  if (!machine) return null;

  const isCompleted =
    check.status === "completed" ||
    check.status === "issue" ||
    check.status === "cannot_complete";

  const handleComplete = () => {
    onComplete(check.id, note);
  };

  const handleIssue = async () => {
    if (!issueText.trim()) {
      alert("Prosím popište závadu");
      return;
    }

    setIsSubmittingIssue(true);
    try {
      await onIssue(check.id, issueText, note);
      setShowIssueForm(false);
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleCannotComplete = () => {
    if (!cannotCompleteReason.trim()) {
      alert("Prosím uveďte důvod");
      return;
    }
    onCannotComplete(check.id, cannotCompleteReason);
    setShowCannotCompleteForm(false);
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
              <h2 className="text-base sm:text-lg md:text-xl">Detail kontroly</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 pb-6">
        {/* Machine Info */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="mb-2 text-lg sm:text-xl md:text-2xl">{machine.name}</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">
                    {locationLabels[machine.location]}
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">
                    {intervalLabels[check.interval]}
                  </span>
                </div>
              </div>
            </div>
            {check.status === "completed" && (
              <Badge className="bg-[var(--chart-2)] text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Splněno
              </Badge>
            )}
            {check.status === "issue" && (
              <Badge className="bg-[var(--chart-1)] text-white">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Závada
              </Badge>
            )}
            {check.status === "cannot_complete" && (
              <Badge className="bg-[var(--chart-4)] text-white">
                <XCircle className="w-3 h-3 mr-1" />
                Nelze provést
              </Badge>
            )}
          </div>

          {isCompleted && check.completedBy && (
            <div
              className="pt-3 mt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
                Provedl: <strong>{check.completedBy}</strong> •{" "}
                {check.completedAt?.toLocaleString("cs-CZ", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </Card>

        {/* Task Description */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-start gap-2 mb-3">
            <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="mb-1 text-sm sm:text-base">Úkon</h4>
              <p className="text-xs sm:text-sm">{check.task}</p>
            </div>
          </div>

          <div
            className="pt-3 mt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <h4 className="mb-2 text-sm sm:text-base">Popis práce</h4>
            <p className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
              {check.description}
            </p>
          </div>

          {check.howToVerify && (
            <div
              className="pt-3 mt-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <h4 className="mb-2 text-sm sm:text-base">Jak ověřit</h4>
              <p className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                {check.howToVerify}
              </p>
            </div>
          )}
        </Card>

        {/* Issue Display */}
        {check.status === "issue" && check.issue && (
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
              <div>
                <h4 className="mb-1 text-destructive">Nahlášená závada</h4>
                <p style={{ fontSize: "var(--text-sm)" }}>{check.issue}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cannot Complete Reason Display */}
        {check.status === "cannot_complete" && (
          <Card className="p-4 bg-[var(--chart-4)]/10 border-[var(--chart-4)]/20">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 mt-1" style={{ color: "var(--chart-4)" }} />
              <div>
                <h4 className="mb-1" style={{ color: "var(--chart-4)" }}>
                  Důvod neprovedení
                </h4>
                <p style={{ fontSize: "var(--text-sm)" }}>{check.note}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {!isCompleted && (
          <Card className="p-3 sm:p-4">
            <Label htmlFor="note" className="text-sm sm:text-base">Poznámka (volitelné)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Přidat poznámku k provedení kontroly..."
              className="mt-2 min-h-[100px] bg-input-background text-sm sm:text-base"
            />
            <Button variant="outline" className="mt-3 w-full min-h-[44px]">
              <Camera className="w-4 h-4 mr-2" />
              <span className="text-sm sm:text-base">Přidat fotku</span>
            </Button>
          </Card>
        )}

        {check.note && isCompleted && (
          <Card className="p-4">
            <h4 className="mb-2">Poznámka</h4>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--muted-foreground)" }}>
              {check.note}
            </p>
          </Card>
        )}

        {/* Issue Form */}
        {showIssueForm && !isCompleted && (
          <Card className="p-4 bg-destructive/5">
            <h4 className="mb-3">Nahlásit závadu</h4>
            <Label htmlFor="issue">Popis závady</Label>
            <Textarea
              id="issue"
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Popište závadu..."
              className="mt-2 min-h-[100px] bg-input-background"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {isJiraConfigured()
                ? "Po odeslání se závada zkusí rovnou založit i do Jira."
                : "Jira není nakonfigurovaná. Závada se zatím uloží jen v demo aplikaci."}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleIssue}
                className="flex-1 bg-destructive hover:bg-destructive/90"
                disabled={isSubmittingIssue}
              >
                {isSubmittingIssue ? "Odesílám..." : "Nahlásit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowIssueForm(false);
                  setIssueText("");
                }}
                className="flex-1"
                disabled={isSubmittingIssue}
              >
                Zrušit
              </Button>
            </div>
          </Card>
        )}

        {/* Cannot Complete Form */}
        {showCannotCompleteForm && !isCompleted && (
          <Card className="p-4" style={{ backgroundColor: "var(--chart-4)/10" }}>
            <h4 className="mb-3">Nelze provést</h4>
            <Label htmlFor="reason">Důvod neprovedení</Label>
            <Textarea
              id="reason"
              value={cannotCompleteReason}
              onChange={(e) => setCannotCompleteReason(e.target.value)}
              placeholder="Uveďte důvod, proč kontrolu nelze provést..."
              className="mt-2 min-h-[100px] bg-input-background"
            />
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleCannotComplete}
                className="flex-1"
                style={{ backgroundColor: "var(--chart-4)" }}
              >
                Potvrdit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCannotCompleteForm(false);
                  setCannotCompleteReason("");
                }}
                className="flex-1"
              >
                Zrušit
              </Button>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        {!isCompleted && !showIssueForm && !showCannotCompleteForm && (
          <div className="space-y-2 sm:space-y-3 pb-6">
            <Button onClick={handleComplete} className="w-full min-h-[48px] sm:min-h-[52px]" size="lg">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Splněno</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowIssueForm(true)}
              className="w-full min-h-[48px] sm:min-h-[52px]"
              size="lg"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Nahlásit závadu</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCannotCompleteForm(true)}
              className="w-full min-h-[48px] sm:min-h-[52px]"
              size="lg"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Nelze provést</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
