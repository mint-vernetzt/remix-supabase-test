import { type User } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

export type Profile = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
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

export async function updateProfile(args: {
  profileId: string;
  firstName: string;
  lastName: string;
}) {
  const { profileId, firstName, lastName } = args;
  // TODO: error handling
  return await supabaseClient
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName })
    .match({ id: profileId });
}
