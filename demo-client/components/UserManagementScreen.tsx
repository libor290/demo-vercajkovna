import { ArrowLeft, Check, Edit, Filter, Plus, Trash2, UserCircle, X } from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/demo-client/components/ui/dialog";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/demo-client/components/ui/popover";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/demo-client/components/ui/select";
import {
  User,
  UserStatus,
  TenantId,
  tenantLabels,
  userStatusLabels,
} from "@/demo-client/data/mockData";
import { useState } from "react";

interface UserManagementScreenProps {
  users: User[];
  onBack: () => void;
  onAddUser: (user: Omit<User, "id" | "createdAt">) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export function UserManagementScreen({
  users,
  onBack,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: UserManagementScreenProps) {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form states
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"operator" | "admin">("operator");
  const [userTenants, setUserTenants] = useState<TenantId[]>([]);
  const [userStatus, setUserStatus] = useState<UserStatus>("pending");

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "all">("all");

  const handleAddUser = () => {
    if (!userName.trim()) {
      alert("Prosím vyplňte jméno uživatele");
      return;
    }
    if (!userEmail.trim()) {
      alert("Prosím vyplňte email");
      return;
    }

    onAddUser({
      name: userName,
      email: userEmail,
      role: userRole,
      tenants: userTenants,
      status: userStatus,
    });

    // Reset form
    setUserName("");
    setUserEmail("");
    setUserRole("operator");
    setUserTenants([]);
    setUserStatus("pending");
    setAddUserDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    if (!userName.trim()) {
      alert("Prosím vyplňte jméno uživatele");
      return;
    }
    if (!userEmail.trim()) {
      alert("Prosím vyplňte email");
      return;
    }

    onUpdateUser(selectedUser.id, {
      name: userName,
      email: userEmail,
      role: userRole,
      tenants: userTenants,
      status: userStatus,
    });

    setEditUserDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    onDeleteUser(userToDelete.id);
    setDeleteConfirmDialogOpen(false);
    setUserToDelete(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserTenants(user.tenants);
    setUserStatus(user.status);
    setEditUserDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmDialogOpen(true);
  };

  const handleApproveUser = (user: User) => {
    onUpdateUser(user.id, { status: "approved" });
  };

  const handleRejectUser = (user: User) => {
    onUpdateUser(user.id, { status: "rejected" });
  };

  const toggleTenant = (tenantId: TenantId) => {
    setUserTenants((prev) =>
      prev.includes(tenantId) ? prev.filter((t) => t !== tenantId) : [...prev, tenantId]
    );
  };

  // Filter users
  const filteredUsers = users.filter(
    (user) => selectedStatus === "all" || user.status === selectedStatus
  );

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "outline";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
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
              <h2 className="text-base sm:text-lg md:text-xl">Správa uživatelů</h2>
            </div>
            <Button
              onClick={() => {
                setUserName("");
                setUserEmail("");
                setUserRole("operator");
                setUserTenants([]);
                setUserStatus("pending");
                setAddUserDialogOpen(true);
              }}
              size="sm"
              className="min-h-[36px] sm:min-h-[40px]"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Přidat uživatele</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={selectedStatus !== "all" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2">
                <div className="space-y-1">
                  <Button
                    variant={selectedStatus === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedStatus("all")}
                    className="w-full justify-start h-8 text-xs"
                  >
                    Všichni uživatelé
                  </Button>
                  {Object.entries(userStatusLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedStatus === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedStatus(key as UserStatus)}
                      className="w-full justify-start h-8 text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
          {filteredUsers.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground">
                {users.length === 0
                  ? "Zatím nemáte žádné uživatele"
                  : "Žádní uživatelé nevyhovují zvoleným filtrům"}
              </p>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold mb-1">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                          {userStatusLabels[user.status]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {user.role === "admin" ? "Administrátor" : "Operátor"}
                        </Badge>
                        {user.tenants.map((tenant) => (
                          <Badge key={tenant} variant="secondary" className="text-xs">
                            {tenantLabels[tenant]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {user.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproveUser(user)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Schválit"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRejectUser(user)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Zamítnout"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(user)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add User Dialog */}
      <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Přidat uživatele</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Jméno *</Label>
              <Input
                id="user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Jan Novák"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email *</Label>
              <Input
                id="user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="jan.novak@toro.cz"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="user-role">Role *</Label>
              <Select value={userRole} onValueChange={(value) => setUserRole(value as "operator" | "admin")}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operátor</SelectItem>
                  <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Přiřazené tenanty</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(tenantLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userTenants.includes(key as TenantId)}
                      onChange={() => toggleTenant(key as TenantId)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="user-status">Status *</Label>
              <Select value={userStatus} onValueChange={(value) => setUserStatus(value as UserStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(userStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleAddUser}>Přidat</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upravit uživatele</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-user-name">Jméno *</Label>
              <Input
                id="edit-user-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-email">Email *</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-user-role">Role *</Label>
              <Select value={userRole} onValueChange={(value) => setUserRole(value as "operator" | "admin")}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Operátor</SelectItem>
                  <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Přiřazené tenanty</Label>
              <div className="mt-2 space-y-2">
                {Object.entries(tenantLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userTenants.includes(key as TenantId)}
                      onChange={() => toggleTenant(key as TenantId)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-user-status">Status *</Label>
              <Select value={userStatus} onValueChange={(value) => setUserStatus(value as UserStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(userStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleEditUser}>Uložit změny</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Smazat uživatele</DialogTitle>
          </DialogHeader>
          <p className="text-sm sm:text-base text-muted-foreground">
            Opravdu chcete smazat uživatele <strong>{userToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>
              Zrušit
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Smazat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
