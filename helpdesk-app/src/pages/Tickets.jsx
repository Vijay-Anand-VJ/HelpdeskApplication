import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, AlertCircle, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. FETCH TICKETS FROM BACKEND API
  const fetchTickets = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tickets", {
        headers: {
          Authorization: `Bearer ${user.token}`, // Send the token!
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setTickets(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filter Logic (Frontend side for now)
  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tickets</h1>
          <p className="text-gray-500">Manage and track your support requests</p>
        </div>
        <div className="flex gap-2">
          
          <Link to="/tickets/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-200">
            <Plus size={20} /> New Ticket
          </Link>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium">
          <Filter size={20} /> Filter
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
          <AlertCircle size={20} /> Error: {error}
        </div>
      )}

      {/* LOADING SPINNER */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        /* TICKET LIST */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredTickets.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <Link to={`/tickets/${ticket._id}`} key={ticket._id} className="block p-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">{ticket.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{ticket.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          ticket.priority === 'High' ? 'bg-red-100 text-red-600' : 
                          ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-600'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span>• {ticket.category}</span>
                        <span>• {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {ticket.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
              <p className="text-gray-500 mt-1">Get started by creating a new ticket.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}