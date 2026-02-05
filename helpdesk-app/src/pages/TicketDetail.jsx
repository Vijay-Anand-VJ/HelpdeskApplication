import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Clock, XCircle, Loader, Send, MessageSquare, Paperclip, FileText, AlertCircle, UserPlus, Lock, ImageIcon, X } from "lucide-react";
import NoteItem from "../components/Ticket/noteItem";
// Import our centralized Base URL
import { API_BASE_URL } from "../config";

export default function TicketDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NOTE COMPOSER STATE
  const [attachment, setAttachment] = useState(null);
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;

      try {
        const headers = { Authorization: `Bearer ${user.token}` };

        // 1. Fetch Ticket Data
        const ticketRes = await fetch(`${BASE_URL}/api/tickets/${id}`, { headers });
        const ticketData = await ticketRes.json();
        if (!ticketRes.ok) throw new Error(ticketData.message);

        // 2. Fetch Notes
        const notesRes = await fetch(`${BASE_URL}/api/tickets/${id}/notes`, { headers });
        const notesData = await notesRes.json();

        // 3. Fetch Agents (Only for authorized roles)
        if (["Super Admin", "Admin", "Manager"].includes(user.role)) {
          const usersRes = await fetch(`${BASE_URL}/api/users`, { headers });
          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) {
            const staffList = usersData.filter(u => ["Agent", "Admin", "Manager"].includes(u.role));
            setAgents(staffList);
          }
        }

        setTicket(ticketData);
        setNotes(notesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user?.token, user.role]);

  const updateStatus = async (updateData) => {
    try {
      const payload = typeof updateData === 'string' ? { status: updateData } : updateData;
      const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTicket(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if ((!noteText.trim() && !attachment) || !user?.token) return;

    try {
      // USE FORMDATA FOR FILE UPLOAD
      const formData = new FormData();
      formData.append("text", noteText);
      if (attachment) {
        formData.append("attachment", attachment);
      }
      // Explicitly append boolean as string
      if (isInternal) {
        formData.append("isInternal", "true");
      }

      const response = await fetch(`${BASE_URL}/api/tickets/${id}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`, // Content-Type is auto-set by FormData
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setNotes([...notes, data]);
      setNoteText("");
      setAttachment(null);
      setIsInternal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const closeTicket = async () => {
    if (!window.confirm("Are you sure you want to close this ticket?")) return;
    await updateStatus("Closed");
    navigate("/tickets");
  };

  if (!user) return null;
  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin text-[#064e3b]" /></div>;
  if (error) return <div className="p-10 text-rose-600 flex items-center gap-2"><AlertCircle /> {error}</div>;

  const isStaff = ["Super Admin", "Admin", "Manager", "Agent"].includes(user.role);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up pb-32">
      <button onClick={() => navigate("/tickets")} className="flex items-center text-slate-500 hover:text-[#064e3b] mb-6 transition font-bold text-sm">
        <ArrowLeft size={18} className="mr-1" /> Back to Tickets
      </button>

      {/* TICKET CARD */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {user.role !== "Customer" ? (
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  className="bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 outline-none focus:ring-2 focus:ring-[#064e3b] cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              ) : (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                  ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                  {ticket.status}
                </span>
              )}
              <span className="text-slate-400 text-xs font-mono">#{ticket._id.slice(-6)}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight flex items-center gap-3">
              {ticket.title}
              {new Date(ticket.dueDate) < new Date() && ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded-lg uppercase font-black tracking-widest shadow-lg shadow-rose-200">
                  SLA Breached
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider mb-4">
              <span className="flex items-center gap-1">
                <Clock size={14} className="text-[#064e3b]" /> {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
              {ticket.dueDate && (
                <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                  <Clock size={14} /> Due: {new Date(ticket.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-600 border border-slate-200">{ticket.category}</span>
              <span className={`${ticket.priority === 'High' || ticket.priority === 'Critical' ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100' : 'text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200'}`}>
                {ticket.priority}
              </span>
            </div>

            {/* ASSIGNMENT UI */}
            {["Super Admin", "Admin", "Manager"].includes(user.role) ? (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit mt-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserPlus size={16} />
                </div>
                <div className="flex flex-col pr-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Assigned Agent</span>
                  <select
                    className="text-xs font-bold text-[#064e3b] outline-none cursor-pointer bg-transparent"
                    value={ticket.assignedTo?._id || ""}
                    onChange={(e) => updateStatus({ assignedTo: e.target.value })}
                  >
                    <option value="">Select Staff</option>
                    {agents.map(agent => (
                      <option key={agent._id} value={agent._id}>{agent.name} ({agent.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              ticket.assignedTo && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-4 bg-slate-50 p-2 rounded-lg w-fit border border-slate-100">
                  <div className="w-6 h-6 rounded bg-[#064e3b] text-white flex items-center justify-center">
                    <UserPlus size={12} />
                  </div>
                  <span>Agent: <span className="text-slate-900">{ticket.assignedTo.name}</span></span>
                </div>
              )
            )}
          </div>

          {ticket.status !== "Closed" && (
            <button onClick={closeTicket} className="text-rose-600 bg-white border border-rose-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-50 transition shadow-sm flex items-center gap-2 active:scale-95 group">
              <XCircle size={16} className="group-hover:rotate-90 transition-transform" /> Close Ticket
            </button>
          )}
        </div>

        <div className="p-8 bg-white/50">
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

          {ticket.attachment && (
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Paperclip size={14} /> Description Attachment
              </h4>
              <div className="flex flex-col items-start gap-4">
                <a
                  href={`${BASE_URL}/${ticket.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-[#064e3b] text-sm font-bold shadow-sm"
                >
                  <FileText size={18} /> View Resource
                </a>
                {ticket.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                  <img
                    src={`${BASE_URL}/${ticket.attachment}`}
                    alt="Attachment Preview"
                    className="max-w-full md:max-w-lg rounded-2xl border border-slate-200 shadow-md"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <div className="p-2 bg-emerald-100 text-[#064e3b] rounded-lg">
          <MessageSquare size={20} />
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Activity Stream</h3>
      </div>

      {/* NOTES LIST */}
      <div className="space-y-4 mb-32 flex flex-col">
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm font-bold italic">No activity yet. Start the conversation!</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteItem key={note._id} note={note} currentUser={user} />
          ))
        )}
      </div>

      {/* COMPOSER */}
      {ticket.status !== "Closed" && (
        <div className="bg-white p-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-4xl z-30">

          {/* Internal Checkbox - STAFF ONLY */}
          {isStaff && (
            <div className="flex items-center gap-2 mb-3 pl-1">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isInternal ? 'bg-amber-400 border-amber-500' : 'bg-white border-slate-300 group-hover:border-amber-400'
                  }`}>
                  {isInternal && <Lock size={12} className="text-amber-900" />}
                </div>
                <input type="checkbox" className="hidden" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
                <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${isInternal ? 'text-amber-600' : 'text-slate-400'}`}>
                  Internal Note (Hidden from Customer)
                </span>
              </label>
            </div>
          )}

          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-3 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 w-fit">
              <div className="p-2 bg-white rounded-lg border border-slate-100"><ImageIcon size={16} className="text-[#064e3b]" /></div>
              <span className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="p-1 hover:bg-slate-200 rounded-full transition"><X size={14} /></button>
            </div>
          )}

          <form onSubmit={handleSubmitNote} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 pr-12 focus:ring-2 outline-none text-sm font-medium transition-all resize-none min-h-[50px] max-h-[120px] ${isInternal ? 'focus:ring-amber-400 border-amber-100 bg-amber-50/30' : 'focus:ring-[#064e3b] border-slate-200 focus:bg-white'
                  }`}
                placeholder={isInternal ? "Type an internal note..." : "Post an update or reply..."}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={1}
              />

              {/* File Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-3 text-slate-400 hover:text-[#064e3b] transition-colors p-1"
                title="Attach File"
              >
                <Paperclip size={18} />
              </button>
            </div>

            <button
              type="submit"
              disabled={(!noteText.trim() && !attachment)}
              className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${isInternal
                ? 'bg-amber-400 hover:bg-amber-500 text-amber-900 shadow-amber-200'
                : 'bg-[#064e3b] hover:bg-[#043327] text-white shadow-emerald-900/20'
                }`}
            >
              <Send size={18} /> {isInternal ? 'Save' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}