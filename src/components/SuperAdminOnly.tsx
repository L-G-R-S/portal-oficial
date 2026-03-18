import { useAuth } from '@/contexts/AuthContext';

interface SuperAdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuperAdminOnly({ children, fallback = null }: SuperAdminOnlyProps) {
  const { isSuperAdmin, loading } = useAuth();
  
  if (loading) return null;
  
  if (!isSuperAdmin) return <>{fallback}</>;
  
  return <>{children}</>;
}
