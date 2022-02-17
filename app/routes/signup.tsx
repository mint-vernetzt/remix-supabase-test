import {
  ActionFunction,
  Form,
  Link,
  redirect,
  useActionData,
  useCatch,
  useTransition,
} from "remix";
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

  if (typeof email !== "string" || typeof password !== "string") {
    // TODO: return wrong fields
    return {
      status: "error",
      errorMessage: "Please check your credentials",
    };
  }

  // TODO: handle errors
  const result = await signUp({ email, password });
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
