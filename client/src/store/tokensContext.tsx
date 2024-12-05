import { getAuthJwtToken, getAuthRefreshToken } from '@/utils/auth';
import { createContext, useCallback, useState } from 'react';

interface TokensContextType {
  jwtToken: string | null;
  refreshToken: string | null;
  setTokens: (newTokens: {
    jwtToken: string | null;
    refreshToken: string | null;
  }) => void;
}

// Create the context with a default value
const TokensContext = createContext<TokensContextType>({
  jwtToken: null,
  refreshToken: null,
  setTokens: () => {},
});

export const TokensContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tokens, setTokensState] = useState<{
    jwtToken: string | null;
    refreshToken: string | null;
  }>({
    jwtToken: getAuthJwtToken(),
    refreshToken: getAuthRefreshToken(),
  });

  const setTokens = useCallback(
    (newTokens: { jwtToken: string | null; refreshToken: string | null }) => {
      setTokensState(newTokens);
    },
    [],
  );

  const tokensContext = {
    jwtToken: tokens.jwtToken,
    refreshToken: tokens.refreshToken,
    setTokens,
  };

  return (
    <TokensContext.Provider value={tokensContext}>
      {children}
    </TokensContext.Provider>
  );
};

export default TokensContext;
