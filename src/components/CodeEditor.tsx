"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function CodeEditor() {
  const [activeTab, setActiveTab] = useState<"tsx" | "css">("tsx");
  const [copyStatus, setCopyStatus] = useState<"tsx" | "css" | null>(null);
  const { tsx, css } = useSessionStore((state) => state.generatedCode);

  const codeToShow = activeTab === "tsx" ? tsx : css;
  const language = activeTab === "tsx" ? "tsx" : "css";

  const handleCopy = (type: "tsx" | "css") => {
    const codeToCopy = type === "tsx" ? tsx : css;
    navigator.clipboard.writeText(codeToCopy).then(() => {
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  const handleDownload = () => {
    const zip = new JSZip();
    zip.file("component.tsx", tsx);
    zip.file("styles.css", css);
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "component.zip");
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#232526] to-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-800 max-w-2xl mx-auto my-8 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#232526] to-[#1e1e1e] rounded-t-2xl shadow-md border-b border-gray-700">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tsx")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 border border-transparent
              ${
                activeTab === "tsx"
                  ? "bg-white/10 text-white border-blue-500 shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }
            `}
          >
            component.tsx
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/60 border border-transparent
              ${
                activeTab === "css"
                  ? "bg-white/10 text-white border-blue-500 shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }
            `}
          >
            styles.css
          </button>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCopy("tsx")}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full shadow-md hover:from-blue-700 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">
              content_copy
            </span>
            {copyStatus === "tsx" ? "Copied!" : "Copy TSX"}
          </button>
          <button
            onClick={() => handleCopy("css")}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full shadow-md hover:from-green-700 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-green-400/60 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">
              content_copy
            </span>
            {copyStatus === "css" ? "Copied!" : "Copy CSS"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-full shadow-md hover:from-purple-700 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400/60 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-base">
              download
            </span>
            Download .zip
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-[#18181b] rounded-b-2xl border-t-0 border border-gray-800 shadow-inner">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            height: "100%",
            backgroundColor: "#18181b",
            borderRadius: "1rem",
            fontSize: "1rem",
            padding: 0,
          }}
        >
          {codeToShow}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
