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

async function createCollection(collection, pkField, meta = {}) {
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
        field: pkField,
        type: "uuid",
        schema: { is_primary_key: true, has_auto_increment: false },
        meta: { special: ["uuid"], interface: "input", readonly: true, hidden: true },
      },
    ],
  });
  console.log(`  Created collection "${collection}" (PK: ${pkField})`);
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

// ---------------------------------------------------------------------------
// Mirror collection definitions (exact API column names)
// ---------------------------------------------------------------------------

async function seedLabbisObject() {
  console.log("\n[1/8] labbis_object");
  await createCollection("labbis_object", "ObjectId", {
    icon: "apartment",
    note: "Mirror of LABBIS Object (buildings/properties)",
  });
  await createField("labbis_object", "Code", "string");
  await createField("labbis_object", "Description", "string");
  await createField("labbis_object", "Description1", "string");
  await createField("labbis_object", "FullAddress", "string");
  await createField("labbis_object", "CorUniqueNumber", "string");
  await createField("labbis_object", "IsCommunalObject", "boolean", { default_value: false });
  await createField("labbis_object", "ObjectTypeId", "uuid");
  await createField("labbis_object", "ObjectProfitabilityId", "uuid");
  await createField("labbis_object", "OwningBusinessUnitId", "uuid");
  await createField("labbis_object", "OwningOrganizationId", "uuid");
  await createField("labbis_object", "PayerAccountId", "uuid");
  await createField("labbis_object", "ParentObjectId", "uuid");
  await createField("labbis_object", "Priority", "integer");
  await createField("labbis_object", "SectorId", "uuid");
  await createField("labbis_object", "SolidarityTypeCode", "integer");
  await createField("labbis_object", "Status", "integer");
  await createField("labbis_object", "UsableFloorArea", "float");
  await createField("labbis_object", "Address", "json", {}, { special: ["cast-json"] });
}

async function seedLabbisDefectAct() {
  console.log("\n[2/8] labbis_defect_act");
  await createCollection("labbis_defect_act", "DefectActId", {
    icon: "report_problem",
    note: "Mirror of LABBIS DefectAct (defect/maintenance acts)",
  });
  await createField("labbis_defect_act", "ActNumber", "string");
  await createField("labbis_defect_act", "ClerkId", "uuid");
  await createField("labbis_defect_act", "CreatedBy", "uuid");
  await createField("labbis_defect_act", "CreatedOn", "timestamp");
  await createField("labbis_defect_act", "DefectActDate", "timestamp");
  await createField("labbis_defect_act", "Description", "text");
  await createField("labbis_defect_act", "DocumentType", "uuid");
  await createField("labbis_defect_act", "ExternalNumber", "string");
  await createField("labbis_defect_act", "InspectionDate", "timestamp");
  await createField("labbis_defect_act", "ObjectId", "uuid");
  await createField("labbis_defect_act", "OwningBusinessUnitId", "uuid");
  await createField("labbis_defect_act", "OwningOrganizationId", "uuid");
  await createField("labbis_defect_act", "OwningSystemUserId", "uuid");
  await createField("labbis_defect_act", "Place", "string");
  await createField("labbis_defect_act", "Problem", "text");
  await createField("labbis_defect_act", "SystemosId", "uuid");
  await createField("labbis_defect_act", "SystGroupId", "uuid");
  await createField("labbis_defect_act", "Solution", "text");
  await createField("labbis_defect_act", "Status", "string", {}, {
    note: "Raw UUID referencing PickListValue",
  });
}

async function seedLabbisSystGroup() {
  console.log("\n[3/8] labbis_syst_group");
  await createCollection("labbis_syst_group", "SystGroupId", {
    icon: "category",
    note: "Mirror of LABBIS SystGroup (system groups)",
  });
  await createField("labbis_syst_group", "SystGroupName", "string");
  await createField("labbis_syst_group", "IsZone", "boolean");
  await createField("labbis_syst_group", "IsJobLocationMandatory", "boolean");
}

async function seedLabbisSystemos() {
  console.log("\n[4/8] labbis_systemos");
  await createCollection("labbis_systemos", "SystemosId", {
    icon: "settings",
    note: "Mirror of LABBIS Systemos (systems)",
  });
  await createField("labbis_systemos", "SystemosName", "string");
  await createField("labbis_systemos", "SystGroupId", "uuid");
}

async function seedLabbisClerk() {
  console.log("\n[5/8] labbis_clerk");
  await createCollection("labbis_clerk", "ClerkId", {
    icon: "people",
    note: "Mirror of LABBIS Clerk (staff)",
  });
  await createField("labbis_clerk", "ClerkFullName", "string");
  await createField("labbis_clerk", "IsBlocked", "boolean");
}

async function seedLabbisDefectActJob() {
  console.log("\n[6/8] labbis_defect_act_job");
  await createCollection("labbis_defect_act_job", "DefectActJobId", {
    icon: "construction",
    note: "Mirror of LABBIS DefectActJob (work items)",
  });
  await createField("labbis_defect_act_job", "Description", "string");
  await createField("labbis_defect_act_job", "Amount", "float");
  await createField("labbis_defect_act_job", "Price", "float");
  await createField("labbis_defect_act_job", "UoMId", "string", {}, {
    note: "Unit of measure UUID",
  });
  await createField("labbis_defect_act_job", "DefectActId", "uuid", {}, {
    note: "Parent DefectAct reference",
  });
}

