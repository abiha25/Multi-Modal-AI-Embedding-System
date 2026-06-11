import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import SearchPanel from "./components/SearchPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <header className="border-b border-gray-800 px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-sm font-bold">M</div>
        <h1 className="text-xl font-semibold tracking-tight">MultiModal Search</h1>
        <span className="ml-2 text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">POC</span>
      </header>

      <div className="px-8 pt-6 flex gap-4 border-b border-gray-800">
        {["search", "upload"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab === "search" ? "🔍 Semantic Search" : "📤 Index Content"}
          </button>
        ))}
      </div>

      <main className="px-8 py-8 max-w-4xl mx-auto">
        {activeTab === "search" ? <SearchPanel /> : <UploadPanel />}
      </main>
    </div>
  );
}