import { createDirectus, rest, authentication } from "@directus/sdk";

type ObjectItem = {
  id: string;
  code: string;
  description: string | null;
  full_address: string | null;
  labbis_id: string | null;
};

type SystemGroup = {
  id: string;
  name: string;
  labbis_id: string | null;
};

type System = {
  id: string;
  name: string;
  system_group_id: string | SystemGroup;
  labbis_id: string | null;
};

type SystemUser = {
  id: string;
  login_name: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  is_disabled: boolean;
  roles: string[];
  created_on: string | null;
  labbis_id: string | null;
};

type DefectAct = {
  id: string;
  act_number: string | null;
  defect_date: string;
  object_id: string | ObjectItem;
  problem: string | null;
  place: string | null;
  status: string;
  priority: string | null;
  description: string | null;
  solution: string | null;
  system_id: string | System;
  system_group_id: string | SystemGroup;
  labbis_id: string | null;
};

type DefectActJob = {
  id: string;
  defect_act_id: string | DefectAct;
  description: string | null;
  amount: number | null;
  price: number | null;
  unit: string | null;
  labbis_id: string | null;
};

type DefectActMaterial = {
  id: string;
  defect_act_id: string | DefectAct;
  description: string | null;
  amount: number | null;
  price: number | null;
  unit: string | null;
  labbis_id: string | null;
};

type Note = {
  id: string;
  defect_act_id: string | DefectAct;
  text: string | null;
  created_by_name: string | null;
  created_on: string | null;
  labbis_id: string | null;
};

type Notification = {
  id: string;
  user_id: string | SystemUser | null;
  type: "status" | "comment" | "assignment" | "completion" | "postponed" | "warranty";
  title: string;
  description: string;
  reference: string | null;
  defect_act_id: string | DefectAct | null;
  is_read: boolean;
  date_created: string | null;
};

type UserObjectAssignment = {
  id: string;
  user_id: string | SystemUser;
  object_id: string | ObjectItem;
  role: string;
};

export type Schema = {
  objects: ObjectItem[];
  system_groups: SystemGroup[];
  systems: System[];
  system_users: SystemUser[];
  defect_acts: DefectAct[];
  defect_act_jobs: DefectActJob[];
  defect_act_materials: DefectActMaterial[];
  notes: Note[];
  notifications: Notification[];
  user_object_assignments: UserObjectAssignment[];
};

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";

export function getDirectusClient() {
  return createDirectus<Schema>(DIRECTUS_URL)
    .with(rest())
    .with(authentication());
}
