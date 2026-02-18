type ContactSubmitInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
};

export async function submitContactForm(input: ContactSubmitInput) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
  }

  const response = await fetch(`${baseUrl}/contact/submit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone ?? "",
      message: input.message,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload as { message?: string }).message ?? "Failed to send message.";
    throw new Error(message);
  }

  return payload;
}
