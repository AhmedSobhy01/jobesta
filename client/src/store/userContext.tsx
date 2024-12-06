import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import { createContext, useCallback, useState } from 'react';

interface UserContextType {
  accountId: string | null;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  email: string | null;
  role: string | null;
  isBanned: string | null;
  profilePicture: string | null;
  jwtToken: string | null;
  refreshToken: string | null;
  setUser: (newTokens: {
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    userName: string | null;
    email: string | null;
    role: string | null;
    isBanned: string | null;
    profilePicture: string | null;
    jwtToken: string | null;
    refreshToken: string | null;
  }) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  accountId: null,
  firstName: null,
  lastName: null,
  userName: null,
  email: null,
  role: null,
  isBanned: null,
  profilePicture: null,
  jwtToken: null,
  refreshToken: null,
  setUser: () => {},
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userState, setUserState] = useState<{
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    userName: string | null;
    email: string | null;
    role: string | null;
    isBanned: string | null;
    profilePicture: string | null;
    jwtToken: string | null;
    refreshToken: string | null;
  }>({
    accountId: null,
    firstName: null,
    lastName: null,
    userName: null,
    email: null,
    role: null,
    isBanned: null,
    profilePicture: null,
    jwtToken: getAuthJwtToken() || null,
    refreshToken: getAuthRefreshToken() || null,
  });

  const setUser = useCallback(
    (newUser: {
      accountId: string | null;
      firstName: string | null;
      lastName: string | null;
      userName: string | null;
      email: string | null;
      role: string | null;
      isBanned: string | null;
      profilePicture: string | null;
      jwtToken: string | null;
      refreshToken: string | null;
    }) => {
      setUserState(newUser);
    },
    [setUserState],
  );

  const userContextValue = {
    accountId: userState.accountId,
    firstName: userState.firstName,
    lastName: userState.lastName,
    userName: userState.userName,
    email: userState.email,
    role: userState.role,
    isBanned: userState.isBanned,
    profilePicture: userState.profilePicture,
    jwtToken: userState.jwtToken,
    refreshToken: userState.refreshToken,
    setUser,
  };

  return (
    <UserContext.Provider value={userContextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
