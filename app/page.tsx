import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CreateProjectButton } from "@/components/CreateProjectButton";

export default async function Home() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data: memberships } = await supabase
    .from("project_members")
    .select("role, projects(id, name, created_at)")
    .eq("user_id", user!.id);

  const projects = (memberships ?? []).map((m) => ({
    ...(m.projects as unknown as { id: string; name: string; created_at: string }),
    role: m.role,
  }));

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Mes projets</h1>
        <CreateProjectButton />
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun projet pour l'instant. Crée-en un pour commencer.
        </p>
      ) : (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-900">{project.name}</span>
              <span className="text-xs text-gray-400 uppercase">{project.role}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}