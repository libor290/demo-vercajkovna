import {
  ArrowLeft,
  Building2,
  Edit,
  MapPin,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Badge } from "@/demo-client/components/ui/badge";
import { Button } from "@/demo-client/components/ui/button";
import { Card } from "@/demo-client/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/demo-client/components/ui/dialog";
import { Input } from "@/demo-client/components/ui/input";
import { Label } from "@/demo-client/components/ui/label";
import { ScrollArea } from "@/demo-client/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/demo-client/components/ui/select";
import {
  Tenant,
  LocationEntry,
  tenantStatusLabels,
} from "@/demo-client/data/mockData";
import { useState } from "react";

interface TenantManagementScreenProps {
  tenants: Tenant[];
  locationEntries: LocationEntry[];
  onBack: () => void;
  onAddTenant: (tenant: Omit<Tenant, "id" | "createdAt">) => void;
  onUpdateTenant: (id: string, updates: Partial<Tenant>) => void;
  onDeleteTenant: (id: string) => void;
  onAddLocation: (location: Omit<LocationEntry, "id" | "createdAt">) => void;
  onUpdateLocation: (id: string, updates: Partial<LocationEntry>) => void;
  onDeleteLocation: (id: string) => void;
}

type ActiveTab = "tenants" | "locations";

export function TenantManagementScreen({
  tenants,
  locationEntries,
  onBack,
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
}: TenantManagementScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tenants");

  // ---- Tenant dialog state ----
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [editTenantOpen, setEditTenantOpen] = useState(false);
  const [deleteTenantOpen, setDeleteTenantOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Tenant form fields
  const [tenantName, setTenantName] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [tenantStatus, setTenantStatus] = useState<Tenant["status"]>("active");

  // ---- Location dialog state ----
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [deleteLocationOpen, setDeleteLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationEntry | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<LocationEntry | null>(null);
  const [filterTenantId, setFilterTenantId] = useState<string>("all");

  // Location form fields
  const [locationName, setLocationName] = useState("");
  const [locationKey, setLocationKey] = useState("");
  const [locationTenantId, setLocationTenantId] = useState<string>("");
  const [locationDescription, setLocationDescription] = useState("");
  const [locationActive, setLocationActive] = useState(true);

  // ---- Tenant handlers ----
  const resetTenantForm = () => {
    setTenantName("");
    setTenantContact("");
    setTenantEmail("");
    setTenantPhone("");
    setTenantStatus("active");
  };

  const openAddTenantDialog = () => {
    resetTenantForm();
    setAddTenantOpen(true);
  };

  const openEditTenantDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantName(tenant.name);
    setTenantContact(tenant.contactPerson ?? "");
    setTenantEmail(tenant.email ?? "");
    setTenantPhone(tenant.phone ?? "");
    setTenantStatus(tenant.status);
    setEditTenantOpen(true);
  };

  const openDeleteTenantDialog = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setDeleteTenantOpen(true);
  };

  const handleAddTenant = () => {
    if (!tenantName.trim()) {
      alert("Prosím vyplňte název tenanta");
      return;
    }
    onAddTenant({
      name: tenantName.trim(),
      contactPerson: tenantContact.trim() || undefined,
      email: tenantEmail.trim() || undefined,
      phone: tenantPhone.trim() || undefined,
      status: tenantStatus,
    });
    setAddTenantOpen(false);
    resetTenantForm();
  };

  const handleEditTenant = () => {
    if (!selectedTenant) return;
    if (!tenantName.trim()) {
      alert("Prosím vyplňte název tenanta");
      return;
    }
    onUpdateTenant(selectedTenant.id, {
      name: tenantName.trim(),
      contactPerson: tenantContact.trim() || undefined,
      email: tenantEmail.trim() || undefined,
      phone: tenantPhone.trim() || undefined,
      status: tenantStatus,
    });
    setEditTenantOpen(false);
    setSelectedTenant(null);
  };

  const handleDeleteTenant = () => {
    if (!tenantToDelete) return;
    onDeleteTenant(tenantToDelete.id);
    setDeleteTenantOpen(false);
    setTenantToDelete(null);
  };

  // ---- Location handlers ----
  const resetLocationForm = () => {
    setLocationName("");
    setLocationKey("");
    setLocationTenantId(tenants[0]?.id ?? "");
    setLocationDescription("");
    setLocationActive(true);
  };

  const openAddLocationDialog = () => {
    resetLocationForm();
    setAddLocationOpen(true);
  };

  const openEditLocationDialog = (loc: LocationEntry) => {
    setSelectedLocation(loc);
    setLocationName(loc.name);
    setLocationKey(loc.key);
    setLocationTenantId(loc.tenantId);
    setLocationDescription(loc.description ?? "");
    setLocationActive(loc.active);
    setEditLocationOpen(true);
  };

  const openDeleteLocationDialog = (loc: LocationEntry) => {
    setLocationToDelete(loc);
    setDeleteLocationOpen(true);
  };

  // Auto-generate key from name
  const handleLocationNameChange = (value: string) => {
    setLocationName(value);
    if (!selectedLocation) {
      const key = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      setLocationKey(key);
    }
  };

  const handleAddLocation = () => {
    if (!locationName.trim()) {
      alert("Prosím vyplňte název lokace");
      return;
    }
    if (!locationTenantId) {
      alert("Prosím vyberte tenanta");
      return;
    }
    onAddLocation({
      name: locationName.trim(),
      key: locationKey.trim() || locationName.toLowerCase().replace(/\s+/g, "_"),
      tenantId: locationTenantId,
      description: locationDescription.trim() || undefined,
      active: locationActive,
    });
    setAddLocationOpen(false);
    resetLocationForm();
  };

  const handleEditLocation = () => {
    if (!selectedLocation) return;
    if (!locationName.trim()) {
      alert("Prosím vyplňte název lokace");
      return;
    }
    onUpdateLocation(selectedLocation.id, {
      name: locationName.trim(),
      key: locationKey.trim(),
      tenantId: locationTenantId,
      description: locationDescription.trim() || undefined,
      active: locationActive,
    });
    setEditLocationOpen(false);
    setSelectedLocation(null);
  };

  const handleDeleteLocation = () => {
    if (!locationToDelete) return;
    onDeleteLocation(locationToDelete.id);
    setDeleteLocationOpen(false);
    setLocationToDelete(null);
  };

  const getTenantName = (id: string) =>
    tenants.find((t) => t.id === id)?.name ?? id;

  const filteredLocations =
    filterTenantId === "all"
      ? locationEntries
      : locationEntries.filter((l) => l.tenantId === filterTenantId);

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
              <h2 className="text-base sm:text-lg md:text-xl">Správa tenantů a lokací</h2>
            </div>
            {activeTab === "tenants" ? (
              <Button onClick={openAddTenantDialog} size="sm" className="min-h-[36px] sm:min-h-[40px]">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Přidat tenanta</span>
              </Button>
            ) : (
              <Button onClick={openAddLocationDialog} size="sm" className="min-h-[36px] sm:min-h-[40px]">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Přidat lokaci</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-3 sm:px-4">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab("tenants")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tenants"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Tenanti
              <Badge variant="secondary" className="text-xs ml-1">
                {tenants.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "locations"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Lokace
              <Badge variant="secondary" className="text-xs ml-1">
                {locationEntries.length}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Locations filter bar */}
      {activeTab === "locations" && (
        <div className="border-b bg-card">
          <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tenant:</span>
              <Select value={filterTenantId} onValueChange={setFilterTenantId}>
                <SelectTrigger className="h-8 w-auto min-w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všichni tenanti</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">

          {/* ---- TENANTS TAB ---- */}
          {activeTab === "tenants" && (
            <>
              {tenants.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <p className="text-sm text-muted-foreground">Zatím nejsou žádní tenanti</p>
                </Card>
              ) : (
                tenants.map((tenant) => (
                  <Card key={tenant.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `var(--chart-1)15` }}
                        >
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-1)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-semibold">{tenant.name}</h3>
                            <Badge
                              variant={tenant.status === "active" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {tenantStatusLabels[tenant.status]}
                            </Badge>
                          </div>
                          {tenant.contactPerson && (
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Kontakt: {tenant.contactPerson}
                            </p>
                          )}
                          {tenant.email && (
                            <p className="text-xs text-muted-foreground">{tenant.email}</p>
                          )}
                          {tenant.phone && (
                            <p className="text-xs text-muted-foreground">{tenant.phone}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {locationEntries.filter((l) => l.tenantId === tenant.id).length} lokací
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditTenantDialog(tenant)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteTenantDialog(tenant)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}

          {/* ---- LOCATIONS TAB ---- */}
          {activeTab === "locations" && (
            <>
              {filteredLocations.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {locationEntries.length === 0
                      ? "Zatím nejsou žádné lokace"
                      : "Žádné lokace pro vybraného tenanta"}
                  </p>
                </Card>
              ) : (
                filteredLocations.map((loc) => (
                  <Card key={loc.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `var(--chart-2)15` }}
                        >
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--chart-2)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-sm sm:text-base font-semibold">{loc.name}</h3>
                            <Badge
                              variant={loc.active ? "default" : "outline"}
                              className="text-xs"
                            >
                              {loc.active ? "Aktivní" : "Neaktivní"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Tenant: {getTenantName(loc.tenantId)}
                          </p>
                          {loc.description && (
                            <p className="text-xs text-muted-foreground">{loc.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            klíč: {loc.key}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateLocation(loc.id, { active: !loc.active })}
                          className="h-8 w-8 text-muted-foreground"
                          title={loc.active ? "Deaktivovat" : "Aktivovat"}
                        >
                          {loc.active ? (
                            <ToggleRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditLocationDialog(loc)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteLocationDialog(loc)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* ===== TENANT DIALOGS ===== */}

      {/* Add Tenant */}
      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Přidat tenanta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="t-name">Název *</Label>
              <Input
                id="t-name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Název firmy"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="t-contact">Kontaktní osoba</Label>
              <Input
                id="t-contact"
                value={tenantContact}
                onChange={(e) => setTenantContact(e.target.value)}
                placeholder="Ing. Novák"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="t-email">E-mail</Label>
              <Input
                id="t-email"
                type="email"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                placeholder="kontakt@firma.cz"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="t-phone">Telefon</Label>
              <Input
                id="t-phone"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="+420 123 456 789"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="t-status">Status *</Label>
              <Select value={tenantStatus} onValueChange={(v) => setTenantStatus(v as Tenant["status"])}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tenantStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddTenantOpen(false)}>Zrušit</Button>
            <Button onClick={handleAddTenant}>Přidat</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant */}
      <Dialog open={editTenantOpen} onOpenChange={setEditTenantOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Upravit tenanta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="et-name">Název *</Label>
              <Input
                id="et-name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="et-contact">Kontaktní osoba</Label>
              <Input
                id="et-contact"
                value={tenantContact}
                onChange={(e) => setTenantContact(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="et-email">E-mail</Label>
              <Input
                id="et-email"
                type="email"
                value={tenantEmail}
                onChange={(e) => setTenantEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="et-phone">Telefon</Label>
              <Input
                id="et-phone"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="et-status">Status *</Label>
              <Select value={tenantStatus} onValueChange={(v) => setTenantStatus(v as Tenant["status"])}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tenantStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditTenantOpen(false)}>Zrušit</Button>
            <Button onClick={handleEditTenant}>Uložit změny</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Tenant */}
      <Dialog open={deleteTenantOpen} onOpenChange={setDeleteTenantOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Smazat tenanta</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Opravdu chcete smazat tenanta <strong>{tenantToDelete?.name}</strong>?
            {locationEntries.filter((l) => l.tenantId === tenantToDelete?.id).length > 0 && (
              <span className="block mt-2 text-destructive">
                Tento tenant má přiřazené lokace — ty zůstanou zachovány.
              </span>
            )}
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTenantOpen(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={handleDeleteTenant}>Smazat</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== LOCATION DIALOGS ===== */}

      {/* Add Location */}
      <Dialog open={addLocationOpen} onOpenChange={setAddLocationOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Přidat lokaci</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="l-name">Název *</Label>
              <Input
                id="l-name"
                value={locationName}
                onChange={(e) => handleLocationNameChange(e.target.value)}
                placeholder="Výroba"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="l-key">Klíč (slug)</Label>
              <Input
                id="l-key"
                value={locationKey}
                onChange={(e) => setLocationKey(e.target.value)}
                placeholder="vyroba"
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Automaticky generováno z názvu. Použito pro interní identifikaci.
              </p>
            </div>
            <div>
              <Label htmlFor="l-tenant">Tenant *</Label>
              <Select value={locationTenantId} onValueChange={setLocationTenantId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Vyberte tenanta" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="l-desc">Popis</Label>
              <Input
                id="l-desc"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="Stručný popis lokace"
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label>Stav</Label>
              <button
                type="button"
                onClick={() => setLocationActive((v) => !v)}
                className="flex items-center gap-2 text-sm"
              >
                {locationActive ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
                <span>{locationActive ? "Aktivní" : "Neaktivní"}</span>
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddLocationOpen(false)}>Zrušit</Button>
            <Button onClick={handleAddLocation}>Přidat</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Location */}
      <Dialog open={editLocationOpen} onOpenChange={setEditLocationOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Upravit lokaci</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="el-name">Název *</Label>
              <Input
                id="el-name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="el-key">Klíč (slug)</Label>
              <Input
                id="el-key"
                value={locationKey}
                onChange={(e) => setLocationKey(e.target.value)}
                className="mt-2 font-mono text-sm"
              />
            </div>
            <div>
              <Label htmlFor="el-tenant">Tenant *</Label>
              <Select value={locationTenantId} onValueChange={setLocationTenantId}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="el-desc">Popis</Label>
              <Input
                id="el-desc"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label>Stav</Label>
              <button
                type="button"
                onClick={() => setLocationActive((v) => !v)}
                className="flex items-center gap-2 text-sm"
              >
                {locationActive ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
                <span>{locationActive ? "Aktivní" : "Neaktivní"}</span>
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditLocationOpen(false)}>Zrušit</Button>
            <Button onClick={handleEditLocation}>Uložit změny</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Location */}
      <Dialog open={deleteLocationOpen} onOpenChange={setDeleteLocationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Smazat lokaci</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Opravdu chcete smazat lokaci <strong>{locationToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteLocationOpen(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={handleDeleteLocation}>Smazat</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
