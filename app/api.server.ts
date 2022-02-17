import { type User } from "@supabase/supabase-js";
import { supabaseClient } from "./supabase";

export type Profile = {
  id: string;
  username: string;
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
