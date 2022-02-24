import { type SupabaseClient } from "@supabase/supabase-js";
import { supabaseStrategy } from "./auth.server";
import { supabaseClient } from "./supabase";
import type {
  Institution,
  InstitutionWithMembers,
  Profile,
  ProfileWithInstitutions,
} from "./types";

const getSupabaseClient = async (request: Request): Promise<SupabaseClient> => {
  if (supabaseClient.auth.session() === null) {
    const session = await supabaseStrategy.checkSession(request);
    if (session) {
      supabaseClient.auth.setAuth(session.access_token);
    }
  }
  return supabaseClient;
};

export async function getProfileByUsername(request: Request, username: string) {
  const client = await getSupabaseClient(request);

  // TODO: error handling
  const { error, data } = await client
    .from<ProfileWithInstitutions>("profiles")
    .select(
      "*, institution_members ( institution_id, is_privileged, institutions (slug) )"
    )
    .eq("username", username)
    .single();
  return data;
}

export async function getProfileById(request: Request, id: string) {
  const client = await getSupabaseClient(request);

  // TODO: error handling
  const { error, data } = await client
    .from<Profile>("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function updateProfile(
  request: Request,
  options: {
    profileId: string;
    firstName: string;
    lastName: string;
    publicFields: string[];
  }
) {
  const { profileId, firstName, lastName, publicFields } = options;

  const client = await getSupabaseClient(request);

  // TODO: error handling
  return await client
    .from<Profile>("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      public_fields: publicFields,
    })
    .match({ id: profileId })
    .limit(1)
    .single();
}

export async function createInstitution(
  request: Request,
  options: { slug: string }
) {
  request;
  const client = await getSupabaseClient(request);

  // TODO: error handling
  const { error, data } = await client
    .from<Institution>("institutions")
    .insert([options])
    .limit(1)
    .single();

  if (error) {
    console.error(error);
  }

  return data;
}

export async function getInstitutionBySlug(
  request: Request,
  options: { slug: string }
) {
  const client = await getSupabaseClient(request);

  // TODO: error handling
  const { error, data } = await client
    .from<Institution>("institutions")
    .select("*")
    .eq("slug", options.slug)
    .single();
  return data;
}

export async function getInstitutionWithMembersBySlug(
  request: Request,
  options: { slug: string }
) {
  const client = await getSupabaseClient(request);

  // TODO: error handling
  const { error, data } = await client
    .from<InstitutionWithMembers>("institutions")
    .select(
      "*, institution_members ( member_id, is_privileged, profiles ( username ) )"
    )
    .eq("slug", options.slug)
    .single();
  return data;
}

export async function updateInstitution(
  request: Request,
  options: {
    institutionId: string;
    slug: string;
  }
) {
  const client = await getSupabaseClient(request);

  const { institutionId, slug } = options;

  // TODO: error handling
  return await client
    .from<Institution>("institutions")
    .update({ slug })
    .match({ id: institutionId })
    .limit(1)
    .single();
}

