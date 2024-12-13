import { createContext, useCallback, useState } from 'react';

interface FreelancerContextType {
  freelancerId?: string;
  balance?: number;
  bio?: string;
  previousWork?: IPreviousWork[];
  skills?: string[];
  badges?: IBadge[];
  jobs?: IJob[];
  setFreelancer: (newFreelancer: {
    freelancerId?: string;
    balance?: number;
    bio?: string;
    previousWork?: IPreviousWork[];
    skills?: string[];
    badges?: IBadge[];
    jobs?: IJob[];
  }) => void;
}

// Create the context with a default value
const FreelancerContext = createContext<FreelancerContextType>({
  freelancerId: undefined,
  balance: undefined,
  bio: undefined,
  previousWork: undefined,
  skills: undefined,
  badges: undefined,
  jobs: undefined,
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
    badges?: IBadge[];
    jobs?: IJob[];
  }>({
    freelancerId: undefined,
    balance: undefined,
    bio: undefined,
    previousWork: undefined,
    skills: undefined,
    badges: undefined,
    jobs: undefined,
  });

  const setFreelancer = useCallback(
    (newFreelancer: {
      freelancerId?: string;
      balance?: number;
      bio?: string;
      previousWork?: IPreviousWork[];
      skills?: string[];
      badges?: IBadge[];
      jobs?: IJob[];
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
    badges: freelancerState.badges,
    jobs: freelancerState.jobs,
    setFreelancer,
  };

  return (
    <FreelancerContext.Provider value={freelancerContextValue}>
      {children}
    </FreelancerContext.Provider>
  );
};

export default FreelancerContext;
