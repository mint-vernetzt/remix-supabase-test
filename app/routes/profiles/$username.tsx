import React from "react";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import { getProfileByUsername, updateProfile } from "~/api.server";
import { getUser } from "~/auth.server";
import type { Profile, ProfileWithInstitutions } from "~/types";

type LoaderData = {
  isOwner: boolean;
  isAuthenticated: boolean;
  profile: ProfileWithInstitutions;
};

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args;

  if (params.username) {
    const profile = await getProfileByUsername(request, params.username);
    if (profile === null) {
      throw new Response("Not found.", { status: 404 });
    }
    const user = await getUser(request);
    const isAuthenticated = user !== null;
    const isOwner = user !== null && user.id === profile.id;

    return {
      isOwner,
      isAuthenticated,
      profile: { ...profile, email: profile.email },
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
  const publicFieldsValue = formData.get("public-fields");

  if (
    firstName === null &&
    lastName === null &&
    profileId === null &&
    publicFieldsValue === null
  ) {
    throw new Response("Bad Request.", { status: 400 });
  }

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof profileId !== "string" ||
    typeof publicFieldsValue !== "string"
  ) {
    throw new Response("Bad Request.", { status: 400 });
  }

  const publicFields = publicFieldsValue.split(",");

  const result = await updateProfile(request, {
    profileId,
    firstName,
    lastName,
    publicFields,
  });

  const { data, error } = result;

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

enum PublicFieldsReducerActionType {
  Add = "add",
  Remove = "remove",
}

const publicFieldsReducer = (
  state: string[],
  action: { type: PublicFieldsReducerActionType; payload: string }
) => {
  const { type, payload } = action;
  switch (type) {
    case PublicFieldsReducerActionType.Add:
      return state.concat([payload]);
    case PublicFieldsReducerActionType.Remove:
      return state.filter((field) => field !== payload);
  }
};

function Profile() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const transition = useTransition();
  const [hasChanged, setHasChanged] = React.useState(false);
  const [publicFields, dispatchPublicFields] = React.useReducer(
    publicFieldsReducer,
    (loaderData.profile.public_fields as string[]) || []
  );

  // deactivate submit button after submit
  React.useEffect(() => {
    if (transition.state === "idle") {
      setHasChanged(false);
    }
  }, [transition.state]);

  const handleChange = () => {
    setHasChanged(true);
  };

  return (
    <>
      {loaderData.isOwner && (
        <>
          <h1>Profile Settings</h1>
          <Form method="post" onChange={handleChange}>
            <input
              name="profile-id"
              type="hidden"
              value={loaderData.profile.id}
            />
            <input name="public-fields" type="hidden" value={publicFields} />
            <div>
              <label htmlFor="first-name-input">First name</label>
              <input
                type="text"
                id="first-name-input"
                name="first-name"
                defaultValue={loaderData.profile.first_name || ""}
              />
              <input
                type="checkbox"
                id="is-first-name-public"
                aria-label="Is first name visible in public profile?"
                checked={publicFields.includes("first_name")}
                onChange={(event) => {
                  const type = event.target.checked
                    ? PublicFieldsReducerActionType.Add
                    : PublicFieldsReducerActionType.Remove;
                  dispatchPublicFields({
                    type,
                    payload: "first_name",
                  });
                }}
              />
              <label htmlFor="is-first-name-public">public</label>
            </div>
            <div>
              <label htmlFor="last-name-input">Last name</label>
              <input
                type="text"
                id="last-name-input"
                name="last-name"
                defaultValue={loaderData.profile.last_name || ""}
              />
              <input
                type="checkbox"
                id="is-last-name-public"
                aria-label="Is last name visible in public profile?"
                checked={publicFields.includes("last_name")}
                onChange={(event) => {
                  const type = event.target.checked
                    ? PublicFieldsReducerActionType.Add
                    : PublicFieldsReducerActionType.Remove;
                  dispatchPublicFields({
                    type,
                    payload: "last_name",
                  });
                }}
              />
              <label htmlFor="is-last-name-public">public</label>
            </div>
            <button
              type="submit"
              disabled={
                hasChanged === false || transition.state === "submitting"
              }
            >
              {transition.state === "submitting" ? "Updating" : "Update"}
            </button>
          </Form>
        </>
      )}
      {actionData !== undefined && actionData.status === "error" && (
        <p>{actionData.errorMessage}</p>
      )}
      <div>
        <p>Username: {loaderData.profile.username}</p>
        <p>Email: {loaderData.profile.email}</p>
        {!loaderData.isOwner && (
          <>
            {loaderData.profile.public_fields !== null &&
            loaderData.profile.public_fields?.includes("first_name") &&
            loaderData.profile.first_name !== null &&
            loaderData.profile.first_name !== "" ? (
              <p>First name: {loaderData.profile.first_name}</p>
            ) : null}
            {loaderData.profile.public_fields !== null &&
            loaderData.profile.public_fields?.includes("last_name") &&
            loaderData.profile.last_name !== null &&
            loaderData.profile.last_name !== "" ? (
              <p>Last name: {loaderData.profile.last_name}</p>
            ) : null}
          </>
        )}
      </div>
      {loaderData.isAuthenticated && (
        <>
          <h2>Institutions</h2>
          <ul>
            {loaderData.profile.institution_members.map((member) => {
              const { institutions } = member;
              return (
                <li>
                  <Link to={`/institutions/${institutions.slug}`}>
                    {institutions.slug}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

export default Profile;