async function seedLabbisDefectActMaterial() {
  console.log("\n[7/8] labbis_defect_act_material");
  await createCollection("labbis_defect_act_material", "DefectActMaterialId", {
    icon: "inventory_2",
    note: "Mirror of LABBIS DefectActMaterial (materials)",
  });
  await createField("labbis_defect_act_material", "Description", "string");
  await createField("labbis_defect_act_material", "Amount", "float");
  await createField("labbis_defect_act_material", "Price", "float");
  await createField("labbis_defect_act_material", "UoMId", "string", {}, {
    note: "Unit of measure UUID",
  });
  await createField("labbis_defect_act_material", "DefectActId", "uuid", {}, {
    note: "Parent DefectAct reference",
  });
}

async function seedLabbisNote() {
  console.log("\n[8/8] labbis_note");
  await createCollection("labbis_note", "NoteId", {
    icon: "comment",
    note: "Mirror of LABBIS Note (comments/timeline)",
  });
  await createField("labbis_note", "CreatedBy", "uuid");
  await createField("labbis_note", "CreatedByName", "string");
  await createField("labbis_note", "Text", "text");
  await createField("labbis_note", "CreatedOn", "timestamp");
  await createField("labbis_note", "BlobId", "uuid");
  await createField("labbis_note", "BlobName", "string");
  await createField("labbis_note", "DefectActId", "uuid", {}, {
    note: "Parent DefectAct reference",
  });
}

async function seedLabbisSystemUser() {
  console.log("\n[10/11] labbis_system_user");
  await createCollection("labbis_system_user", "SystemUserId", {
    icon: "people",
    note: "Mirror of LABBIS SystemUser (staff with email/phone)",
  });
  await createField("labbis_system_user", "LoginName", "string");
  await createField("labbis_system_user", "FullName", "string");
  await createField("labbis_system_user", "Email", "string");
  await createField("labbis_system_user", "OfficePhone", "string");
  await createField("labbis_system_user", "JobTitle", "string");
  await createField("labbis_system_user", "IsDisabled", "boolean");
  await createField("labbis_system_user", "Roles", "json", {}, { special: ["cast-json"] });
  await createField("labbis_system_user", "BusinessUnitId", "uuid");
  await createField("labbis_system_user", "DisabledReason", "string");
  await createField("labbis_system_user", "CreatedBy", "uuid");
  await createField("labbis_system_user", "CreatedOn", "timestamp");
  await createField("labbis_system_user", "ModifiedBy", "uuid");
  await createField("labbis_system_user", "ModifiedOn", "timestamp");
}

async function seedLabbisPickListValue() {
  console.log("\n[9/9] labbis_pick_list_value");
  await createCollection("labbis_pick_list_value", "GuidId", {
    icon: "list",
    note: "Mirror of LABBIS PickListValue (status labels, UoM names, etc.)",
  });
  await createField("labbis_pick_list_value", "Id", "integer");
  await createField("labbis_pick_list_value", "Title", "string");
  await createField("labbis_pick_list_value", "CharId", "string");
}

// ---------------------------------------------------------------------------
// App-level collections (not LABBIS mirrors)
// ---------------------------------------------------------------------------

async function seedNotifications() {
  console.log("\n[11/14] notifications");
  await createCollection("notifications", "id", {
    icon: "notifications",
    note: "App-generated notifications for users",
  });
  await createField("notifications", "user_id", "uuid", {}, {
    note: "Target user (FK to system_users)",
  });
  await createField("notifications", "type", "string", {}, {
    note: "status | comment | assignment | completion | postponed | warranty",
  });
  await createField("notifications", "title", "string");
  await createField("notifications", "description", "text");
  await createField("notifications", "reference", "string", {}, {
    note: "Defect act number for display",
  });
  await createField("notifications", "reference_id", "uuid", {}, {
    note: "Defect act ID for linking",
  });
  await createField("notifications", "is_read", "boolean", { default_value: false });
  await createField("notifications", "date_created", "timestamp");
}

async function seedUserObjectAssignments() {
  console.log("\n[12/14] user_object_assignments");
  await createCollection("user_object_assignments", "id", {
    icon: "link",
    note: "User-to-building assignments with roles",
  });
  await createField("user_object_assignments", "user_id", "uuid", {}, {
    note: "FK to labbis_system_user",
  });
  await createField("user_object_assignments", "object_id", "uuid", {}, {
    note: "FK to labbis_object",
  });
  await createField("user_object_assignments", "role", "string", {}, {
    note: "Owner | Manager | Technician | etc.",
  });
}

async function seedUserPreferences() {
  console.log("\n[13/14] user_preferences");
  await createCollection("user_preferences", "id", {
    icon: "tune",
    note: "User notification and app preferences",
  });
  await createField("user_preferences", "user_id", "uuid", {}, {
    note: "FK to labbis_system_user",
  });
  await createField("user_preferences", "monthly_summary", "boolean", { default_value: true });
  await createField("user_preferences", "defect_updates", "boolean", { default_value: true });
  await createField("user_preferences", "phone_notifications", "boolean", { default_value: false });
  await createField("user_preferences", "email_notifications", "boolean", { default_value: true });
}

async function addMissingFields() {
  console.log("\n[14/14] Adding missing fields to existing collections");
  await createField("labbis_defect_act", "Priority", "string", {}, {
    note: "High | Medium | Low – app-assigned priority",
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Seeding mirror collections at ${DIRECTUS_URL}...`);
  await login();
  console.log("Authenticated.");

  await seedLabbisObject();
  await seedLabbisSystGroup();
  await seedLabbisSystemos();
  await seedLabbisClerk();
  await seedLabbisDefectAct();
  await seedLabbisDefectActJob();
  await seedLabbisDefectActMaterial();
  await seedLabbisNote();
  await seedLabbisSystemUser();
  await seedLabbisPickListValue();
  await seedNotifications();
  await seedUserObjectAssignments();
  await seedUserPreferences();
  await addMissingFields();

  console.log("\nDone! All collections created successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
