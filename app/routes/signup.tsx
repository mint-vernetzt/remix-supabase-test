import { ActionFunction, Form, Link, redirect, useCatch } from "remix";
import { signUp } from "~/auth.server";

export const action: ActionFunction = async (args) => {
  const { request } = args;
  const formData = await request.clone().formData();

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    // TODO: return wrong fields
    return;
  }

  // TODO: handle errors
  await signUp({ email, password });

  return redirect("/");
};

function SignUp() {
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
          <button typeof="submit">sign me up</button>
        </Form>
      </div>
    </>
  );
}

export default SignUp;
