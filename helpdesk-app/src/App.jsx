import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RequireRole from "./components/auth/RequireRole";

// PAGES
import Landing from "./pages/Landing"; // <--- 1. Import Landing
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/forgotpassword";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import NewTicket from "./pages/NewTicket";
import Profile from "./pages/profile";
import KnowledgeBase from "./pages/Knowledgebase";
import Reports from "./pages/Reports";
import ActivityLogs from "./pages/ActivityLogs"; // <--- Import

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Landing />} />        {/* <--- 2. Root is now Landing */}
          <Route path="/login" element={<Login />} />     {/* <--- 3. Login moved to /login */}
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<Layout />}>
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/new" element={<NewTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<RequireRole allowedRoles={["Super Admin", "Admin", "Manager", "Agent"]} />}>
              {/* Dashboard moved out to allow Customers */}
            </Route>

            <Route element={<RequireRole allowedRoles={["Super Admin", "Admin"]} />}>
              <Route path="/users" element={<Users />} />
              <Route path="/logs" element={<ActivityLogs />} /> {/* <--- New Route */}
            </Route>

            <Route element={<RequireRole allowedRoles={["Super Admin", "Admin", "Manager"]} />}>
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;