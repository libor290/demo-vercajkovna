import { AdminMenuScreen } from "@/demo-client/components/AdminMenuScreen";
import { CheckDetailScreen } from "@/demo-client/components/CheckDetailScreen";
import { DashboardScreen } from "@/demo-client/components/DashboardScreen";
import { HistoryScreen } from "@/demo-client/components/HistoryScreen";
import { LocationSelectionScreen } from "@/demo-client/components/LocationSelectionScreen";
import { LoginScreen } from "@/demo-client/components/LoginScreen";
import { MachineManagementScreen } from "@/demo-client/components/MachineManagementScreen";
import { RegisterScreen } from "@/demo-client/components/RegisterScreen";
import { StatusChecksScreen } from "@/demo-client/components/StatusChecksScreen";
import { SubmittedWorkScreen } from "@/demo-client/components/SubmittedWorkScreen";
import { TenantManagementScreen } from "@/demo-client/components/TenantManagementScreen";
import { UserManagementScreen } from "@/demo-client/components/UserManagementScreen";
import { checks as initialChecks, machines as initialMachines, users as initialUsers, notifications as initialNotifications, submittedWork as initialSubmittedWork, tenants as initialTenants, locationEntries as initialLocationEntries, type Check, type Machine, type User, type Notification, type Tenant, type LocationEntry, type SubmittedWork } from "@/demo-client/data/mockData";
import { createJiraIssueForCheck, isJiraConfigured } from "@/demo-client/lib/jira";
import { useEffect, useState } from "react";

