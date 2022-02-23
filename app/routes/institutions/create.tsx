import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useTransition,
} from "remix";
import { createInstitution } from "~/api.server";
import { getUser } from "~/auth.server";

export const loader: LoaderFunction = async (args) => {
  const { request } = args;
  const user = await getUser(request);

  if (user === null) {
    throw new Response("Unauthorized.", {
      status: 401,
      statusText: "Unauthorized.",
    });
  }
  return new Response("OK", { status: 200, statusText: "OK" });
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
  const transition = useTransition();
  return (
    <Form method="post">
      <div>
        <label htmlFor="slug-input">slug:</label>
        <input type="text" id="slug-input" name="slug" />
      </div>
      <button type="submit" disabled={transition.state === "submitting"}>
        {transition.state === "submitting" ? "Creating" : "Create"}
      </button>
    </Form>
  );
}

export default Create;
