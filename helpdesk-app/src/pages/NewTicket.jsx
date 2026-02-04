import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Send, AlertCircle, FileText, Tag, Paperclip, Loader } from "lucide-react";
import { API_BASE_URL } from "../config";

// Configuration
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const CATEGORIES = ["Technical", "Hardware", "Software", "Access", "General", "HR", "Finance"];

export default function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "Technical",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = `${API_BASE_URL}/api/tickets`;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return; // Safety Guard

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("priority", priority);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          // Browser sets multipart/form-data boundary automatically
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create ticket");

      navigate("/tickets");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering if user is null
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 transition font-medium">
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Ticket</h1>
          <p className="text-slate-500">Describe your issue and we'll get right on it.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              placeholder="e.g. VPN Connection Failed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Technical">Technical Issue</option>
                <option value="Hardware">Hardware / Equipment</option>
                <option value="Network">Network / Internet</option>
                <option value="Access">Access / Permissions</option>
                <option value="HR">HR / General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low - Not Urgent</option>
                <option value="Medium">Medium - Standard</option>
                <option value="High">High - Urgent</option>
                <option value="Critical">Critical - Blocker</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
              placeholder="Provide as much detail as possible..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Attachment (Optional)</label>
            <div className="relative">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${attachment ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className={`w-8 h-8 mb-2 ${attachment ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className="text-sm text-slate-600">
                    {attachment ? <span className="font-bold">{attachment.name}</span> : <span>Click to upload or drag and drop</span>}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Submit Ticket</>}
          </button>
        </form>
      </div>
    </div>
  );
}