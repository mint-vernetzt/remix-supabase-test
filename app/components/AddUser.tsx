import React from "react";
import { useFetcher, type Form } from "remix";

interface AddUserProps {
  slug: string;
}

function AddUser(props: AddUserProps) {
  const addUser = useFetcher();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    console.log(addUser.data);
    if (addUser.type === "done" && formRef.current !== null) {
      formRef.current.reset();
    }
  }, [addUser]);

  return (
    <addUser.Form
      ref={formRef}
      method="post"
      action={`/institutions/${props.slug}/add_user`}
    >
      <div>
        <label htmlFor="email">email:</label>
        <input type="email" id="email" name="email" />
      </div>
      <button type="submit" disabled={addUser.state === "submitting"}>
        {addUser.state === "submitting" ? "Adding User" : "Add User"}
      </button>
    </addUser.Form>
  );
}

export default AddUser;
