import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData,
  useTransition,
} from "remix";
import { createInstitution, getProfileById } from "~/api.server";
import { getUser } from "~/auth.server";

type LoaderData = {
  isAuthenticated: boolean;
  username: string;
};

export const loader: LoaderFunction = async (args) => {
  const { request } = args;
  const user = await getUser(request);

  if (user === null) {
    throw new Response("Unauthorized.", {
      status: 401,
      statusText: "Unauthorized.",
    });
  }

  const profile = await getProfileById(request, user.id);

  if (profile == null) {
    throw new Response("Internal Server Error.", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }

  return { isAuthenticated: true, username: profile.username };
};

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const formData = await request.formData();
  const slug = formData.get("slug");
  if (slug === null || typeof slug !== "string") {
    throw new Response("Bad Request.", { status: 400 });
  }
  const data = await createInstitution(request, { slug });

  if (data !== null && data.slug !== undefined) {
    return redirect(`/institutions/${data.slug}`);
  }
  return new Response("Internal Server Error.", {
    status: 500,
    statusText: "Internal Server Error.",
  });
};

function Create() {
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
              <li>
                <Link to={`/profiles/${loaderData.username}`}>Profile</Link>
              </li>
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
      <Form method="post">
        <div>
          <label htmlFor="slug-input">slug:</label>
          <input type="text" id="slug-input" name="slug" />
        </div>
        <button type="submit" disabled={transition.state === "submitting"}>
          {transition.state === "submitting" ? "Creating" : "Create"}
        </button>
      </Form>
    </>
  );
}

export default Create;
