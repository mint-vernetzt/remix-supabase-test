import {
  ActionFunction,
  Form,
  Link,
  useActionData,
  useTransition,
} from "remix";
import { getProfileByUsername } from "~/api.server";
import { signUp } from "~/auth.server";

type ActionData = {
  status: "success" | "error";
  errorMessage?: string;
};

export const action: ActionFunction = async (args): Promise<ActionData> => {
  const { request } = args;
  const formData = await request.clone().formData();

  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    // TODO: return wrong fields
    return {
      status: "error",
      errorMessage: "Please check your data",
    };
  }

  const test = username.replace(/[^A-Za-z0-9_]/gi, "");
  if (test !== username) {
    return {
      status: "error",
      errorMessage:
        "Username might contain only alphanumeric character and underscored",
    };
  }

  const profile = await getProfileByUsername(request, username);
  if (profile !== null) {
    return {
      status: "error",
      errorMessage: "Username still exists",
    };
  }

  // TODO: handle errors
  const result = await signUp({ email, password, username });
  return result;
};

function SignUp() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  return (
    <>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>
        <h1>
          Sign up{" "}
          <span role="img" aria-label="signing hand">
            ✍️
          </span>
        </h1>
        {actionData !== undefined && actionData.status === "success" && (
          <p>
            Yeah! Check your mails{" "}
            <span role="img" aria-label="partying face">
              🥳
            </span>
          </p>
        )}
        {(actionData === undefined || actionData.status !== "success") && (
          <Form method="post">
            <div>
              <label htmlFor="username-input">Username</label>
              <input type="text" id="username-input" name="username" required />
            </div>
            <div>
              <label htmlFor="email-input">Email</label>
              <input type="email" id="email-input" name="email" required />
            </div>
            <div>
              <label htmlFor="password-input">Password</label>
              <input
                type="password"
                id="password-input"
                name="password"
                required
              />
            </div>
            {actionData !== undefined && actionData.status === "error" && (
              <div>
                <p>{actionData.errorMessage}</p>
              </div>
            )}
            <button
              typeof="submit"
              disabled={transition.submission !== undefined}
            >
              {transition.submission !== undefined
                ? "signing up"
                : "sign me up"}
            </button>
          </Form>
        )}
      </div>
    </>
  );
}

export default SignUp;
