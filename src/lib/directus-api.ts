const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN =
  process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || "";

function directusFetch(path: string, params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const headers: Record<string, string> = {};
  if (DIRECTUS_TOKEN) headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  return fetch(`${DIRECTUS_URL}${path}${query}`, { headers }).then((r) => r.json());
}

// ---------------------------------------------------------------------------
// Defect Acts
// ---------------------------------------------------------------------------

export async function fetchDefectActs(opts?: {
  limit?: number;
  page?: number;
  sort?: string;
}) {
  const params: Record<string, string> = {
    limit: String(opts?.limit ?? 100),
    sort: opts?.sort ?? "-defect_date",
  };
  if (opts?.page) params.page = String(opts.page);

  const json = await directusFetch("/items/defect_acts", params);
  return ((json.data as any[]) || []).map(mapDefectAct);
}

export async function fetchDefectActById(id: string) {
  const json = await directusFetch(`/items/defect_acts/${id}`);
  return json.data ? mapDefectAct(json.data) : null;
}

// ---------------------------------------------------------------------------
// Objects
// ---------------------------------------------------------------------------

export async function fetchObjects() {
  const json = await directusFetch("/items/objects", { limit: "-1" });
  return ((json.data as any[]) || []).map(mapObject);
}

export async function fetchObjectById(id: string) {
  const json = await directusFetch(`/items/objects/${id}`);
  return json.data ? mapObject(json.data) : null;
}

// ---------------------------------------------------------------------------
// System Users
// ---------------------------------------------------------------------------

export async function fetchSystemUsers() {
  const json = await directusFetch("/items/system_users", { limit: "-1" });
  return ((json.data as any[]) || []).map(mapSystemUser);
}

export async function fetchSystemUserById(id: string) {
  const json = await directusFetch(`/items/system_users/${id}`);
  return json.data ? mapSystemUser(json.data) : null;
}

// ---------------------------------------------------------------------------
// Notes (timeline entries)
// ---------------------------------------------------------------------------

export async function fetchNotesByDefectAct(defectActId: string) {
  const json = await directusFetch("/items/labbis_note", {
    "filter[DefectActId][_eq]": defectActId,
    sort: "-CreatedOn",
    limit: "-1",
  });
  return ((json.data as any[]) || []).map(mapNote);
}

// ---------------------------------------------------------------------------
// Jobs & Materials (works on a defect act)
// ---------------------------------------------------------------------------

export async function fetchJobsByDefectAct(defectActId: string) {
  const json = await directusFetch("/items/labbis_defect_act_job", {
    "filter[DefectActId][_eq]": defectActId,
    limit: "-1",
  });
  return ((json.data as any[]) || []).map(mapJob);
}

export async function fetchMaterialsByDefectAct(defectActId: string) {
  const json = await directusFetch("/items/labbis_defect_act_material", {
    "filter[DefectActId][_eq]": defectActId,
    limit: "-1",
  });
  return ((json.data as any[]) || []).map(mapMaterial);
}

// ---------------------------------------------------------------------------
// Systems & System Groups
// ---------------------------------------------------------------------------

export async function fetchSystems() {
  const json = await directusFetch("/items/labbis_systemos", { limit: "-1" });
  return ((json.data as any[]) || []).map(mapSystem);
}

