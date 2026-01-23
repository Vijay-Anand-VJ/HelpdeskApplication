import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Clock, XCircle, Loader, Send, MessageSquare, Paperclip, FileText } from "lucide-react";
import NoteItem from "../components/Ticket/noteItem"; 

export default function TicketDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState([]); 
  const [noteText, setNoteText] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch Ticket & Notes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = user.token;
        const headers = { Authorization: `Bearer ${token}` };

        const ticketRes = await fetch(`http://localhost:5000/api/tickets/${id}`, { headers });
        const ticketData = await ticketRes.json();
        if (!ticketRes.ok) throw new Error(ticketData.message);

        const notesRes = await fetch(`http://localhost:5000/api/tickets/${id}/notes`, { headers });
        const notesData = await notesRes.json();

        setTicket(ticketData);
        setNotes(notesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.token]);

  // 2. Submit New Note
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text: noteText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setNotes([...notes, data]);
      setNoteText(""); 
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Close Ticket
  const closeTicket = async () => {
    if(!window.confirm("Are you sure you want to close this ticket?")) return;
    try {
      await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ status: "Closed" }),
      });
      setTicket({ ...ticket, status: "Closed" });
      alert("Ticket Closed Successfully");
      navigate("/tickets");
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;
  if (error) return <div className="p-10 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up pb-24">
      <button onClick={() => navigate("/tickets")} className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition">
        <ArrowLeft size={20} className="mr-1" /> Back to Tickets
      </button>

      {/* TICKET DETAILS CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {ticket.status}
              </span>
              <span className="text-gray-400 text-xs">ID: {ticket._id}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
               {/* Created Date */}
               <span className="flex items-center gap-1">
                 <Clock size={14}/> Created: {new Date(ticket.createdAt).toLocaleString()}
               </span>
               
               {/* NEW: SLA DUE DATE */}
               {ticket.dueDate && (
                 <span className="flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                   <Clock size={14}/> Due: {new Date(ticket.dueDate).toLocaleString()}
                 </span>
               )}

               <span>• {ticket.category}</span>
               <span>• Priority: <span className={ticket.priority === 'High' || ticket.priority === 'Critical' ? 'text-red-600 font-bold' : ''}>{ticket.priority}</span></span>
            </div>
          </div>

          {ticket.status !== "Closed" && (
            <button onClick={closeTicket} className="text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition shadow-sm flex items-center gap-2">
              <XCircle size={16} /> Close Ticket
            </button>
          )}
        </div>

        <div className="p-6 bg-white">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          
          {/* NEW: ATTACHMENT SECTION */}
          {ticket.attachment && (
            <div className="mt-6 pt-6 border-t border-gray-100">
               <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                 <Paperclip size={16} /> Attachment
               </h4>
               
               <div className="flex flex-col items-start gap-3">
                 {/* View Button */}
                 <a 
                   href={`http://localhost:5000/${ticket.attachment}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-blue-600 text-sm font-medium bg-gray-50"
                 >
                   <FileText size={16} /> View Attached File
                 </a>

                 {/* Image Preview (Only if it's an image) */}
                 {ticket.attachment.match(/\.(jpg|jpeg|png|gif)$/i) && (
                   <div className="relative group">
                     <img 
                       src={`http://localhost:5000/${ticket.attachment}`} 
                       alt="Ticket Attachment" 
                       className="max-w-md w-full rounded-lg border border-gray-200 shadow-sm transition-transform hover:scale-[1.01]"
                     />
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* NOTES / CHAT SECTION */}
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare size={20} className="text-gray-400"/>
        <h3 className="text-lg font-bold text-gray-800">Activity Log</h3>
      </div>

      <div className="space-y-4 mb-8 flex flex-col">
        {notes.map((note) => (
          <NoteItem key={note._id} note={note} />
        ))}
        {notes.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No notes yet. Start the conversation!</p>}
      </div>

      {/* ADD NOTE FORM */}
      {ticket.status !== "Closed" && (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl z-10">
          <form onSubmit={handleSubmitNote} className="flex gap-3">
            <input 
              type="text" 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Type a reply..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-md">
              <Send size={18} /> Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}