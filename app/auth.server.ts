import { supabaseClient } from "./supabase";

export const signUp = async (args: { email: string; password: string }) => {
  // TODO: checkout how to know get info, if user still exists
  // see: https://supabase.com/docs/reference/javascript/auth-signup#notes
  const { user, session, error } = await supabaseClient.auth.signUp(args);
  if (error) {
    let message = "Something went wrong during sign up";
    if (error.message) {
      message = error.message;
    }
    throw new Error(message);
  }

  console.log(user, session);
};
