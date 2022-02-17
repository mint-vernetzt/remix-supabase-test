import { Form, Link, LoaderFunction, useLoaderData } from "remix";
import { isUserAuthenticated } from "~/auth.server";

type LoaderData = {
  isAuthenticated?: boolean;
};

export const loader: LoaderFunction = async (args): Promise<LoaderData> => {
  const { request } = args;
  const isAuthenticated = await isUserAuthenticated(request);
  return {
    isAuthenticated,
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
            <li>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </li>
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
