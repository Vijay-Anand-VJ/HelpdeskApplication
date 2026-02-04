import { Clock, User, Shield, Paperclip } from "lucide-react";
import { API_BASE_URL } from "../../config";

const NoteItem = ({ note, currentUser }) => {
  const isInternal = note.isInternal;
  const isSystem = note.user?.name === "SYSTEM"; // Adjusted from note.user === "SYSTEM" depending on population

  const BASE_URL = API_BASE_URL;

  // The original code had `if (!user) { return null; }`.
  // With `currentUser` passed as a prop, this check might need to be adapted
  // or removed depending on the component's new logic.
  // For now, I'm removing the `if (!user)` check as `user` is no longer defined.

  const isMe = note.user === currentUser._id; // Assuming currentUser has an _id
  const isStaff = note.isStaff; // True if sender is Agent/Admin
  // isInternal is already defined above from note.isInternal

  return (
    <div
      className={`flex flex-col p-5 rounded-2xl mb-4 max-w-[85%] shadow-sm border relative overflow-hidden transition-all ${isInternal
        ? "bg-amber-50 border-amber-200 self-center w-full max-w-[95%]" // internal notes center
        : isStaff
          ? "bg-emerald-50 border-emerald-100 self-start mr-auto rounded-tl-none" // Agent messages (Emerald, Left)
          : "bg-white border-slate-100 self-end ml-auto rounded-tr-none"    // Customer messages (White, Right)
        }`}
    >
      {/* INTERNAL BADGE */}
      {isInternal && (
        <div className="absolute top-0 right-0 bg-amber-200 text-amber-800 text-[9px] font-black uppercase px-2 py-1 rounded-bl-xl flex items-center gap-1">
          <Lock size={10} /> Internal Note
        </div>
      )}

      <div className="flex justify-between items-center mb-2 gap-4">
        <span className={`text-xs font-black uppercase tracking-wider ${isInternal ? "text-amber-800" :
          isStaff ? "text-[#064e3b]" : "text-slate-600"
          }`}>
          {isMe ? "You" : (isStaff ? "Support Agent" : "Customer")}
        </span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {note.createdAt ? new Date(note.createdAt).toLocaleString() : "Just now"}
        </span>
      </div>

      {/* TEXT CONTENT */}
      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isInternal ? 'text-amber-900' : 'text-slate-700'}`}>
        {note.text}
      </p>

      {/* ATTACHMENT DISPLAY */}
      {note.attachment && (
        <div className="mt-4 pt-4 border-t border-black/5">
          {note.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <div className="relative group">
              <img
                src={`${BASE_URL}/${note.attachment}`}
                alt="Attachment"
                className="rounded-xl border border-black/10 max-h-60 object-cover cursor-pointer hover:opacity-95 transition"
                onClick={() => window.open(`${BASE_URL}/${note.attachment}`, '_blank')}
              />
            </div>
          ) : (
            <a
              href={`${BASE_URL}/${note.attachment}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-white/50 border border-black/10 rounded-xl hover:bg-white transition group"
            >
              <div className="p-2 bg-emerald-100 text-[#064e3b] rounded-lg group-hover:scale-110 transition-transform"><FileText size={18} /></div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-700 truncate">View Attachment</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Click to open</p>
              </div>
            </a>
          )}
        </div>
      )}
    </div>
  );
}