type Screen = "login" | "register" | "location-selection" | "dashboard" | "check-detail" | "history" | "status-checks" | "machine-management" | "user-management" | "tenant-management" | "admin-menu" | "submitted-work";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<"operator" | "admin">("operator");
  const [userName, setUserName] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [checks, setChecks] = useState<Check[]>(initialChecks);
  const [machines, setMachines] = useState<Machine[]>(initialMachines);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [locationEntries, setLocationEntries] = useState<LocationEntry[]>(initialLocationEntries);
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>(initialSubmittedWork);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Check["status"] | null>(null);
  const [selectedIssueDate, setSelectedIssueDate] = useState<Date | undefined>(undefined);

  // Mock notifications
  useEffect(() => {
    if (currentScreen === "dashboard") {
      // Show notification after login
      const timer = setTimeout(() => {
        const pendingCount = checks.filter(
          (c) => c.status === "pending" && c.scheduledDate.toDateString() === new Date().toDateString()
        ).length;
        if (pendingCount > 0) {
          // This would be a real notification in production
          console.log(`Máš ${pendingCount} kontrol k provedení`);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentScreen, checks]);

  const handleLogin = (role: "operator" | "admin", name: string) => {
    setUserRole(role);
    setUserName(name);

    // Set currentUserId based on name (simple mapping for demo)
    if (name === "p. Novák") {
      setCurrentUserId("u1");
    } else if (name === "pí Nováková") {
      setCurrentUserId("u2");
    } else if (name === "p. Dvořák") {
      setCurrentUserId("u4");
    } else {
      setCurrentUserId("u1"); // default
    }

    // Admin goes directly to dashboard, operator selects location first
    if (role === "admin") {
      setCurrentScreen("dashboard");
    } else {
      setCurrentScreen("location-selection");
    }
  };

  const handleLogout = () => {
    setCurrentScreen("login");
    setSelectedCheck(null);
    setUserName("");
  };

  const handleGoToRegister = () => {
    setCurrentScreen("register");
  };

  const handleRegister = (name: string, email: string) => {
    // Add new user with pending status
    const newId = `u${users.length + 1}`;
    setUsers((prev) => [
      ...prev,
      {
        id: newId,
        name,
        email,
        role: "operator" as const,
        tenants: ["toro" as const],
        status: "pending" as const,
        createdAt: new Date(),
      },
    ]);
    setCurrentScreen("login");
  };

  const handleBackFromRegister = () => {
    setCurrentScreen("login");
  };

  const handleTenantSelect = () => {
    // For now, we only have TORO tenant
    // Operator will see all checks within TORO
    setCurrentScreen("dashboard");
  };

  const handleBackFromLocationSelection = () => {
    setCurrentScreen("login");
  };

  const handleCheckClick = (check: Check) => {
    setSelectedCheck(check);
    setCurrentScreen("check-detail");
  };

  const handleBackFromDetail = () => {
    setSelectedCheck(null);
    setCurrentScreen("dashboard");
  };

  const handleBackFromHistory = () => {
    // Clear issue date filter
    setSelectedIssueDate(undefined);
    // Check if user is admin and came from admin menu
    if (userRole === "admin") {
      setCurrentScreen("admin-menu");
    } else {
      setCurrentScreen("dashboard");
    }
  };

  const handleComplete = (checkId: string, note?: string) => {
    const oldCheck = checks.find((c) => c.id === checkId);
    const oldStatus = oldCheck?.status;

    setChecks((prev) =>
      prev.map((check) => {
        if (check.id === checkId) {
          const updatedCheck = {
            ...check,
            status: "completed" as const,
            completedBy: userName,
            completedAt: new Date(),
            note: note || check.note,
          };
          // Create notification after state update
          setTimeout(() => createNotificationForStatusChange(updatedCheck, oldStatus!), 100);
          return updatedCheck;
        }
        return check;
      })
    );
    setCurrentScreen("dashboard");
    setSelectedCheck(null);
  };

  const handleIssue = async (checkId: string, issue: string, noteOrPhoto?: string) => {
    const oldCheck = checks.find((c) => c.id === checkId);
    const oldStatus = oldCheck?.status;
    const completedAt = new Date();
    const isPhoto = noteOrPhoto?.startsWith("data:") ?? false;
    const note = isPhoto ? undefined : noteOrPhoto;
    const issuePhoto = isPhoto ? noteOrPhoto : undefined;

    setChecks((prev) =>
      prev.map((check) => {
        if (check.id === checkId) {
          const updatedCheck = {
            ...check,
            status: "issue" as const,
            issue,
            note,
            issuePhoto,
            completedBy: userName,
            completedAt,
            jiraIssueKey: undefined,
            jiraIssueUrl: undefined,
            jiraSyncError: undefined,
          };
          // Create notification after state update
          setTimeout(() => createNotificationForStatusChange(updatedCheck, oldStatus!), 100);
          return updatedCheck;
        }
        return check;
      })
    );
    setCurrentScreen("dashboard");
    setSelectedCheck(null);

    if (!oldCheck || !isJiraConfigured()) {
      return;
    }

    try {
      const jiraIssue = await createJiraIssueForCheck({
        check: {
          ...oldCheck,
          issue,
          note,
          issuePhoto,
          completedBy: userName,
          completedAt,
          status: "issue",
        },
        reportedBy: userName,
      });

      setChecks((prev) =>
        prev.map((check) =>
          check.id === checkId
            ? {
                ...check,
                jiraIssueKey: jiraIssue.key,
                jiraIssueUrl: jiraIssue.url,
                jiraSyncError: undefined,
              }
            : check,
        ),
      );
    } catch (error) {
      const jiraSyncError =
        error instanceof Error ? error.message : "Nepodařilo se vytvořit Jira issue.";

      setChecks((prev) =>
        prev.map((check) =>
          check.id === checkId
            ? {
                ...check,
                jiraSyncError,
              }
            : check,
        ),
      );
    }
  };

  const handleCannotComplete = (checkId: string, reason: string) => {
    const oldCheck = checks.find((c) => c.id === checkId);
    const oldStatus = oldCheck?.status;

    setChecks((prev) =>
      prev.map((check) => {
        if (check.id === checkId) {
          const updatedCheck = {
            ...check,
            status: "cannot_complete" as const,
            completedBy: userName,
            completedAt: new Date(),
            note: reason,
          };
          // Create notification after state update
          setTimeout(() => createNotificationForStatusChange(updatedCheck, oldStatus!), 100);
          return updatedCheck;
        }
        return check;
      })
    );
    setCurrentScreen("dashboard");
    setSelectedCheck(null);
  };

  const handleHistoryClick = () => {
    setCurrentScreen("history");
  };

  const handleStatusClick = (status: Check["status"]) => {
    setSelectedStatus(status);
    setCurrentScreen("status-checks");
  };

  const handleBackFromStatusChecks = () => {
    setSelectedStatus(null);
    setCurrentScreen("history");
  };

  const handleResetStatus = (checkId: string) => {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === checkId
          ? {
              ...check,
              status: "pending" as const,
              completedBy: undefined,
              completedAt: undefined,
              note: undefined,
              issue: undefined,
              issuePhoto: undefined,
            }
          : check
      )
    );
  };

  const handleAdminMenuClick = () => {
    setCurrentScreen("admin-menu");
  };

  const handleBackFromAdminMenu = () => {
    setCurrentScreen("dashboard");
  };

  const handleSubmittedWorkClick = () => {
    setCurrentScreen("submitted-work");
  };

  const handleBackFromSubmittedWork = () => {
    setCurrentScreen("admin-menu");
  };

  const handleIssueClickFromSubmittedWork = (date: Date) => {
    setSelectedIssueDate(date);
    setCurrentScreen("history");
  };

  const handleMachineManagementClick = () => {
    setCurrentScreen("machine-management");
  };

  const handleBackFromMachineManagement = () => {
    setCurrentScreen("admin-menu");
  };

  const handleUserManagementClick = () => {
    setCurrentScreen("user-management");
  };

  const handleBackFromUserManagement = () => {
    setCurrentScreen("admin-menu");
  };

  const handleTenantManagementClick = () => {
    setCurrentScreen("tenant-management");
  };

  const handleUpdateSubmittedWork = (id: string, updates: Partial<SubmittedWork>) => {
    setSubmittedWork((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  const handleBackFromTenantManagement = () => {
    setCurrentScreen("admin-menu");
  };

  // Machine management handlers
  const handleAddMachine = (machine: Omit<Machine, "id">) => {
    const newId = `m${machines.length + 1}`;
    setMachines((prev) => [...prev, { ...machine, id: newId }]);
  };

  const handleUpdateMachine = (id: string, updates: Partial<Machine>) => {
    setMachines((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMachine = (id: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== id));
    // Also delete all checks for this machine
    setChecks((prev) => prev.filter((c) => c.machineId !== id));
  };

  const handleAddCheck = (check: Omit<Check, "id" | "status" | "scheduledDate">) => {
    const newId = `c${checks.length + 1}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setChecks((prev) => [
      ...prev,
      {
        ...check,
        id: newId,
        status: "pending" as const,
        scheduledDate: today,
      },
    ]);
  };

  const handleUpdateCheck = (id: string, updates: Partial<Check>) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleDeleteCheck = (id: string) => {
    setChecks((prev) => prev.filter((c) => c.id !== id));
  };

  // User management handlers
  const handleAddUser = (user: Omit<User, "id" | "createdAt">) => {
    const newId = `u${users.length + 1}`;
    setUsers((prev) => [...prev, { ...user, id: newId, createdAt: new Date() }]);
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Tenant management handlers
  const handleAddTenant = (tenant: Omit<Tenant, "id" | "createdAt">) => {
    const newId = `t${tenants.length + 1}`;
    setTenants((prev) => [...prev, { ...tenant, id: newId, createdAt: new Date() }]);
  };

  const handleUpdateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  // Location management handlers
  const handleAddLocation = (location: Omit<LocationEntry, "id" | "createdAt">) => {
    const newId = `l${locationEntries.length + 1}`;
    setLocationEntries((prev) => [...prev, { ...location, id: newId, createdAt: new Date() }]);
  };

  const handleUpdateLocation = (id: string, updates: Partial<LocationEntry>) => {
    setLocationEntries((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleDeleteLocation = (id: string) => {
    setLocationEntries((prev) => prev.filter((l) => l.id !== id));
  };

  // Notification handlers
  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUserId ? { ...n, read: true } : n))
    );
  };

  const handleSendAdminReminder = (checkId: string, userId: string) => {
    const check = checks.find((c) => c.id === checkId);
    const machine = machines.find((m) => m.id === check?.machineId);
    const user = users.find((u) => u.id === userId);

    if (!check || !machine || !user) return;

    const newNotification: Notification = {
      id: `n${notifications.length + 1}`,
      userId: userId,
      type: "admin_reminder",
      checkId: checkId,
      message: `Nezapomeňte dokončit: ${check.task} (${machine.name}) - ${userName}`,
      createdAt: new Date(),
      read: false,
      createdBy: userName,
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  // Auto-generate notifications on check status changes
  const createNotificationForStatusChange = (check: Check, oldStatus: Check["status"]) => {
    const machine = machines.find((m) => m.id === check.machineId);
    if (!machine) return;

    // Create notification for admin when status changes
    if (userRole === "operator" && check.status !== oldStatus) {
      let notificationType: Notification["type"] | null = null;
      let message = "";

      switch (check.status) {
        case "issue":
          notificationType = "issue";
          message = `${check.issue || "Zjištěna závada"} - ${machine.name}`;
          break;
        case "cannot_complete":
          notificationType = "cannot_complete";
          message = `Nelze dokončit: ${check.task} (${machine.name}) - ${check.note || ""}`;
          break;
        case "completed":
          notificationType = "completed";
          message = `${userName} dokončil: ${check.task} (${machine.name})`;
          break;
      }

      if (notificationType) {
        const adminUsers = users.filter((u) => u.role === "admin");
        adminUsers.forEach((admin) => {
          const newNotification: Notification = {
            id: `n${notifications.length + 1 + adminUsers.indexOf(admin)}`,
            userId: admin.id,
            type: notificationType!,
            checkId: check.id,
            message: message,
            createdAt: new Date(),
            read: false,
          };
          setNotifications((prev) => [...prev, newNotification]);
        });
      }
    }
  };

  // Update selected check when checks change
  useEffect(() => {
    if (selectedCheck) {
      const updatedCheck = checks.find((c) => c.id === selectedCheck.id);
      if (updatedCheck) {
        setSelectedCheck(updatedCheck);
      }
    }
  }, [checks, selectedCheck]);

  // For now, both admin and operator see all checks in TORO tenant
  // In the future, this could filter by tenant
  const filteredChecks = checks;

  // Filter notifications for current user
  const userNotifications = notifications
    .filter((n) => n.userId === currentUserId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="min-h-screen">
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} onRegister={handleGoToRegister} />}

      {currentScreen === "register" && (
        <RegisterScreen onRegister={handleRegister} onBack={handleBackFromRegister} />
      )}

      {currentScreen === "location-selection" && (
        <LocationSelectionScreen
          onTenantSelect={handleTenantSelect}
          onBack={handleBackFromLocationSelection}
          userName={userName}
        />
      )}

      {currentScreen === "dashboard" && (
        <DashboardScreen
          checks={filteredChecks}
          notifications={userNotifications}
          role={userRole}
          onCheckClick={handleCheckClick}
          onLogout={handleLogout}
          onAdminMenuClick={handleAdminMenuClick}
          onHistoryClick={handleHistoryClick}
          onComplete={handleComplete}
          onIssue={handleIssue}
          onCannotComplete={handleCannotComplete}
          onResetStatus={handleResetStatus}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          onSendAdminReminder={userRole === "admin" ? handleSendAdminReminder : undefined}
        />
      )}

      {currentScreen === "check-detail" && selectedCheck && (
        <CheckDetailScreen
          check={selectedCheck}
          onBack={handleBackFromDetail}
          onComplete={handleComplete}
          onIssue={handleIssue}
          onCannotComplete={handleCannotComplete}
        />
      )}

      {currentScreen === "history" && (
        <HistoryScreen
          checks={filteredChecks}
          onBack={handleBackFromHistory}
          onCheckClick={handleCheckClick}
          onStatusClick={handleStatusClick}
          onSubmittedWork={handleSubmittedWorkClick}
          initialIssueDate={selectedIssueDate}
        />
      )}

      {currentScreen === "status-checks" && selectedStatus && (
        <StatusChecksScreen
          checks={filteredChecks}
          status={selectedStatus}
          onBack={handleBackFromStatusChecks}
          onCheckClick={handleCheckClick}
        />
      )}

      {currentScreen === "admin-menu" && (
        <AdminMenuScreen
          onBack={handleBackFromAdminMenu}
          onMachineManagement={handleMachineManagementClick}
          onUserManagement={handleUserManagementClick}
          onTenantManagement={handleTenantManagementClick}
          onHistory={handleHistoryClick}
          onSubmittedWork={handleSubmittedWorkClick}
          adminName={userRole === "admin" ? "Ing. Malá" : "Administrátor"}
        />
      )}

      {currentScreen === "submitted-work" && (
        <SubmittedWorkScreen
          submittedWork={submittedWork}
          onBack={handleBackFromSubmittedWork}
          onIssueClick={handleIssueClickFromSubmittedWork}
          onUpdateWork={handleUpdateSubmittedWork}
          adminName={userRole === "admin" ? "Ing. Malá" : "Administrátor"}
        />
      )}

      {currentScreen === "machine-management" && (
        <MachineManagementScreen
          machines={machines}
          checks={checks}
          onBack={handleBackFromMachineManagement}
          onAddMachine={handleAddMachine}
          onUpdateMachine={handleUpdateMachine}
          onDeleteMachine={handleDeleteMachine}
          onAddCheck={handleAddCheck}
          onUpdateCheck={handleUpdateCheck}
          onDeleteCheck={handleDeleteCheck}
        />
      )}

      {currentScreen === "user-management" && (
        <UserManagementScreen
          users={users}
          onBack={handleBackFromUserManagement}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {currentScreen === "tenant-management" && (
        <TenantManagementScreen
          tenants={tenants}
          locationEntries={locationEntries}
          onBack={handleBackFromTenantManagement}
          onAddTenant={handleAddTenant}
          onUpdateTenant={handleUpdateTenant}
          onDeleteTenant={handleDeleteTenant}
          onAddLocation={handleAddLocation}
          onUpdateLocation={handleUpdateLocation}
          onDeleteLocation={handleDeleteLocation}
        />
      )}
    </div>
  );
}

export default App;
