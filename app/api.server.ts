import { type SupabaseClient } from "@supabase/supabase-js";
import { supabaseStrategy } from "./auth.server";
import { supabaseClient } from "./supabase";

export type Profile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
};

const getSupabaseClient = async (request: Request): Promise<SupabaseClient> => {
  if (supabaseClient.auth.session() === null) {
    const session = await supabaseStrategy.checkSession(request);
    if (session) {
      supabaseClient.auth.setAuth(session.access_token);
    }
  }
  return supabaseClient;
};

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  // TODO: error handling
  const { error, data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data as Profile | null;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  // TODO: error handling
  const { error, data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return data as Profile | null;
}

export async function updateProfile(
  request: Request,
  options: {
    profileId: string;
    firstName: string;
    lastName: string;
  }
) {
  const { profileId, firstName, lastName } = options;

  const client = await getSupabaseClient(request);

  // TODO: error handling
  return await client
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .match({ id: profileId });
}
