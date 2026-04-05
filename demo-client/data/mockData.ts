export type CheckInterval = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type CheckStatus = "pending" | "completed" | "issue" | "cannot_complete";
export type Location = "vyroba" | "bourarna" | "porazky" | "ostatni" | "expedice";

export interface Machine {
  id: string;
  name: string;
  location: Location;
}

export interface Check {
  id: string;
  machineId: string;
  task: string;
  description: string;
  howToVerify?: string;
  interval: CheckInterval;
  status: CheckStatus;
  completedBy?: string;
  completedAt?: Date;
  note?: string;
  issue?: string;
  issuePhoto?: string; // Base64 or URL
  jiraIssueKey?: string;
  jiraIssueUrl?: string;
  jiraSyncError?: string;
  scheduledDate: Date;
}

export type UserStatus = "pending" | "approved" | "rejected";
export type TenantId = "toro" | "other"; // Expandable for future tenants
export type NotificationType = "check_due_soon" | "issue" | "cannot_complete" | "completed" | "admin_reminder";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "operator" | "admin";
  tenants: TenantId[];
  status: UserStatus;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string; // komu je určena
  type: NotificationType;
  checkId?: string; // reference na kontrolu
  message: string;
  createdAt: Date;
  read: boolean;
  createdBy?: string; // kdo to vytvořil (pro admin reminders)
}

