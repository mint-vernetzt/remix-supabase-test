import { Form, Link } from "remix";

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
