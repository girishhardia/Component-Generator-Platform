"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";

export default function ChatPanel() {
  const [prompt, setPrompt] = useState("");
  const {
    token,
    chatHistory,
    generatedCode,
    isLoadingAI,
    addChatMessage,
    setGeneratedCode,
    setAILoading,
    setError,
  } = useSessionStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoadingAI) return;

    setAILoading(true);
    setError(null);
    const newHistory = [...chatHistory, { role: "user", content: prompt }];
    addChatMessage({ role: "user", content: prompt });
    setPrompt("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatHistory: newHistory,
          currentCode: generatedCode, // Send current code for iterative edits
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate component");
      }

      // Add AI response to chat and update the code in the store
      addChatMessage({
        role: "model",
        content: "Here's the updated component:",
      });
      setGeneratedCode(data.data);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMsg);
      addChatMessage({
        role: "model",
        content: `Sorry, I ran into an error: ${errorMsg}`,
      });
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-400 text-sm">
            Start by describing a component. For example: &quot;Create a simple
            pricing card with a title, price, and a feature list.&quot;
          </div>
        )}
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoadingAI && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the component you want to build..."
          rows={3}
          className="w-full p-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoadingAI}
        />
        <button
          type="submit"
          disabled={isLoadingAI || !prompt.trim()}
          className="w-full mt-2 px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500"
        >
          {isLoadingAI
            ? "Generating..."
            : chatHistory.length === 0
            ? "Generate"
            : "Update"}
        </button>
      </form>
    </div>
  );
}
