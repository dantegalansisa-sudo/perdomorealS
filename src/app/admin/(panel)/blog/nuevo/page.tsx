import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin/auth";
import { emptyPost } from "@/lib/admin/defaults";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "Nuevo artículo" };

export default async function NewPostPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Nuevo artículo" back={{ href: "/admin/blog", label: "Blog" }} />
      <PostForm id={null} initial={emptyPost()} />
    </>
  );
}
