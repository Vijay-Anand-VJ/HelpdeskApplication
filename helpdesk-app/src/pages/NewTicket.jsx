import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Save, ArrowLeft, Loader, AlertCircle, Paperclip } from "lucide-react";

export default function NewTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("Medium");
  const [attachment, setAttachment] = useState(null); // State for the file

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Create FormData object (Required for sending files)
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("priority", priority);
    if (attachment) {
      formData.append("attachment", attachment); // Append the file
    }

    try {
      const response = await fetch("https://helpdesk-yida.onrender.com/api/tickets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          // NOTE: Do NOT set Content-Type here. Browser sets it to multipart/form-data automatically.
        },
        body: formData, // Send the FormData object
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      navigate("/tickets");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 animate-fade-in-up">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition">
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Ticket</h1>
        <p className="text-gray-500 mb-6">Please describe your issue in detail</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. VPN Connection Failed"
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              >
                <option value="Technical">Technical Issue</option>
                <option value="Hardware">Hardware / Equipment</option>
                <option value="Network">Network / Internet</option>
                <option value="Access">Access / Permissions</option>
                <option value="HR">HR / General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white"
              >
                <option value="Low">Low - Not Urgent</option>
                <option value="Medium">Medium - Standard</option>
                <option value="High">High - Urgent</option>
                <option value="Critical">Critical - Blocker</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 h-32"
              placeholder="Describe what happened..."
              required
            ></textarea>
          </div>

          {/* FILE UPLOAD INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {attachment ? (
                      <span className="font-bold text-blue-600">{attachment.name}</span>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG, JPG or PDF (MAX. 5MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setAttachment(e.target.files[0])} 
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Submit Ticket</>}
          </button>

        </form>
      </div>
    </div>
  );
}