import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdvocateLogin from "./pages/auth/AdvocateLogin";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";

import Register from "./pages/auth/Register";

import OTPVerification from "./pages/auth/OTPVerification";

import ClientDashboard from "./pages/client/ClientDashboard";

import AdvocateDashboard from "./pages/advocate/AdvocateDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";

// NEW IMPORT
import AdminLogin from "./pages/admin/AdminLogin";

function AdminPortal() {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  let isAdmin = false;
  if (storedUser && token) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "admin") {
        isAdmin = true;
      }
    } catch (e) {}
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/advocate" element={<AdvocateDashboard />} />
        <Route path="/advocate-login" element={<AdvocateLogin />} />

        {/* STANDALONE SEPARATE ADMIN PORTAL */}
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/admin-login" element={<AdminPortal />} />
        <Route path="/admin/dashboard" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;