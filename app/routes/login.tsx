import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  useLoaderData,
  useTransition,
} from "remix";
import {
  authenticator,
  sessionStorage,
  supabaseStrategy,
} from "../auth.server";

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const redirectTo = "/";

  await authenticator.authenticate("sb", request, {
    successRedirect: redirectTo,
    failureRedirect: "/login",
  });
};

type LoaderData = {
  error: { message: string } | null;
};

export const loader: LoaderFunction = async (args) => {
  const { request } = args;

  await supabaseStrategy.checkSession(request, {
    successRedirect: "/",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const error = session.get(
    authenticator.sessionErrorKey
  ) as LoaderData["error"];

  return json<LoaderData>({ error });
};

function Login() {
  const transition = useTransition();
  const { error } = useLoaderData<LoaderData>();

  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/signup">Sign up</Link>
          </li>
        </ul>
      </nav>
      <h1>
        Login{" "}
        <span role="img" aria-label="closed lock with key">
          🔐
        </span>
      </h1>
      <Form method="post">
        {error && <div>{error.message}</div>}
        <div>
          <label htmlFor="email-input">Email</label>
          <input type="email" id="email-input" name="email" required />
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input type="password" id="password-input" name="password" required />
        </div>
        <button typeof="submit" disabled={transition.submission !== undefined}>
          {transition.submission !== undefined ? "logging in" : "log me in"}
        </button>
      </Form>
    </div>
  );
}

export default Login;
