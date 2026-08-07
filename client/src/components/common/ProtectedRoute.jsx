import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loaders';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageLoader label="Checking your session..." />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
