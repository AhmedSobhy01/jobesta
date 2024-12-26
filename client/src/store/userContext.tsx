import { getAuthJwtToken } from '@/utils/auth';
import { createContext, useCallback, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

interface UserContextType {
  isUserLoading: boolean;
  accountId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  isBanned: boolean | null;
  profilePicture: string | null;
  socket: Socket | null;
  setUsername: (username: string | null) => void;
  setUser: (newUser: {
    isUserLoading: boolean;
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    role: string | null;
    isBanned: boolean | null;
    profilePicture: string | null;
  }) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  isUserLoading: true,
  accountId: null,
  firstName: null,
  lastName: null,
  username: null,
  email: null,
  role: null,
  isBanned: null,
  profilePicture: null,
  socket: null,
  setUsername: () => {},
  setUser: () => {},
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<Socket | null>(null);
  const [userState, setUserState] = useState<{
    isUserLoading: boolean;
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    role: string | null;
    isBanned: boolean | null;
    profilePicture: string | null;
  }>({
    isUserLoading: true,
    accountId: null,
    firstName: null,
    lastName: null,
    username: null,
    email: null,
    role: null,
    isBanned: null,
    profilePicture: null,
  });

  const setUsername = useCallback((username: string | null) => {
    setUserState((prev) => ({
      ...prev,
      username: username,
    }));
  }, []);

  useEffect(() => {
    const token = getAuthJwtToken();
    if (token && !socket.current) {
      socket.current = io(import.meta.env.VITE_API_URL as string, {
        auth: {
          token,
        },
      });
      socket.current.emit('subscribe-notifications');
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current.emit('unsubscribe-notifications');
        socket.current = null; // Reset socket connection
      }
    };
  }, [userState.accountId]);

  const setUser = useCallback(
    (newUser: {
      isUserLoading: boolean;
      accountId: string | null;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      email: string | null;
      role: string | null;
      isBanned: boolean | null;
      profilePicture: string | null;
    }) => {
      setUserState(newUser);
    },
    [],
  );

  const userContextValue = {
    isUserLoading: userState.isUserLoading,
    accountId: userState.accountId,
    firstName: userState.firstName,
    lastName: userState.lastName,
    username: userState.username,
    email: userState.email,
    role: userState.role,
    isBanned: userState.isBanned,
    profilePicture: userState.profilePicture,
    socket: socket.current,
    setUser,
    setUsername,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
