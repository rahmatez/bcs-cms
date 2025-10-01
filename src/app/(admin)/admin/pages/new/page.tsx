import { auth } from "@/lib/auth";
import { PageForm } from "../_components/page-form";

export default async function AdminPageCreate() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(role)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Halaman baru</h1>
        <p className="text-sm text-neutral-500">Susun konten statis untuk halaman publik.</p>
      </div>
      <PageForm />
    </div>
  );
}
