import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";

import Register from "./pages/auth/Register";

import OTPVerification from "./pages/auth/OTPVerification";

import ClientDashboard from "./pages/client/ClientDashboard";

import AdvocateDashboard from "./pages/advocate/AdvocateDashboard";

import AdminDashboard from "./pages/admin/AdminDashboard";

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

        <Route path="/admin" element={<AdminDashboard />} />

      </Routes>

    </BrowserRouter>

  );

}

export default App;