import React from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { getProfileByUsername, Profile, updateProfile } from "~/api.server";
import { getUser } from "~/auth.server";

type LoaderData = {
  isOwner: boolean;
  profile: Profile & { email: string };
};

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args;

  if (params.username) {
    const profile = await getProfileByUsername(params.username);
    if (profile === null) {
      throw new Response("Not found.", { status: 404 });
    }
    const user = await getUser(request);
    if (user === null) {
      throw new Response("Forbidden.", { status: 403 });
    }
    const isOwner = user.id === profile.id;

    return {
      isOwner,
      profile: { ...profile, email: user.email },
    };
  }

  return redirect("/");
};

type ActionData = {
  status: "success" | "error";
  errorMessage?: string;
};

export const action: ActionFunction = async (args): Promise<ActionData> => {
  const { request } = args;

  const formData = await request.formData();
  const firstName = formData.get("first-name");
  const lastName = formData.get("last-name");
  const profileId = formData.get("profile-id");

  if (firstName === null && lastName === null && profileId === null) {
    throw new Response("Bad Request.", { status: 400 });
  }

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof profileId !== "string"
  ) {
    throw new Response("Bad Request.", { status: 400 });
  }

  console.log({ firstName, lastName, profileId });

  const result = await updateProfile({
    firstName,
    lastName,
    profileId,
  });
  console.log(result);
  const { data, error } = result;
  console.log(data);
  if (error !== null) {
    return {
      status: "error",
      errorMessage: error.message,
    };
  }
  return {
    status: "success",
  };
};

function Profile() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const [hasChanged, setHasChanged] = React.useState(false);

  const handleChange = () => {
    setHasChanged(true);
  };

  return (
    <>
      {loaderData.isOwner && (
        <Form method="post" onChange={handleChange}>
          <input
            name="profile-id"
            type="hidden"
            value={loaderData.profile.id}
          />
          <div>
            <label htmlFor="first-name-input">First name</label>
            <input
              type="text"
              id="first-name-input"
              name="first-name"
              defaultValue={loaderData.profile.first_name || ""}
            />
          </div>
          <div>
            <label htmlFor="last-name-input">Last name</label>
            <input
              type="text"
              id="last-name-input"
              name="last-name"
              defaultValue={loaderData.profile.last_name || ""}
            />
          </div>
          <button
            type="submit"
            disabled={hasChanged === false || transition.state === "submitting"}
          >
            {transition.state === "submitting" ? "Updating" : "Update"}
          </button>
        </Form>
      )}
      {actionData !== undefined && actionData.status === "error" && (
        <p>{actionData.errorMessage}</p>
      )}
      <div>
        <p>Username: {loaderData.profile.username}</p>
        <p>Email: {loaderData.profile.email}</p>
      </div>
    </>
  );
}

export default Profile;
