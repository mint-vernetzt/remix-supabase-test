import { type User } from "@supabase/supabase-js";
import { createCookieSessionStorage } from "remix";
import { Authenticator, AuthorizationError } from "remix-auth";
import { SupabaseStrategy } from "remix-auth-supabase";
import { supabaseClient, type Session } from "./supabase";

const sessionSecret = process.env.SESSION_SECRET;
if (sessionSecret === undefined) {
  throw new Error("Session secret must be set.");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "sb",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax", // TODO: check this setting
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true, // TODO: check this setting
  },
});

export const supabaseStrategy = new SupabaseStrategy(
  {
    supabaseClient,
    sessionStorage,
    sessionKey: "sb:session",
    sessionErrorKey: "sb:error",
  },
  async ({ req, supabaseClient }) => {
    const formData = await req.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (email === null) {
      throw new AuthorizationError("Email is required");
    }
    if (typeof email !== "string")
      throw new AuthorizationError("Email must be a string");

    if (password === null) {
      throw new AuthorizationError("Password is required");
    }
    if (typeof password !== "string") {
      throw new AuthorizationError("Password must be a string");
    }

    return supabaseClient.auth.api
      .signInWithEmail(email, password)
      .then(({ data, error }): Session => {
        if (error || data === null) {
          let message = "No user session found";
          if (error !== null && error.message) {
            message = error.message;
          }
          throw new AuthorizationError(message);
        }
        return data;
      });
  }
);

export const authenticator = new Authenticator<Session>(sessionStorage, {
  sessionKey: supabaseStrategy.sessionKey,
  sessionErrorKey: supabaseStrategy.sessionErrorKey,
});

authenticator.use(supabaseStrategy);

export type SignUpResult = {
  status: "success" | "error";
  errorMessage?: string;
};

export const signUp = async (args: {
  email: string;
  password: string;
  username: string;
}): Promise<SignUpResult> => {
  const { email, password, username } = args;

  // TODO: checkout how to know get info, if user still exists
  // see: https://supabase.com/docs/reference/javascript/auth-signup#notes
  const { user, session, error } = await supabaseClient.auth.signUp(
    { email, password },
    { data: { username, email } }
  );
  if (error) {
    let message = "Something went wrong during sign up";
    if (error.message) {
      message = error.message;
    }
    return {
      status: "error",
      errorMessage: message,
    };
  }

  return {
    status: "success",
  };
};

export const isUserAuthenticated = async (
  request: Request
): Promise<boolean> => {
  const session = await supabaseStrategy.checkSession(request);
  return session !== null;
};

export const getUser = async (request: Request): Promise<User | null> => {
  const session = await supabaseStrategy.checkSession(request);
  if (session !== null && session.user !== null) {
    return session.user;
  }
  return null;
};