export interface SubmittedWork {
  id: string;
  employeeId: string;
  employeeName: string;
  submittedDate: Date;
  workDate: Date;
  totalChecks: number;
  completedChecks: number;
  issueCount: number;
  cannotCompleteCount: number;
  status: "submitted" | "reviewed" | "approved" | "rejected";
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

export const machines: Machine[] = [
  { id: "m1", name: "Pásová pila Bomar", location: "vyroba" },
  { id: "m2", name: "Soustruh TOS", location: "vyroba" },
  { id: "m3", name: "Frézka CNC", location: "vyroba" },
  { id: "m4", name: "Vyvrtávačka", location: "vyroba" },
  { id: "m5", name: "Bourací kladivo", location: "bourarna" },
  { id: "m6", name: "Hydraulické nůžky", location: "bourarna" },
  { id: "m7", name: "Bourací linka A", location: "bourarna" },
  { id: "m8", name: "Porážecí box 1", location: "porazky" },
  { id: "m9", name: "Porážecí box 2", location: "porazky" },
  { id: "m10", name: "Mycí linka", location: "porazky" },
  { id: "m11", name: "Kompresor hlavní", location: "ostatni" },
  { id: "m12", name: "Klimatizace hala 1", location: "ostatni" },
  { id: "m13", name: "Vysokozdvižný vozík VZV-01", location: "expedice" },
  { id: "m14", name: "Vysokozdvižný vozík VZV-02", location: "expedice" },
  { id: "m15", name: "Paletový vozík", location: "expedice" },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

export const checks: Check[] = [
  // Denní kontroly
  {
    id: "c1",
    machineId: "m1",
    task: "Vizuální kontrola + promazání",
    description: "Zkontrolovat stav pásu, napnutí, promazat vedení",
    howToVerify: "Pás musí být rovný, bez prasklin, vedení se pohybuje hladce",
    interval: "daily",
    status: "completed",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 8 * 3600000),
    scheduledDate: today,
  },
  {
    id: "c2",
    machineId: "m2",
    task: "Kontrola chladicí kapaliny",
    description: "Zkontrolovat hladinu a čistotu chladicí kapaliny",
    howToVerify: "Hladina mezi MIN a MAX, kapalina čistá bez nečistot",
    interval: "daily",
    status: "completed",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 8.5 * 3600000),
    scheduledDate: today,
  },
  {
    id: "c3",
    machineId: "m3",
    task: "Kontrola nástrojů CNC",
    description: "Vizuální kontrola opotřebení nástrojů, kontrola upnutí",
    howToVerify: "Nástroje bez viditelného opotřebení, pevně upnuté",
    interval: "daily",
    status: "completed",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 9 * 3600000),
    scheduledDate: today,
  },
  {
    id: "c4",
    machineId: "m4",
    task: "Kontrola hydrauliky",
    description: "Zkontrolovat tlak hydrauliky, úniky oleje",
    howToVerify: "Tlak v normě (150-180 bar), bez viditelných úniků",
    interval: "daily",
    status: "issue",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 10 * 3600000),
    issue: "Malý únik oleje u hlavního válce - nutná výměna těsnění",
    scheduledDate: today,
  },
  {
    id: "c5",
    machineId: "m5",
    task: "Kontrola mazání",
    description: "Promazat všechny pohyblivé části, zkontrolovat množství maziva",
    interval: "daily",
    status: "completed",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 10.5 * 3600000),
    scheduledDate: today,
  },
  {
    id: "c6",
    machineId: "m6",
    task: "Kontrola břitů",
    description: "Vizuální kontrola břitů nůžek, zkontrolovat ostrost",
    interval: "daily",
    status: "completed",
    completedBy: "p. Tichý",
    completedAt: new Date(today.getTime() + 11 * 3600000),
    scheduledDate: today,
  },
  {
    id: "c7",
    machineId: "m8",
    task: "Sanitace boxu",
    description: "Dezinfekce stěn a podlahy, kontrola odtoku",
    howToVerify: "Povrchy čisté, odtok volný",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c8",
    machineId: "m9",
    task: "Sanitace boxu",
    description: "Dezinfekce stěn a podlahy, kontrola odtoku",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c9",
    machineId: "m10",
    task: "Kontrola mycí linky",
    description: "Zkontrolovat trysky, teplotu vody, množství dezinfekce",
    howToVerify: "Všechny trysky funkční, teplota 60-80°C, hladina dezinfekce OK",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c10",
    machineId: "m11",
    task: "Kontrola tlaku kompresoru",
    description: "Zkontrolovat výstupní tlak, odvodnit nádrž",
    howToVerify: "Tlak 7-8 bar, nádrž bez kondenzátu",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c11",
    machineId: "m12",
    task: "Kontrola klimatizace",
    description: "Zkontrolovat teplotu, filtr, odtok kondenzátu",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c12",
    machineId: "m13",
    task: "Kontrola VZV před směnou",
    description: "Brzdy, světla, klakson, hladina oleje, nabití baterie",
    howToVerify: "Vše funkční, olej v normě, baterie nad 50%",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c13",
    machineId: "m14",
    task: "Kontrola VZV před směnou",
    description: "Brzdy, světla, klakson, hladina oleje, nabití baterie",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c14",
    machineId: "m15",
    task: "Kontrola paletového vozíku",
    description: "Kontrola kol, hydrauliky zdvihu, funkce brzd",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c15",
    machineId: "m7",
    task: "Kontrola bourací linky",
    description: "Kontrola pohonů, mazání řetězů, brzdy",
    howToVerify: "Řetězy namazané, brzdy funkční, bez neobvyklých zvuků",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c16",
    machineId: "m1",
    task: "Kontrola napínacího systému",
    description: "Zkontrolovat napínací mechanismus pásu",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c17",
    machineId: "m2",
    task: "Čištění třísek",
    description: "Odstranit třísky z pracovního prostoru a záchytné nádoby",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c18",
    machineId: "m3",
    task: "Kontrola upínacích prvků",
    description: "Zkontrolovat stav a funkčnost upínacích čelistí",
    interval: "daily",
    status: "pending",
    scheduledDate: today,
  },

  // Týdenní kontroly
  {
    id: "c19",
    machineId: "m1",
    task: "Důkladná kontrola vedení",
    description: "Demontáž krytů, kontrola ložisek, čištění, mazání",
    interval: "weekly",
    status: "pending",
    scheduledDate: today,
  },
  {
    id: "c20",
    machineId: "m11",
    task: "Kontrola filtru kompresoru",
    description: "Zkontrolovat stav vzduchového filtru, vyčistit nebo vyměnit",
    interval: "weekly",
    status: "pending",
    scheduledDate: today,
  },
];

