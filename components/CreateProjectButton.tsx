"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CreateProjectButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    

const { data: debugUid } = await supabase.rpc("debug_auth_uid");
console.log("user.id (client):", user?.id);
console.log("auth.uid() vu par Postgres:", debugUid);
    if (!user) return;

    const { data: project, error } = await supabase
      .from("projects")
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();

 
    if (error || !project) {
    console.error("Erreur création projet:", error?.message, error?.code, error?.details);
    setLoading(false);
    return;
    }
    // Ajoute automatiquement le créateur comme owner dans project_members
    await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: user.id,
      role: "owner",
    });

    // Crée 3 colonnes par défaut pour démarrer
    await supabase.from("columns").insert([
      { project_id: project.id, name: "À faire", position: 0 },
      { project_id: project.id, name: "En cours", position: 1 },
      { project_id: project.id, name: "Terminé", position: 2 },
    ]);

    setOpen(false);
    setName("");
    setLoading(false);
    router.push(`/projects/${project.id}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium"
      >
        Nouveau projet
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Nouveau projet</h2>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Nom du projet"
              className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40"
              >
                {loading ? "Création…" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}