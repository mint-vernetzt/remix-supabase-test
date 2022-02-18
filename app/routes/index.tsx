import { Form, Link, LoaderFunction, useLoaderData } from "remix";
import { getProfileById, type Profile } from "~/api.server";
import { getUser } from "~/auth.server";

type LoaderData = {
  isAuthenticated: boolean;
  profile: Profile | null;
};

export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  const { request } = args;

  let isAuthenticated = false;
  let profile = null;

  const user = await getUser(request);
  if (user !== null) {
    isAuthenticated = true;
    profile = await getProfileById(user.id);
  }

  return {
    isAuthenticated,
    profile,
  };
};

export default function Index() {
  const loaderData = useLoaderData<LoaderData>();

  return (
    <div>
      <h1>
        Welcome{" "}
        <span role="img" aria-label="waving hand">
          👋
        </span>
      </h1>
      <nav>
        <ul>
          {loaderData !== null && loaderData.isAuthenticated ? (
            <>
              {loaderData.profile !== null && (
                <li>
                  <Link to={`/profiles/${loaderData.profile?.username}`}>
                    Profile
                  </Link>
                </li>
              )}

              <li>
                <Form action="/logout" method="post">
                  <button type="submit" className="button">
                    Logout
                  </button>
                </Form>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}
