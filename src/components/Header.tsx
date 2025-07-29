'use client';

import { useSessionStore } from "@/store/useSessionStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionInfo = {
  _id: string;
  name: string;
  createdAt: string;
};

export default function Header() {
  const { token, setToken, startNewSession, loadSession, activeSessionId } = useSessionStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/sessions/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };
    fetchSessions();
  }, [token, activeSessionId]); // Refetch when a new session is created

  const handleLogout = () => {
    setToken(null);
    startNewSession(); // Clear the state on logout
    router.push('/login');
  };

  const handleSessionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessionId = e.target.value;
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sessions/details/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        loadSession(data.data); // Hydrate the store with the selected session
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
      <h1 className="text-xl font-bold">🚀 AI Component Gen</h1>
      <div className="flex items-center gap-4">
        <select 
          onChange={handleSessionChange} 
          value={activeSessionId || ""}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{isLoading ? 'Loading...' : 'Select a Project'}</option>
          {sessions.map(session => (
            <option key={session._id} value={session._id}>
              {session.name} - {new Date(session.createdAt).toLocaleDateString()}
            </option>
          ))}
        </select>

        <button 
          onClick={() => startNewSession()}
          className="px-3 py-1 text-sm bg-green-600 rounded hover:bg-green-700"
        >
          New Project
        </button>
        <button 
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  );
}