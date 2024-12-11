import { createContext, useCallback, useState } from 'react';

interface IPreviousWork {
  order?: number;
  title?: string;
  description?: string;
  url?: string;
}

interface FreelancerContextType {
  freelancerId?: string;
  balance?: number;
  bio?: string;
  previousWork?: IPreviousWork[];
  skills?: string[];
  setFreelancer: (newFreelancer: {
    freelancerId?: string;
    balance?: number;
    bio?: string;
    previousWork?: IPreviousWork[];
    skills?: string[];
  }) => void;
}

// Create the context with a default value
const FreelancerContext = createContext<FreelancerContextType>({
  freelancerId: undefined,
  balance: undefined,
  bio: undefined,
  previousWork: undefined,
  skills: undefined,
  setFreelancer: () => {},
});

export const FreelancerContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [freelancerState, setFreelancerState] = useState<{
    freelancerId?: string;
    balance?: number;
    bio?: string;
    previousWork?: IPreviousWork[];
    skills?: string[];
  }>({
    freelancerId: undefined,
    balance: undefined,
    bio: undefined,
    previousWork: undefined,
    skills: undefined,
  });

  const setFreelancer = useCallback(
    (newFreelancer: {
      freelancerId?: string;
      balance?: number;
      bio?: string;
      previousWork?: IPreviousWork[];
      skills?: string[];
    }) => {
      setFreelancerState(newFreelancer);
    },
    [setFreelancerState],
  );

  const freelancerContextValue = {
    freelancerId: freelancerState.freelancerId,
    balance: freelancerState.balance,
    bio: freelancerState.bio,
    previousWork: freelancerState.previousWork,
    skills: freelancerState.skills,
    setFreelancer,
  };

  return (
    <FreelancerContext.Provider value={freelancerContextValue}>
      {children}
    </FreelancerContext.Provider>
  );
};

export default FreelancerContext;
