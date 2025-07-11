import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import Profile from './pages/Profile';
import Pending from './pages/Pending';
import { AuthRoleProvider } from './contexts/authRoleContext';

export default function App() {
  return (
    <AuthRoleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pending" element={<Pending />} />
        </Routes>
      </BrowserRouter>
    </AuthRoleProvider>
  );
}