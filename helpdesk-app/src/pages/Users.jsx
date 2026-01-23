import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Plus, Loader, Trash2 } from "lucide-react";

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Agent", department: "IT" });

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://helpdesk-yida.onrender.com/api/users/users", { // Points to router.route('/users')
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://helpdesk-yida.onrender.com/api/users/users", {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if(res.ok) {
        alert("User Created!");
        setShowModal(false);
        fetchUsers(); // Refresh list
      } else {
        alert("Failed to create user");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-3xl font-bold text-gray-800">User Management</h1><p className="text-gray-500">Manage system access and roles</p></div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"><Plus size={20} /> Add User</button>
      </div>

      {loading ? <Loader className="animate-spin mx-auto" /> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Department</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{u.name.charAt(0)}</div>
                    <div><div className="font-bold text-gray-800">{u.name}</div><div className="text-xs text-gray-500">{u.email}</div></div>
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' || u.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                  <td className="p-4 text-sm text-gray-600">{u.department || "-"}</td>
                  <td className="p-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input placeholder="Full Name" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Email" type="email" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, email: e.target.value})} />
              <input placeholder="Password" type="password" className="w-full border p-2 rounded" required onChange={e => setFormData({...formData, password: e.target.value})} />
              <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="Agent">Agent</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}