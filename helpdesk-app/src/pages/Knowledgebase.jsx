import { useState, useEffect } from "react";
import { Search, BookOpen, AlertCircle, FileText, ChevronRight, Loader } from "lucide-react";
import { API_BASE_URL } from "../config";

export default function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const API_URL = `${API_BASE_URL}/api/articles`;
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ title: "", category: "General", content: "" });



  // 1. Fetch Articles - Wrapped in useCallback for dependency safety
  const fetchArticles = useCallback(async () => {
    if (!user?.token) return; // SAFETY GUARD: Wait for token

    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok) setArticles(data);
    } catch (err) {
      console.error("KnowledgeBase Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // 2. Create Article
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Creation failed");

      setShowForm(false);
      fetchArticles(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredArticles = articles.filter(art =>
    art.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Knowledge Base</h1>
          <p className="text-gray-500">Find answers and help guides</p>
        </div>
        {/* Only show "Add Article" for privileged roles */}
        {user && ["Super Admin", "Admin", "Manager"].includes(user.role) && (
          <button onClick={() => setShowForm(true)} className="bg-[#064e3b] hover:bg-[#043327] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition active:scale-95 shadow-emerald-900/20">
            <Plus size={20} /> Add Article
          </button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for answers..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#064e3b] outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <div className="flex justify-center p-10"><Loader className="animate-spin text-[#064e3b]" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article._id}
              onClick={() => setSelectedArticle(article)}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-50 text-[#064e3b] rounded-lg group-hover:bg-[#064e3b] group-hover:text-white transition">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{article.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#064e3b] transition">{article.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{article.content}</p>
            </div>
          ))}

          {filteredArticles.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400 font-medium">
              No articles found matching your search.
            </div>
          )}
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Write New Article</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-[#064e3b] outline-none" onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
                <select className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#064e3b]" onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Account">Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Content</label>
                <textarea required className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-[#064e3b] outline-none resize-none" onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#064e3b] text-white rounded-lg hover:bg-[#043327] font-bold shadow-md transition active:scale-95">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ARTICLE MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-[#064e3b] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-100">
                  {selectedArticle.category}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition shadow-lg active:scale-95"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}