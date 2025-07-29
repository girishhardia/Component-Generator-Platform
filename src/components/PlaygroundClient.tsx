"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/useSessionStore";

import Header from "./Header";
import ChatPanel from "./ChatPanel";
import PreviewWindow from "./PreviewWindow";
import CodeEditor from "./CodeEditor";

export default function PlaygroundClient() {
  const router = useRouter();
  const {
    token,
    setToken,
    activeSessionId,
    setActiveSessionId,
    chatHistory,
    generatedCode,
  } = useSessionStore();

  const isSaving = useRef(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    if (storedToken) {
      if (!token) setToken(storedToken);
    } else {
      router.replace("/login");
    }
  }, [token, setToken, router]);

  // --- AUTO-SAVE LOGIC ---
  useEffect(() => {
    // Define the async function inside the effect
    const saveSession = async () => {
      // FIX 1: Add a guard clause to ensure token exists before trying to save.
      if (!token || isSaving.current) return;

      // Don't save initial placeholder content
      if (generatedCode.tsx.startsWith("//") || chatHistory.length === 0)
        return;

      isSaving.current = true;
      const sessionData = {
        name: "My Project",
        chatHistory,
        generatedCode,
      };

      try {
        let currentSessionId = activeSessionId;

        // If it's a new session, create it first
        if (!currentSessionId) {
          const createRes = await fetch("/api/sessions/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name: sessionData.name }),
          });
          const newSession = await createRes.json();
          if (!newSession.success) throw new Error("Failed to create session");
          currentSessionId = newSession.data._id;
          if (currentSessionId) setActiveSessionId(currentSessionId); // Update store with new ID
        }

        // FIX 2: Add a guard clause to ensure we have a session ID before updating.
        if (currentSessionId) {
          await fetch(`/api/sessions/update/${currentSessionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(sessionData),
          });
        }
      } catch (error) {
        console.error("Failed to save session:", error);
      } finally {
        isSaving.current = false;
      }
    };

    // Call the async function
    saveSession();
  }, [generatedCode, chatHistory, token, activeSessionId, setActiveSessionId]);
  // --- END AUTO-SAVE LOGIC ---

  if (!token) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-1/4 flex flex-col border-r border-gray-700">
          <ChatPanel />
        </div>
        <div className="w-3/4 flex flex-col">
          <div className="flex-1 border-b border-gray-700 overflow-auto">
            <PreviewWindow />
          </div>
          <div className="flex-1 overflow-auto">
            <CodeEditor />
          </div>
        </div>
      </main>
    </div>
  );
}
