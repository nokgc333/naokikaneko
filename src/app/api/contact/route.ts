import { handleContactRequest } from "@/lib/contact/handler";

export async function POST(request: Request) {
  return handleContactRequest(request);
}