export const locationLabels: Record<Location, string> = {
  vyroba: "Výroba",
  bourarna: "Bourárna",
  porazky: "Porážky",
  ostatni: "Ostatní",
  expedice: "Expedice",
};

// --- Tenant management ---

export interface Tenant {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: Date;
}

export interface LocationEntry {
  id: string;
  name: string;
  key: string; // slug pro zpětnou kompatibilitu s Location typem
  tenantId: string;
  description?: string;
  active: boolean;
  createdAt: Date;
}

export const tenantStatusLabels: Record<Tenant["status"], string> = {
  active: "Aktivní",
  inactive: "Neaktivní",
};

export const tenants: Tenant[] = [
  {
    id: "t1",
    name: "TORO",
    contactPerson: "Ing. Malá",
    email: "mala@toro.cz",
    phone: "+420 123 456 789",
    status: "active",
    createdAt: new Date(2023, 0, 1),
  },
  {
    id: "t2",
    name: "AGRO Plus s.r.o.",
    contactPerson: "p. Kovář",
    email: "kovar@agroplus.cz",
    phone: "+420 987 654 321",
    status: "active",
    createdAt: new Date(2024, 3, 15),
  },
  {
    id: "t3",
    name: "BioFarm Morava",
    contactPerson: "pí Horáková",
    email: "horakova@biofarm.cz",
    status: "inactive",
    createdAt: new Date(2024, 8, 10),
  },
];

export const locationEntries: LocationEntry[] = [
  { id: "l1", name: "Výroba", key: "vyroba", tenantId: "t1", description: "Výrobní hala a CNC stroje", active: true, createdAt: new Date(2023, 0, 1) },
  { id: "l2", name: "Bourárna", key: "bourarna", tenantId: "t1", description: "Bourací linky a hydraulické nůžky", active: true, createdAt: new Date(2023, 0, 1) },
  { id: "l3", name: "Porážky", key: "porazky", tenantId: "t1", description: "Porážecí boxy a mycí linky", active: true, createdAt: new Date(2023, 0, 1) },
  { id: "l4", name: "Ostatní", key: "ostatni", tenantId: "t1", description: "Kompresory, klimatizace a ostatní zařízení", active: true, createdAt: new Date(2023, 0, 1) },
  { id: "l5", name: "Expedice", key: "expedice", tenantId: "t1", description: "Vysokozdvižné vozíky a paletové vozíky", active: true, createdAt: new Date(2023, 0, 1) },
  { id: "l6", name: "Sklady", key: "sklady", tenantId: "t2", description: "Skladovací prostory", active: true, createdAt: new Date(2024, 3, 15) },
  { id: "l7", name: "Pole A", key: "pole_a", tenantId: "t2", description: "Zemědělské stroje pro pole A", active: true, createdAt: new Date(2024, 3, 15) },
];

export const intervalLabels: Record<CheckInterval, string> = {
  daily: "Denně",
  weekly: "Týdně",
  monthly: "Měsíčně",
  quarterly: "Čtvrtletně",
  yearly: "Ročně",
};

export const tenantLabels: Record<TenantId, string> = {
  toro: "TORO",
  other: "Ostatní",
};

export const userStatusLabels: Record<UserStatus, string> = {
  pending: "Čeká na schválení",
  approved: "Schváleno",
  rejected: "Zamítnuto",
};

export const users: User[] = [
  {
    id: "u1",
    name: "p. Novák",
    email: "jan.novak@toro.cz",
    role: "operator",
    tenants: ["toro"],
    status: "approved",
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: "u2",
    name: "pí Nováková",
    email: "novakova@toro.cz",
    role: "admin",
    tenants: ["toro"],
    status: "approved",
    createdAt: new Date(2024, 0, 10),
  },
  {
    id: "u3",
    name: "p. Svoboda",
    email: "petr.svoboda@toro.cz",
    role: "operator",
    tenants: [],
    status: "pending",
    createdAt: new Date(2024, 11, 1),
  },
  {
    id: "u4",
    name: "p. Dvořák",
    email: "dvorak@toro.cz",
    role: "operator",
    tenants: ["toro"],
    status: "approved",
    createdAt: new Date(2024, 1, 20),
  },
  {
    id: "u5",
    name: "pí Černá",
    email: "cerna@toro.cz",
    role: "operator",
    tenants: [],
    status: "pending",
    createdAt: new Date(2024, 11, 10),
  },
];

