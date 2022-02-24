import { ActionFunction, json } from "remix";
import {
  addMemberToInstitution,
  getInstitutionBySlug,
  getProfileByEmail,
  isStillMemberOfInstitution,
} from "~/api.server";

export const action: ActionFunction = async (args) => {
  const { request, params } = args;

  const formData = await request.formData();
  const email = formData.get("email");

  if (
    email === null ||
    typeof email !== "string" ||
    params.slug === undefined
  ) {
    return json("Bad Request.", { status: 400 });
  }

  const profile = await getProfileByEmail(request, email);
  const institution = await getInstitutionBySlug(request, {
    slug: params.slug,
  });

  if (profile === null || institution === null) {
    return json("Not found.", { status: 404 });
  }

  const isStillMember = await isStillMemberOfInstitution(request, {
    institutionId: institution.id,
    memberId: profile.id,
  });

  if (isStillMember) {
    return json("OK", { status: 200 });
  }

  const { data, error } = await addMemberToInstitution(request, {
    institutionId: institution.id,
    memberId: profile.id,
  });

  if (error) {
    console.error(error);
    return json("Internal Server Error.", { status: 500 });
  }

  return json("OK", { status: 200 });
};
