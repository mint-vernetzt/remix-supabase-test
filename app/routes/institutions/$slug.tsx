import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import {
  getInstitutionWithMembersBySlug,
  updateInstitution,
} from "~/api.server";
import { getUser } from "~/auth.server";
import type { InstitutionWithMembers } from "~/types";

type LoaderData = {
  isAuthenticated: boolean;
  isPrivileged: boolean;
  isMember: boolean;
  institution: InstitutionWithMembers;
};

export const loader: LoaderFunction = async (args) => {
  const { request, params } = args;

  const user = await getUser(request);

  if (params.slug === undefined) {
    return new Response("Bad Request.", { status: 400 });
  }

  const institution = await getInstitutionWithMembersBySlug(request, {
    slug: params.slug,
  });

  if (institution === null) {
    throw new Response("Not found.", { status: 404 });
  }

  let isPrivileged = false;
  let isMember = false;
  let isAuthenticated = false;

  if (user !== null) {
    isAuthenticated = true;
    isMember = institution.institution_members.some(
      (member) => member.member_id === user.id
    );
    isPrivileged = institution.institution_members.some(
      (member) => member.member_id === user.id && member.is_privileged === true
    );
  }

  return {
    isAuthenticated,
    isPrivileged,
    isMember,
    institution,
  };
};

export const action: ActionFunction = async (args) => {
  const { request } = args;

  const formData = await request.formData();
  const institutionId = formData.get("institution-id");
  const slug = formData.get("slug");

  if (
    institutionId === null ||
    typeof institutionId !== "string" ||
    slug === null ||
    typeof slug !== "string"
  ) {
    return new Response("Bad Request.", { status: 400 });
  }

  const { data, error } = await updateInstitution(request, {
    slug,
    institutionId,
  });

  if (error !== null) {
    return {
      status: "error",
      errorMessage: error.message,
    };
  }
  return redirect(`/institutions/${slug}`);
};

function Institution() {
  const loaderData = useLoaderData<LoaderData>();
  const transition = useTransition();
  return (
    <>
      {loaderData.isPrivileged ? (
        <>
          <h1>Institution Settings</h1>
          <Form method="post">
            <input
              name="institution-id"
              type="hidden"
              value={loaderData.institution.id}
            />
            <div>
              <label htmlFor="slug-input">slug:</label>
              <input
                type="text"
                id="slug-input"
                name="slug"
                defaultValue={loaderData.institution.slug}
              />
            </div>
            <button type="submit" disabled={transition.state === "submitting"}>
              {transition.state === "submitting" ? "Updating" : "Update"}
            </button>
          </Form>
        </>
      ) : (
        <>
          <h1>Institution Information</h1>
          <p>slug: {loaderData.institution.slug}</p>
        </>
      )}
      {(loaderData.isMember || loaderData.isAuthenticated) && (
        <>
          <h2>members</h2>
          <ul>
            {loaderData.institution.institution_members.map((member) => {
              const { profiles } = member;
              return (
                <li>
                  <Link to={`/profiles/${profiles.username}`}>
                    {profiles.username}
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

export default Institution;
