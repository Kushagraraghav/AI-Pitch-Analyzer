import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import FounderPage from './pages/FounderPage';
import FounderDashboardPage from './pages/FounderDashboardPage';
import InvestorPage from './pages/InvestorPage';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/founder" element={<ProtectedRoute allowedRoles={['Founder']}><FounderPage /></ProtectedRoute>} />
        <Route path="/founder-dashboard" element={<ProtectedRoute allowedRoles={['Founder']}><FounderDashboardPage /></ProtectedRoute>} />
        <Route path="/investor" element={<ProtectedRoute allowedRoles={['Investor']}><InvestorPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