export const notificationTypeLabels: Record<NotificationType, string> = {
  check_due_soon: "Blíží se konec kontroly",
  issue: "Zjištěna závada",
  cannot_complete: "Kontrola nelze dokončit",
  completed: "Kontrola dokončena",
  admin_reminder: "Připomínka od admina",
};

const now = new Date();

export const notifications: Notification[] = [
  // Admin notifications
  {
    id: "n1",
    userId: "u2", // pí Nováková (admin)
    type: "issue",
    checkId: "c4",
    message: "Malý únik oleje u hlavního válce - Vyvrtávačka",
    createdAt: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
    read: false,
  },
  {
    id: "n2",
    userId: "u2",
    type: "check_due_soon",
    checkId: "c7",
    message: "Sanitace boxu (Porážecí box 1) - zbývá méně než 2 hodiny",
    createdAt: new Date(now.getTime() - 30 * 60000), // 30 min ago
    read: false,
  },
  {
    id: "n3",
    userId: "u2",
    type: "completed",
    checkId: "c1",
    message: "p. Tichý dokončil: Vizuální kontrola + promazání (Pásová pila Bomar)",
    createdAt: new Date(now.getTime() - 4 * 3600000), // 4 hours ago
    read: true,
  },
  // Operator notifications
  {
    id: "n4",
    userId: "u1", // p. Novák (operator)
    type: "check_due_soon",
    checkId: "c8",
    message: "Sanitace boxu (Porážecí box 2) - zbývá méně než 3 hodiny",
    createdAt: new Date(now.getTime() - 15 * 60000), // 15 min ago
    read: false,
  },
  {
    id: "n5",
    userId: "u1",
    type: "admin_reminder",
    checkId: "c10",
    message: "Nezapomeňte dokončit kontrolu mycí linky - pí Nováková",
    createdAt: new Date(now.getTime() - 45 * 60000), // 45 min ago
    read: false,
    createdBy: "pí Nováková",
  },
  {
    id: "n6",
    userId: "u4", // p. Dvořák
    type: "check_due_soon",
    checkId: "c13",
    message: "Kontrola vozíku - zbývá méně než 1 hodina",
    createdAt: new Date(now.getTime() - 10 * 60000),
    read: false,
  },
];

const workDate = new Date();
workDate.setDate(workDate.getDate() - 1); // Yesterday

const workDate2 = new Date();
workDate2.setDate(workDate2.getDate() - 2);

export const submittedWork: SubmittedWork[] = [
  {
    id: "sw1",
    employeeId: "u1",
    employeeName: "p. Novák",
    submittedDate: new Date(workDate.getTime() + 18 * 3600000),
    workDate,
    totalChecks: 20,
    completedChecks: 18,
    issueCount: 1,
    cannotCompleteCount: 1,
    status: "approved",
  },
  {
    id: "sw2",
    employeeId: "u4",
    employeeName: "p. Dvořák",
    submittedDate: new Date(workDate.getTime() + 17 * 3600000),
    workDate,
    totalChecks: 15,
    completedChecks: 14,
    issueCount: 1,
    cannotCompleteCount: 0,
    status: "submitted",
  },
  {
    id: "sw3",
    employeeId: "u3",
    employeeName: "pí Nováková",
    submittedDate: new Date(now.getTime() - 8 * 3600000),
    workDate: new Date(),
    totalChecks: 18,
    completedChecks: 17,
    issueCount: 0,
    cannotCompleteCount: 1,
    status: "submitted",
  },
  {
    id: "sw4",
    employeeId: "u1",
    employeeName: "p. Novák",
    submittedDate: new Date(workDate2.getTime() + 17 * 3600000),
    workDate: workDate2,
    totalChecks: 20,
    completedChecks: 20,
    issueCount: 0,
    cannotCompleteCount: 0,
    status: "approved",
  },
];
