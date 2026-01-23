import { useAuth } from "../../context/AuthContext";

export default function NoteItem({ note }) {
  const { user } = useAuth();
  
  // Is this note from the current logged-in user?
  const isMe = note.user === user._id;
  
  // Is the author a Staff member? (We use the isStaff flag from backend)
  const isStaff = note.isStaff;

  return (
    <div 
      className={`flex flex-col p-4 rounded-xl mb-4 max-w-[85%] shadow-sm border ${
        isStaff 
          ? "bg-blue-50 border-blue-100 self-start mr-auto" // Staff messages (Blue, Left)
          : "bg-white border-gray-200 self-end ml-auto"    // User messages (White, Right)
      }`}
      style={{ alignSelf: isStaff ? 'flex-start' : 'flex-end' }} // Force alignment logic
    >
      <div className="flex justify-between items-center mb-1 gap-4">
        <span className={`text-xs font-bold uppercase ${isStaff ? "text-blue-600" : "text-gray-600"}`}>
          {isStaff ? "Support Agent" : "You"}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(note.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
    </div>
  );
}