import { Link } from "remix";

export default function Index() {
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
          <li>
            <Link to="/signup">Sign up</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
