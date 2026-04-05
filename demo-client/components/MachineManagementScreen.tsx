import {
  ArrowLeft,
  Edit,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  MapPin,
  Filter,
  ArrowUpDown,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/demo-client/components/ui/popover";
import { Machine, Location, locationLabels, CheckInterval, intervalLabels, Check } from "@/demo-client/data/mockData";
import { useState } from "react";

interface MachineManagementScreenProps {
  machines: Machine[];
  checks: Check[];
  onBack: () => void;
  onAddMachine: (machine: Omit<Machine, "id">) => void;
  onUpdateMachine: (id: string, machine: Partial<Machine>) => void;
  onDeleteMachine: (id: string) => void;
  onAddCheck: (check: Omit<Check, "id" | "status" | "scheduledDate">) => void;
  onUpdateCheck: (id: string, check: Partial<Check>) => void;
  onDeleteCheck: (id: string) => void;
}

export function MachineManagementScreen({
  machines,
  checks,
  onBack,
  onAddMachine,
  onUpdateMachine,
  onDeleteMachine,
  onAddCheck,
  onUpdateCheck,
  onDeleteCheck,
}: MachineManagementScreenProps) {
  const [addMachineDialogOpen, setAddMachineDialogOpen] = useState(false);
  const [editMachineDialogOpen, setEditMachineDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [manageChecksDialogOpen, setManageChecksDialogOpen] = useState(false);
  const [addCheckDialogOpen, setAddCheckDialogOpen] = useState(false);
  const [editCheckDialogOpen, setEditCheckDialogOpen] = useState(false);

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [selectedCheckForEdit, setSelectedCheckForEdit] = useState<Check | null>(null);

  // Form states for machine
  const [machineName, setMachineName] = useState("");
  const [machineLocation, setMachineLocation] = useState<Location>("vyroba");

  // Form states for initial check (when adding machine)
  const [initialCheckTask, setInitialCheckTask] = useState("");
  const [initialCheckDescription, setInitialCheckDescription] = useState("");
  const [initialCheckHowToVerify, setInitialCheckHowToVerify] = useState("");
  const [initialCheckInterval, setInitialCheckInterval] = useState<CheckInterval>("daily");

  // Check form states (for adding checks to existing machine)
  const [checkTask, setCheckTask] = useState("");
  const [checkDescription, setCheckDescription] = useState("");
  const [checkHowToVerify, setCheckHowToVerify] = useState("");
  const [checkInterval, setCheckInterval] = useState<CheckInterval>("daily");

  // Edit check form states
  const [editCheckTask, setEditCheckTask] = useState("");
  const [editCheckDescription, setEditCheckDescription] = useState("");
  const [editCheckHowToVerify, setEditCheckHowToVerify] = useState("");
  const [editCheckInterval, setEditCheckInterval] = useState<CheckInterval>("daily");

  // Filter and sort states
  const [selectedLocation, setSelectedLocation] = useState<Location | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleAddMachine = () => {
    if (!machineName.trim()) {
      alert("Prosím vyplňte název stroje");
      return;
    }

    if (!initialCheckTask.trim()) {
      alert("Prosím vyplňte název úkonu kontroly");
      return;
    }

    if (!initialCheckDescription.trim()) {
      alert("Prosím vyplňte popis kontroly");
      return;
    }

    // First add the machine
    const newMachine = {
      name: machineName,
      location: machineLocation,
    };
    onAddMachine(newMachine);

    // Then add the initial check
    // We need to use a timeout to ensure the machine is added first
    setTimeout(() => {
      const lastMachineId = `m${machines.length + 1}`;
      onAddCheck({
        machineId: lastMachineId,
        task: initialCheckTask,
        description: initialCheckDescription,
        howToVerify: initialCheckHowToVerify,
        interval: initialCheckInterval,
      });
    }, 100);

    // Reset form
    setMachineName("");
    setMachineLocation("vyroba");
    setInitialCheckTask("");
    setInitialCheckDescription("");
    setInitialCheckHowToVerify("");
    setInitialCheckInterval("daily");
    setAddMachineDialogOpen(false);
  };

  const handleEditMachine = () => {
    if (!selectedMachine) return;
    if (!machineName.trim()) {
      alert("Prosím vyplňte název stroje");
      return;
    }

    onUpdateMachine(selectedMachine.id, {
      name: machineName,
      location: machineLocation,
    });

    setEditMachineDialogOpen(false);
    setSelectedMachine(null);
  };

  const handleDeleteMachine = () => {
    if (!machineToDelete) return;

    // Check if machine has any checks
    const machineChecks = checks.filter((c) => c.machineId === machineToDelete.id);
    if (machineChecks.length > 0) {
      alert(
        `Nelze smazat stroj s aktivními kontrolami. Nejprve smažte ${machineChecks.length} ${
          machineChecks.length === 1 ? "kontrolu" : machineChecks.length < 5 ? "kontroly" : "kontrol"
        }.`
      );
      setDeleteConfirmDialogOpen(false);
      setMachineToDelete(null);
      return;
    }

    onDeleteMachine(machineToDelete.id);
    setDeleteConfirmDialogOpen(false);
    setMachineToDelete(null);
  };

  const openEditDialog = (machine: Machine) => {
    setSelectedMachine(machine);
    setMachineName(machine.name);
    setMachineLocation(machine.location);
    setEditMachineDialogOpen(true);
  };

  const openDeleteDialog = (machine: Machine) => {
    setMachineToDelete(machine);
    setDeleteConfirmDialogOpen(true);
  };

  const openManageChecksDialog = (machine: Machine) => {
    setSelectedMachine(machine);
    setManageChecksDialogOpen(true);
  };

  const openAddCheckDialog = () => {
    setCheckTask("");
    setCheckDescription("");
    setCheckHowToVerify("");
    setCheckInterval("daily");
    setAddCheckDialogOpen(true);
  };

  const handleAddCheck = () => {
    if (!selectedMachine) return;
    if (!checkTask.trim()) {
      alert("Prosím vyplňte název úkonu");
      return;
    }
    if (!checkDescription.trim()) {
      alert("Prosím vyplňte popis");
      return;
    }

    onAddCheck({
      machineId: selectedMachine.id,
      task: checkTask,
      description: checkDescription,
      howToVerify: checkHowToVerify,
      interval: checkInterval,
    });

    setAddCheckDialogOpen(false);
  };

  const handleDeleteCheck = (checkId: string) => {
    if (confirm("Opravdu chcete smazat tuto kontrolu?")) {
      onDeleteCheck(checkId);
    }
  };

  const handleEditCheckClick = (check: Check) => {
    setSelectedCheckForEdit(check);
    setEditCheckTask(check.task);
    setEditCheckDescription(check.description);
    setEditCheckHowToVerify(check.howToVerify || "");
    setEditCheckInterval(check.interval);
    setEditCheckDialogOpen(true);
  };

  const handleEditCheckSubmit = () => {
    if (!selectedCheckForEdit) return;
    if (!editCheckTask.trim()) {
      alert("Prosím vyplňte název úkonu");
      return;
    }
    if (!editCheckDescription.trim()) {
      alert("Prosím vyplňte popis");
      return;
    }

    onUpdateCheck(selectedCheckForEdit.id, {
      task: editCheckTask,
      description: editCheckDescription,
      howToVerify: editCheckHowToVerify,
      interval: editCheckInterval,
    });

    setEditCheckDialogOpen(false);
    setSelectedCheckForEdit(null);
  };

  const getMachineChecks = (machineId: string) => {
    return checks.filter((c) => c.machineId === machineId);
  };

  // Filter and sort machines
  const filteredAndSortedMachines = machines
    .filter((machine) => selectedLocation === "all" || machine.location === selectedLocation)
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name, "cs");
      } else if (sortOrder === "desc") {
        return b.name.localeCompare(a.name, "cs");
      }
      return 0;
    });

  // Toggle sort order: null -> asc -> desc -> null
  const toggleSortOrder = () => {
    if (sortOrder === null) {
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder(null);
    }
  };

  // Get sort button text
  const getSortText = () => {
    if (sortOrder === "asc") return "A-Z";
    if (sortOrder === "desc") return "Z-A";
    return "Řadit";
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
              <h2 className="text-base sm:text-lg md:text-xl">Správa strojů</h2>
            </div>
            <Button
              onClick={() => {
                // Reset form when opening dialog
                setMachineName("");
                setMachineLocation("vyroba");
                setInitialCheckTask("");
                setInitialCheckDescription("");
                setInitialCheckHowToVerify("");
                setInitialCheckInterval("daily");
                setAddMachineDialogOpen(true);
              }}
              size="sm"
              className="min-h-[36px] sm:min-h-[40px]"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Přidat stroj</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Filter Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={selectedLocation !== "all" ? "default" : "ghost"} size="sm" className="h-8 w-8 p-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2">
                <div className="space-y-1">
                  <Button
                    variant={selectedLocation === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedLocation("all")}
                    className="w-full justify-start h-8 text-xs"
                  >
                    Všechna umístění
                  </Button>
                  {Object.entries(locationLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedLocation === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedLocation(key as Location)}
                      className="w-full justify-start h-8 text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort Button */}
            <Button
              variant={sortOrder !== null ? "default" : "ghost"}
              size="sm"
              onClick={toggleSortOrder}
              className="h-8 px-3 text-xs"
            >
              <ArrowUpDown className="w-3 h-3 mr-1.5" />
              {getSortText()}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
          {filteredAndSortedMachines.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
                {machines.length === 0
                  ? "Zatím nemáte žádné stroje"
                  : "Žádné stroje nevyhovují zvoleným filtrům"}
              </p>
            </Card>
          ) : (
            filteredAndSortedMachines.map((machine) => {
              const machineChecks = getMachineChecks(machine.id);
              return (
                <Card key={machine.id} className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold mb-1">{machine.name}</h3>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                          {locationLabels[machine.location]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(machine)}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(machine)}
                        className="h-8 w-8 sm:h-9 sm:w-9 text-destructive"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {machineChecks.length} {machineChecks.length === 1 ? "kontrola" : machineChecks.length < 5 ? "kontroly" : "kontrol"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openManageChecksDialog(machine)}
                      className="h-8 sm:h-9"
                    >
                      <span className="text-xs sm:text-sm">Spravovat kontroly</span>
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Add Machine Dialog */}
      <Dialog open={addMachineDialogOpen} onOpenChange={setAddMachineDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Přidat nový stroj</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <div className="space-y-4">
              {/* Machine Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Informace o stroji</h3>
                <div>
                  <Label htmlFor="machine-name">Název stroje *</Label>
                  <Input
                    id="machine-name"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    placeholder="např. Frézka CNC"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="machine-location">Umístění *</Label>
                  <Select value={machineLocation} onValueChange={(value) => setMachineLocation(value as Location)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(locationLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Initial Check Info */}
              <div className="pt-4 mt-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
                <h3 className="text-sm font-semibold">Základní kontrola</h3>
                <div>
                  <Label htmlFor="initial-check-task">Název úkonu *</Label>
                  <Input
                    id="initial-check-task"
                    value={initialCheckTask}
                    onChange={(e) => setInitialCheckTask(e.target.value)}
                    placeholder="např. Kontrola hydrauliky"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="initial-check-description">Popis práce *</Label>
                  <Textarea
                    id="initial-check-description"
                    value={initialCheckDescription}
                    onChange={(e) => setInitialCheckDescription(e.target.value)}
                    placeholder="Detailní popis kontroly..."
                    className="mt-2 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="initial-check-verify">Jak ověřit (volitelné)</Label>
                  <Textarea
                    id="initial-check-verify"
                    value={initialCheckHowToVerify}
                    onChange={(e) => setInitialCheckHowToVerify(e.target.value)}
                    placeholder="Jak ověřit správnost..."
                    className="mt-2 min-h-[60px]"
                  />
                </div>
                <div>
                  <Label htmlFor="initial-check-interval">Interval kontroly *</Label>
                  <Select
                    value={initialCheckInterval}
                    onValueChange={(value) => setInitialCheckInterval(value as CheckInterval)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(intervalLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Button variant="outline" onClick={() => setAddMachineDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleAddMachine}>Přidat stroj a kontrolu</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Machine Dialog */}
      <Dialog open={editMachineDialogOpen} onOpenChange={setEditMachineDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upravit stroj</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-machine-name">Název stroje</Label>
              <Input
                id="edit-machine-name"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-machine-location">Umístění</Label>
              <Select value={machineLocation} onValueChange={(value) => setMachineLocation(value as Location)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(locationLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditMachineDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleEditMachine}>Uložit</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Smazat stroj</DialogTitle>
          </DialogHeader>
          <p className="text-sm sm:text-base" style={{ color: "var(--muted-foreground)" }}>
            Opravdu chcete smazat stroj <strong>{machineToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmDialogOpen(false)}>
              Zrušit
            </Button>
            <Button variant="destructive" onClick={handleDeleteMachine}>
              Smazat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Checks Dialog */}
      <Dialog open={manageChecksDialogOpen} onOpenChange={setManageChecksDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Kontroly - {selectedMachine?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {selectedMachine &&
                getMachineChecks(selectedMachine.id).map((check) => (
                  <Card key={check.id} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium mb-1">{check.task}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{check.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {intervalLabels[check.interval]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCheckClick(check)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCheck(check.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              {selectedMachine && getMachineChecks(selectedMachine.id).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Žádné kontroly</p>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-between gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Button onClick={openAddCheckDialog} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Přidat kontrolu
            </Button>
            <Button onClick={() => setManageChecksDialogOpen(false)}>Zavřít</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Check Dialog */}
      <Dialog open={addCheckDialogOpen} onOpenChange={setAddCheckDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Přidat kontrolu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="check-task">Název úkonu *</Label>
              <Input
                id="check-task"
                value={checkTask}
                onChange={(e) => setCheckTask(e.target.value)}
                placeholder="např. Kontrola hydrauliky"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="check-description">Popis práce *</Label>
              <Textarea
                id="check-description"
                value={checkDescription}
                onChange={(e) => setCheckDescription(e.target.value)}
                placeholder="Detailní popis kontroly..."
                className="mt-2 min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="check-verify">Jak ověřit (volitelné)</Label>
              <Textarea
                id="check-verify"
                value={checkHowToVerify}
                onChange={(e) => setCheckHowToVerify(e.target.value)}
                placeholder="Jak ověřit správnost..."
                className="mt-2 min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="check-interval">Interval *</Label>
              <Select value={checkInterval} onValueChange={(value) => setCheckInterval(value as CheckInterval)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(intervalLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAddCheckDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleAddCheck}>Přidat</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Check Dialog */}
      <Dialog open={editCheckDialogOpen} onOpenChange={setEditCheckDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upravit kontrolu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-check-task">Název úkonu *</Label>
              <Input
                id="edit-check-task"
                value={editCheckTask}
                onChange={(e) => setEditCheckTask(e.target.value)}
                placeholder="např. Kontrola hydrauliky"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-check-description">Popis práce *</Label>
              <Textarea
                id="edit-check-description"
                value={editCheckDescription}
                onChange={(e) => setEditCheckDescription(e.target.value)}
                placeholder="Detailní popis kontroly..."
                className="mt-2 min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-check-verify">Jak ověřit (volitelné)</Label>
              <Textarea
                id="edit-check-verify"
                value={editCheckHowToVerify}
                onChange={(e) => setEditCheckHowToVerify(e.target.value)}
                placeholder="Jak ověřit správnost..."
                className="mt-2 min-h-[60px]"
              />
            </div>
            <div>
              <Label htmlFor="edit-check-interval">Interval *</Label>
              <Select value={editCheckInterval} onValueChange={(value) => setEditCheckInterval(value as CheckInterval)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(intervalLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditCheckDialogOpen(false)}>
              Zrušit
            </Button>
            <Button onClick={handleEditCheckSubmit}>Uložit změny</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
