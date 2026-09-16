"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteProjectButton({ projectId, isOwner }: { projectId: string; isOwner: boolean }) {
  const router = useRouter();

  if (!isOwner) return null;

  async function handleDelete() {
    if (!confirm("Supprimer ce projet et toutes ses données ? Cette action est irréversible.")) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      console.error("Erreur suppression projet:", error.message);
      return;
    }

    router.push("/");
  }

  return (
    <button
      onClick={handleDelete}
      className="text-[12px] text-[#5B5850] hover:text-red-600 transition-colors"
    >
      Supprimer le projet
    </button>
  );
}