export async function fetchSystemGroups() {
  const json = await directusFetch("/items/labbis_syst_group", { limit: "-1" });
  return ((json.data as any[]) || []).map(mapSystemGroup);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function fetchNotifications() {
  const json = await directusFetch("/items/notifications", {
    sort: "-date_created",
    limit: "-1",
  });
  return ((json.data as any[]) || []).map(mapNotification);
}

export async function markNotificationRead(id: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (DIRECTUS_TOKEN) headers["Authorization"] = `Bearer ${DIRECTUS_TOKEN}`;
  return fetch(`${DIRECTUS_URL}/items/notifications/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_read: true }),
  }).then((r) => r.json());
}

// ---------------------------------------------------------------------------
// User Object Assignments
// ---------------------------------------------------------------------------

export async function fetchUserObjectAssignments(userId?: string) {
  const params: Record<string, string> = { limit: "-1" };
  if (userId) params["filter[user_id][_eq]"] = userId;
  const json = await directusFetch("/items/user_object_assignments", params);
  return ((json.data as any[]) || []).map(mapUserObjectAssignment);
}

// ---------------------------------------------------------------------------
// User Preferences
// ---------------------------------------------------------------------------

export async function fetchUserPreferences(userId: string) {
  const json = await directusFetch("/items/user_preferences", {
    "filter[user_id][_eq]": userId,
    limit: "1",
  });
  const items = (json.data as any[]) || [];
  return items[0] ? mapUserPreferences(items[0]) : null;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapDefectAct(da: Record<string, any>) {
  return {
    DefectActId: da.id ?? da.DefectActId,
    ActNumber: da.act_number ?? da.ActNumber,
    DefectActDate: da.defect_date ?? da.DefectActDate,
    ObjectId: da.object_id ?? da.ObjectId,
    Problem: da.problem ?? da.Problem,
    Place: da.place ?? da.Place,
    Status: da.status ?? da.Status,
    Description: da.description ?? da.Description,
    Solution: da.solution ?? da.Solution,
    SystemosId: da.system_id ?? da.SystemosId,
    SystGroupId: da.system_group_id ?? da.SystGroupId,
    Priority: da.priority ?? da.Priority ?? null,
    CreatedOn: da.created_on ?? da.CreatedOn ?? da.defect_date ?? da.DefectActDate,
  };
}

function mapObject(obj: Record<string, any>) {
  return {
    ObjectId: obj.id ?? obj.ObjectId,
    Code: obj.code ?? obj.Code,
    Description: obj.description ?? obj.Description,
    FullAddress: obj.full_address ?? obj.FullAddress,
  };
}

function mapSystemUser(u: Record<string, any>) {
  return {
    SystemUserId: u.id ?? u.SystemUserId,
    LoginName: u.login_name ?? u.LoginName,
    FullName: u.full_name ?? u.FullName,
    Email: u.email ?? u.Email,
    JobTitle: u.job_title ?? u.JobTitle,
    IsDisabled: u.is_disabled ?? u.IsDisabled ?? false,
    Roles: Array.isArray(u.roles ?? u.Roles) ? (u.roles ?? u.Roles) : [],
    CreatedOn: u.created_on ?? u.CreatedOn,
    OfficePhone: u.phone ?? u.OfficePhone,
  };
}

function mapNote(n: Record<string, any>) {
  return {
    NoteId: n.NoteId,
    CreatedBy: n.CreatedBy,
    CreatedByName: n.CreatedByName,
    Text: n.Text,
    CreatedOn: n.CreatedOn,
    BlobId: n.BlobId,
    BlobName: n.BlobName,
    DefectActId: n.DefectActId,
  };
}

function mapJob(j: Record<string, any>) {
  return {
    DefectActJobId: j.DefectActJobId,
    Description: j.Description,
    Amount: j.Amount,
    Price: j.Price,
    UoMId: j.UoMId,
    DefectActId: j.DefectActId,
  };
}

function mapMaterial(m: Record<string, any>) {
  return {
    DefectActMaterialId: m.DefectActMaterialId,
    Description: m.Description,
    Amount: m.Amount,
    Price: m.Price,
    UoMId: m.UoMId,
    DefectActId: m.DefectActId,
  };
}

function mapSystem(s: Record<string, any>) {
  return {
    SystemosId: s.SystemosId,
    SystemosName: s.SystemosName,
    SystGroupId: s.SystGroupId,
  };
}

function mapSystemGroup(sg: Record<string, any>) {
  return {
    SystGroupId: sg.SystGroupId,
    SystGroupName: sg.SystGroupName,
  };
}

function mapNotification(n: Record<string, any>) {
  return {
    id: n.id,
    userId: n.user_id,
    type: n.type as "status" | "comment" | "assignment" | "completion" | "postponed" | "warranty",
    title: n.title,
    description: n.description,
    reference: n.reference,
    referenceId: n.reference_id,
    isRead: n.is_read ?? false,
    dateCreated: n.date_created,
  };
}

function mapUserObjectAssignment(a: Record<string, any>) {
  return {
    id: a.id,
    userId: a.user_id,
    objectId: a.object_id,
    role: a.role,
  };
}

function mapUserPreferences(p: Record<string, any>) {
  return {
    id: p.id,
    userId: p.user_id,
    monthlySummary: p.monthly_summary ?? true,
    defectUpdates: p.defect_updates ?? true,
    phoneNotifications: p.phone_notifications ?? false,
    emailNotifications: p.email_notifications ?? true,
  };
}
