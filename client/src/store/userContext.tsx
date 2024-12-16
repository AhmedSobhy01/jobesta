import { createContext, useCallback, useState } from 'react';

interface UserContextType {
  accountId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  isBanned: string | null;
  profilePicture: string | null;
  setUsername: (username: string | null) => void;
  setUser: (newUser: {
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    role: string | null;
    isBanned: string | null;
    profilePicture: string | null;
  }) => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  accountId: null,
  firstName: null,
  lastName: null,
  username: null,
  email: null,
  role: null,
  isBanned: null,
  profilePicture: null,
  setUsername: () => {},
  setUser: () => {},
});

export const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userState, setUserState] = useState<{
    accountId: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    role: string | null;
    isBanned: string | null;
    profilePicture: string | null;
  }>({
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

  const setUser = useCallback(
    (newUser: {
      accountId: string | null;
      firstName: string | null;
      lastName: string | null;
      username: string | null;
      email: string | null;
      role: string | null;
      isBanned: string | null;
      profilePicture: string | null;
    }) => {
      setUserState(newUser);
    },
    [],
  );

  const userContextValue = {
    accountId: userState.accountId,
    firstName: userState.firstName,
    lastName: userState.lastName,
    username: userState.username,
    email: userState.email,
    role: userState.role,
    isBanned: userState.isBanned,
    profilePicture: userState.profilePicture,
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
