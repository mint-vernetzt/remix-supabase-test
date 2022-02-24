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
  getProfileById,
  updateInstitution,
} from "~/api.server";
import { getUser } from "~/auth.server";
import AddUser from "~/components/AddUser";
import type { InstitutionWithMembers } from "~/types";

type LoaderData = {
  isAuthenticated: boolean;
  isPrivileged: boolean;
  isMember: boolean;
  institution: InstitutionWithMembers;
  username?: string;
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
  let username: string | undefined;

  if (user !== null) {
    isAuthenticated = true;
    isMember = institution.institution_members.some(
      (member) => member.member_id === user.id
    );
    isPrivileged = institution.institution_members.some(
      (member) => member.member_id === user.id && member.is_privileged === true
    );

    const profile = await getProfileById(request, user.id);
    if (profile !== null) {
      username = profile.username;
    }
  }

  return {
    isAuthenticated,
    isPrivileged,
    isMember,
    institution,
    username,
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

  if (data === null) {
    throw new Response("Internal Server Error.", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  return redirect(`/institutions/${data.slug}`);
};

function Institution() {
  const loaderData = useLoaderData<LoaderData>();
  const transition = useTransition();
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {loaderData.isAuthenticated ? (
            <>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
              {loaderData.username && (
                <li>
                  <Link to={`/profiles/${loaderData.username}`}>Profile</Link>
                </li>
              )}
            </>
          ) : (
            <>
              <li>
                <Link to="/signup">Sign up</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
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
      {loaderData.isPrivileged && loaderData.institution.slug !== undefined && (
        <AddUser slug={loaderData.institution.slug} />
      )}
    </>
  );
}

export default Institution;
