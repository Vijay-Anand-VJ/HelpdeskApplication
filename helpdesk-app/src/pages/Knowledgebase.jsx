import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Search, Plus, Loader, FileText } from "lucide-react";

export default function KnowledgeBase() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ title: "", category: "General", content: "" });

  // 1. Fetch Articles
  const fetchArticles = async () => {
    try {
      const res = await fetch("hhttps://helpdesk-yida.onrender.com/api/articles", {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setArticles(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // 2. Create Article
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch("https://helpdesk-yida.onrender.com/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      fetchArticles(); // Refresh list
    } catch (err) {
      alert("Failed to create article");
    }
  };

  // Filter Logic
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
        {/* Only show "Add Article" for Admins/Managers */}
        {["Super Admin", "Admin", "Manager"].includes(user.role) && (
          <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition">
            <Plus size={20} /> Add Article
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search for answers..." 
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <Loader className="animate-spin mx-auto" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{article.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">{article.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3">{article.content}</p>
            </div>
          ))}
          
          {filteredArticles.length === 0 && (
             <div className="col-span-full text-center py-10 text-gray-400">
               No articles found.
             </div>
          )}
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Write New Article</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Account">Account</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea required className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}