import { Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Dashboard from "./Components/Dashboard";
import ForgotPassword from "./Components/ForgotPassword";
import Settings from "./Components/Settings";



function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/shared" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
      </Routes>
    </>
  )
}

export default App
