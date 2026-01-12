import { Role } from "./tokenization";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface Invitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  department: string | null;
  job_title: string | null;
  employment_type: string;
  manager_id: string | null;
  start_date: string | null;
  end_date: string | null;
  initial_roles: Role[];
  access_profile: string | null;
  justification: string | null;
  invited_by: string;
  invited_at: string;
  expires_at: string;
  accepted_at: string | null;
  status: InvitationStatus;
  created_at: string;
}

export const invitationStatusLabel: Record<InvitationStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export const invitationStatusColor: Record<InvitationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPTED: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};
