import { notFound } from "next/navigation";

/** Any unknown localized path renders the bilingual 404. */
export default function CatchAll() {
  notFound();
}
