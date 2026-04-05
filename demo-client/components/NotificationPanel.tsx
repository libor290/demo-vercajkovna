import { Bell, Check, X } from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Notification, notificationTypeLabels, Check as CheckType, machines, locationLabels } from "@/demo-client/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";

interface NotificationPanelProps {
  notifications: Notification[];
  checks: CheckType[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

interface NotificationDetails {
  type: Notification["type"];
  machineName?: string;
  location?: string;
  task?: string;
  issue?: string;
  performedBy?: string;
  createdBy?: string;
  message: string;
}

export function NotificationPanel({
  notifications,
  checks,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationDetails = (notification: Notification): NotificationDetails => {
    const check = notification.checkId ? checks.find((c) => c.id === notification.checkId) : undefined;
    const machine = check ? machines.find((m) => m.id === check.machineId) : undefined;

    return {
      type: notification.type,
      machineName: machine?.name,
      location: machine ? locationLabels[machine.location] : undefined,
      task: check?.task,
      issue: check?.issue,
      performedBy: check?.completedBy,
      createdBy: notification.createdBy,
      message: notification.message,
    };
  };

  const getNotificationColors = (type: Notification["type"]) => {
    switch (type) {
      case "issue":
        return {
          border: "rgba(220, 38, 38, 1)",
          badgeBg: "rgba(220, 38, 38, 0.1)",
          badgeText: "rgb(220, 38, 38)",
        };
      case "cannot_complete":
        return {
          border: "rgba(115, 115, 115, 1)",
          badgeBg: "rgba(115, 115, 115, 0.1)",
          badgeText: "rgb(115, 115, 115)",
        };
      case "completed":
        return {
          border: "rgba(0, 150, 137, 1)",
          badgeBg: "rgba(0, 150, 137, 0.1)",
          badgeText: "rgb(0, 150, 137)",
        };
      case "check_due_soon":
        return {
          border: "rgba(255, 185, 0, 1)",
          badgeBg: "rgba(255, 185, 0, 0.15)",
          badgeText: "rgb(180, 130, 0)",
        };
      case "admin_reminder":
        return {
          border: "rgba(220, 38, 38, 1)",
          badgeBg: "rgba(220, 38, 38, 0.15)",
          badgeText: "rgb(220, 38, 38)",
        };
      default:
        return {
          border: "rgba(23, 23, 23, 1)",
          badgeBg: "rgba(23, 23, 23, 0.1)",
          badgeText: "rgb(23, 23, 23)",
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-semibold">Upozornění</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-7 text-xs w-full"
              >
                <Check className="w-3 h-3 mr-1.5" />
                Označit vše jako přečtené
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <ScrollArea className="flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Žádná nová upozornění</p>
              </div>
            ) : (
              <div className="p-2 sm:p-3 space-y-2">
                {notifications.map((notification) => {
                  const colors = getNotificationColors(notification.type);
                  const details = getNotificationDetails(notification);
                  return (
                    <Card
                      key={notification.id}
                      className={`p-2 cursor-pointer hover:bg-muted/20 transition-colors ${
                        notification.type === "admin_reminder"
                          ? "border-2"
                          : "border-l-[3px]"
                      }`}
                      style={{
                        borderLeftColor: notification.type === "admin_reminder" ? undefined : colors.border,
                        borderColor: notification.type === "admin_reminder" ? "rgba(220, 38, 38, 1)" : undefined,
                        backgroundColor: notification.type === "admin_reminder"
                          ? "rgba(220, 38, 38, 0.05)"
                          : undefined,
                      }}
                      onClick={() => {
                        onNotificationClick(notification);
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className={`space-y-1 ${notification.read ? "opacity-50" : ""}`}>
                        {/* Line 1: Machine name + Badge */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold leading-tight">
                            {details.machineName || "Upozornění"}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-0 px-1.5 py-0.5 leading-none"
                              style={{
                                backgroundColor: colors.badgeBg,
                                color: colors.badgeText,
                              }}
                            >
                              {notificationTypeLabels[notification.type]}
                            </Badge>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Line 2: Location */}
                        {details.location && (
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
                            {details.location}
                          </p>
                        )}

                        {/* Line 3: Task/Message */}
                        <p className="text-[13px] leading-relaxed text-foreground/90">
                          {details.task || details.message}
                        </p>

                        {/* Line 3b: Issue if exists */}
                        {details.issue && (
                          <p className="text-[12px] font-medium text-destructive leading-relaxed">
                            {details.issue}
                          </p>
                        )}

                        {/* Line 4: Who + When */}
                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                          {details.performedBy && `Provedl: ${details.performedBy}`}
                          {details.createdBy && `${details.performedBy ? " • " : ""}${details.createdBy}`}
                          {!details.performedBy && !details.createdBy && formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: cs,
                          })}
                          {(details.performedBy || details.createdBy) && ` • ${formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: cs,
                          })}`}
                        </p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
