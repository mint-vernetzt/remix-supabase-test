import { type SupabaseClient } from "@supabase/supabase-js";
import { supabaseStrategy } from "./auth.server";
import { supabaseClient } from "./supabase";
import type { Institution, Profile } from "./types";

const getSupabaseClient = async (request: Request): Promise<SupabaseClient> => {
  if (supabaseClient.auth.session() === null) {
    const session = await supabaseStrategy.checkSession(request);
    if (session) {
      supabaseClient.auth.setAuth(session.access_token);
    }
  }
  return supabaseClient;
};

export async function getProfileByUsername(username: string) {
  // TODO: error handling
  const { error, data } = await supabaseClient
    .from<Profile>("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data;
}

export async function getProfileById(id: string) {
  // TODO: error handling
  const { error, data } = await supabaseClient
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
    .match({ id: profileId });
}

export async function getInstitutionBySlug(slug: string) {
  // TODO: error handling
  const { error, data } = await supabaseClient
    .from<Institution>("institutions")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}
