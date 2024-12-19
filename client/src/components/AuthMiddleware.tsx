import { ReactNode } from 'react';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '@/store/userContext';

const AuthMiddleware = ({ children }: { children: ReactNode }) => {
  const { username } = useContext(UserContext);

  if (!username) return <Navigate to="/login" replace />;

  return children;
};

export default AuthMiddleware;
