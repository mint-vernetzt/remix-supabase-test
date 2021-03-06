import { ActionFunction } from "remix";
import { authenticator } from "~/auth.server";

export const action: ActionFunction = async (args) => {
  const { request } = args;
  await authenticator.logout(request, { redirectTo: "/login" });
};
