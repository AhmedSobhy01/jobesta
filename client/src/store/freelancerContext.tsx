import { createContext, useCallback, useState } from 'react';

interface FreelancerContextType {
  balance: number | null;
  setFreelancer: (newFreelancer: { balance: number | null }) => void;
}

// Create the context with a default value
const FreelancerContext = createContext<FreelancerContextType>({
  balance: null,
  setFreelancer: () => {},
});

export const FreelancerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [freelancerState, setFreelancerState] = useState<{
    balance: number | null;
  }>({
    balance: null,
  });

  const setFreelancer = useCallback(
    (newFreelancer: { balance: number | null }) => {
      setFreelancerState(newFreelancer);
    },
    [setFreelancerState],
  );

  const freelancerContextValue = {
    balance: freelancerState.balance,
    setFreelancer,
  };

  return (
    <FreelancerContext.Provider value={freelancerContextValue}>
      {children}
    </FreelancerContext.Provider>
  );
};

export default FreelancerContext;
