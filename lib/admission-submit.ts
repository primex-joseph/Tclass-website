import { getCookieValue } from "@/lib/api-client";

type AdmissionSubmitInput = {
  fullName: string;
  age: number;
  gender: string;
  primaryCourse: string;
  secondaryCourse?: string | null;
  email: string;
  applicationType?: "admission" | "vocational";
  validIdType?: string | null;
  facebookAccount?: string | null;
  contactNo?: string | null;
  enrollmentPurposes?: string[];
  enrollmentPurposeOthers?: string | null;
  formData: Record<string, unknown>;
  idPictureFile?: File | null;
  oneByOnePictureFile?: File | null;
  rightThumbmarkFile?: File | null;
  birthCertificateFile?: File | null;
  validIdImageFile?: File | null;
};

export async function submitAdmissionForm(input: AdmissionSubmitInput) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  const token = getCookieValue("tclass_token");
  const body = new FormData();
  body.append("full_name", input.fullName);
  body.append("age", String(input.age));
  body.append("gender", input.gender);
  body.append("primary_course", input.primaryCourse);
  body.append("secondary_course", input.secondaryCourse ?? "");
  body.append("email", input.email);
  body.append("application_type", input.applicationType ?? "admission");
  body.append("valid_id_type", input.validIdType ?? "");
  body.append("facebook_account", input.facebookAccount ?? "");
  body.append("contact_no", input.contactNo ?? "");
  if (input.enrollmentPurposes?.length) {
    input.enrollmentPurposes.forEach((purpose) => {
      body.append("enrollment_purposes[]", purpose);
    });
  }
  body.append("enrollment_purpose_others", input.enrollmentPurposeOthers ?? "");
  body.append("form_data", JSON.stringify(input.formData));

  if (input.idPictureFile) body.append("id_picture", input.idPictureFile);
  if (input.oneByOnePictureFile) body.append("one_by_one_picture", input.oneByOnePictureFile);
  if (input.rightThumbmarkFile) body.append("right_thumbmark", input.rightThumbmarkFile);
  if (input.birthCertificateFile) body.append("birth_certificate", input.birthCertificateFile);
  if (input.validIdImageFile) body.append("valid_id_image", input.validIdImageFile);

  const response = await fetch(`${baseUrl}/admission/submit`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as { message?: string }).message ?? "Admission submission failed.";
    throw new Error(message);
  }

  return payload;
}
