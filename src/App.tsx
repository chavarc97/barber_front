import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home/Home';
import Login from './pages/LoginPage/Login';
import SignUp from './pages/SignUpPage/SignUp';
import Services from './pages/ServicesPage/Services';
import Barbers from './pages/BarbersPage/Barbers';
import BookAppointment from './pages/BookAppointment/BookAppointment';
import MyAppointments from './pages/MyAppointments/MyAppointments';

function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { loading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (isPublicRoute) {
    switch (currentPath) {
      case '/login':
        return <Login />;
      case '/signup':
        return <SignUp />;
      default:
        return <Login />;
    }
  }

  return (
    <Layout>
      {currentPath === '/' && <Home />}
      {currentPath === '/services' && <Services />}
      {currentPath === '/barbers' && <Barbers />}
      {currentPath === '/book' && <BookAppointment />}
      {currentPath === '/appointments' && <MyAppointments />}
      {!['/','/ services', '/barbers', '/book', '/appointments'].includes(currentPath) && <Home />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
