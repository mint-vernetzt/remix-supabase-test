import { definitions } from "./supabase-types";

export type Profile = definitions["profiles"];
export type ProfileWithInstitutions = Profile & {
  institution_members: {
    institution_id: string;
    is_privileged: boolean;
    institutions: { slug: string };
  }[];
};
export type Institution = definitions["institutions"];
export type InstitutionWithMembers = Institution & {
  institution_members: {
    member_id: string;
    is_privileged: boolean;
    profiles: { username: string };
  }[];
};
