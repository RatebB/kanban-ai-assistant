"use client";

import { useState } from "react";

type Props = {
  projectId: string;
  isOwner: boolean;
};

export function InviteMemberForm({ projectId, isOwner }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "member">("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOwner) return null; // seul le owner voit ce formulaire

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: data.error });
    } else {
      setMessage({ type: "success", text: `${email} a été ajouté au projet.` });
      setEmail("");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleInvite} className="border border-gray-200 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Inviter un membre</h3>

      <div className="flex gap-2">
        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "owner" | "member")}
          className="border border-gray-200 rounded-lg p-2 text-sm"
        >
          <option value="member">Membre</option>
          <option value="owner">Propriétaire</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Inviter
        </button>
      </div>

      {message && (
        <p className={`text-xs mt-2 ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}