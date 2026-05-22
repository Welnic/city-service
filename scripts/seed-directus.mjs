#!/usr/bin/env node

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || "admin@cityservice.com";
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || "admin123";

let token = "";

async function login() {
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  token = data.data.access_token;
}

async function api(method, path, body) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 400 && text.includes("already exists")) {
      return null;
    }
    throw new Error(`${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function collectionExists(name) {
  const res = await fetch(`${DIRECTUS_URL}/collections/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

async function createCollection(collection, meta = {}) {
  if (await collectionExists(collection)) {
    console.log(`  Collection "${collection}" already exists, skipping`);
    return;
  }
  await api("POST", "/collections", {
    collection,
    schema: {},
    meta: { icon: meta.icon || "box", note: meta.note || null },
    fields: [
      {
        field: "id",
        type: "uuid",
        schema: { is_primary_key: true, has_auto_increment: false },
        meta: { special: ["uuid"], interface: "input", readonly: true, hidden: true },
      },
    ],
  });
  console.log(`  Created collection "${collection}"`);
}

async function createField(collection, field, type, schema = {}, meta = {}) {
  try {
    await api("POST", `/fields/${collection}`, {
      field,
      type,
      schema: {
        is_nullable: schema.is_nullable ?? true,
        default_value: schema.default_value ?? null,
        ...schema,
      },
      meta: {
        interface: meta.interface || null,
        special: meta.special || null,
        note: meta.note || null,
        ...meta,
      },
    });
  } catch (e) {
    if (e.message.includes("already exists")) {
      return;
    }
    throw e;
  }
}

async function createRelation(collection, field, related_collection) {
  try {
    await api("POST", "/relations", {
      collection,
      field,
      related_collection,
    });
  } catch (e) {
    if (e.message.includes("already exists") || e.message.includes("already has an associated relationship")) {
      return;
    }
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Collection definitions
// ---------------------------------------------------------------------------

async function seedObjects() {
  console.log("\n[1/10] objects");
  await createCollection("objects", { icon: "apartment", note: "Buildings and properties" });
  await createField("objects", "code", "string", { is_nullable: false });
  await createField("objects", "description", "string");
  await createField("objects", "full_address", "string");
  await createField("objects", "labbis_id", "string", {}, { note: "Original ObjectId from LABBIS API" });
}

async function seedSystemGroups() {
  console.log("\n[2/10] system_groups");
  await createCollection("system_groups", { icon: "category", note: "Equipment/system categorization groups" });
  await createField("system_groups", "name", "string", { is_nullable: false });
  await createField("system_groups", "labbis_id", "string", {}, { note: "Original SystGroupId from LABBIS API" });
}

async function seedSystems() {
  console.log("\n[3/10] systems");
  await createCollection("systems", { icon: "settings", note: "Specific systems within groups" });
  await createField("systems", "name", "string", { is_nullable: false });
  await createField("systems", "system_group_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("systems", "system_group_id", "system_groups");
  await createField("systems", "labbis_id", "string", {}, { note: "Original SystemosId from LABBIS API" });
}

async function seedSystemUsers() {
  console.log("\n[4/10] system_users");
  await createCollection("system_users", { icon: "people", note: "Staff and user accounts" });
  await createField("system_users", "login_name", "string", { is_nullable: false });
  await createField("system_users", "full_name", "string");
  await createField("system_users", "email", "string");
  await createField("system_users", "phone", "string");
  await createField("system_users", "job_title", "string");
  await createField("system_users", "is_disabled", "boolean", { default_value: false, is_nullable: false });
  await createField("system_users", "roles", "json", {}, { interface: "tags", special: ["cast-json"] });
  await createField("system_users", "created_on", "timestamp");
  await createField("system_users", "labbis_id", "string", {}, { note: "Original SystemUserId from LABBIS API" });
}

async function seedDefectActs() {
  console.log("\n[5/10] defect_acts");
  await createCollection("defect_acts", { icon: "report_problem", note: "Defect/maintenance acts - core entity" });
  await createField("defect_acts", "act_number", "string");
  await createField("defect_acts", "defect_date", "timestamp", { is_nullable: false });
  await createField("defect_acts", "object_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("defect_acts", "object_id", "objects");
  await createField("defect_acts", "problem", "text");
  await createField("defect_acts", "place", "string");
  await createField("defect_acts", "status", "string", { is_nullable: false, default_value: "In Progress" });
  await createField("defect_acts", "priority", "string");
  await createField("defect_acts", "description", "text");
  await createField("defect_acts", "solution", "text");
  await createField("defect_acts", "system_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("defect_acts", "system_id", "systems");
  await createField("defect_acts", "system_group_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("defect_acts", "system_group_id", "system_groups");
  await createField("defect_acts", "labbis_id", "string", {}, { note: "Original DefectActId from LABBIS API" });
}

async function seedDefectActJobs() {
  console.log("\n[6/10] defect_act_jobs");
  await createCollection("defect_act_jobs", { icon: "construction", note: "Work items for defect acts" });
  await createField("defect_act_jobs", "defect_act_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("defect_act_jobs", "defect_act_id", "defect_acts");
  await createField("defect_act_jobs", "description", "string");
  await createField("defect_act_jobs", "amount", "float");
  await createField("defect_act_jobs", "price", "float");
  await createField("defect_act_jobs", "unit", "string");
  await createField("defect_act_jobs", "labbis_id", "string", {}, { note: "Original DefectActJobId from LABBIS API" });
}

async function seedDefectActMaterials() {
  console.log("\n[7/10] defect_act_materials");
  await createCollection("defect_act_materials", { icon: "inventory_2", note: "Materials used for defect acts" });
  await createField("defect_act_materials", "defect_act_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("defect_act_materials", "defect_act_id", "defect_acts");
  await createField("defect_act_materials", "description", "string");
  await createField("defect_act_materials", "amount", "float");
  await createField("defect_act_materials", "price", "float");
  await createField("defect_act_materials", "unit", "string");
  await createField("defect_act_materials", "labbis_id", "string", {}, { note: "Original DefectActMaterialId from LABBIS API" });
}

async function seedNotes() {
  console.log("\n[8/10] notes");
  await createCollection("notes", { icon: "comment", note: "Work progress comments and timeline entries" });
  await createField("notes", "defect_act_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("notes", "defect_act_id", "defect_acts");
  await createField("notes", "text", "text");
  await createField("notes", "created_by_name", "string");
  await createField("notes", "created_on", "timestamp");
  await createField("notes", "labbis_id", "string", {}, { note: "Original NoteId from LABBIS API" });
}

async function seedNotifications() {
  console.log("\n[9/10] notifications");
  await createCollection("notifications", { icon: "notifications", note: "App-generated user notifications" });
  await createField("notifications", "user_id", "uuid", {}, { special: ["m2o"] });
  await createRelation("notifications", "user_id", "system_users");
  await createField("notifications", "type", "string", { is_nullable: false }, {
    interface: "select-dropdown",
    options: {
      choices: [
        { text: "Status Change", value: "status" },
        { text: "Comment", value: "comment" },
        { text: "Assignment", value: "assignment" },
        { text: "Completion", value: "completion" },
        { text: "Postponed", value: "postponed" },
        { text: "Warranty", value: "warranty" },
      ],
    },
  });
  await createField("notifications", "title", "string", { is_nullable: false });
  await createField("notifications", "description", "text", { is_nullable: false });
  await createField("notifications", "reference", "string");
  await createField("notifications", "defect_act_id", "uuid", {}, { special: ["m2o"] });
  await createRelation("notifications", "defect_act_id", "defect_acts");
  await createField("notifications", "is_read", "boolean", { default_value: false, is_nullable: false });
  await createField("notifications", "date_created", "timestamp", {}, { special: ["date-created"], interface: "datetime" });
}

async function seedUserObjectAssignments() {
  console.log("\n[10/10] user_object_assignments");
  await createCollection("user_object_assignments", { icon: "link", note: "User-to-object role assignments" });
  await createField("user_object_assignments", "user_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("user_object_assignments", "user_id", "system_users");
  await createField("user_object_assignments", "object_id", "uuid", { is_nullable: false }, { special: ["m2o"] });
  await createRelation("user_object_assignments", "object_id", "objects");
  await createField("user_object_assignments", "role", "string", { is_nullable: false });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding Directus at ${DIRECTUS_URL}...`);
  await login();
  console.log("Authenticated.");

  await seedObjects();
  await seedSystemGroups();
  await seedSystems();
  await seedSystemUsers();
  await seedDefectActs();
  await seedDefectActJobs();
  await seedDefectActMaterials();
  await seedNotes();
  await seedNotifications();
  await seedUserObjectAssignments();

  console.log("\nDone! All collections created successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
