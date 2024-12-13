export interface IPreviousWork {
  freelancer_id: string;
  order: number;
  title: string;
  description: number;
  url?: string;
}

export interface IAccount {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  is_banned: string;
  profile_picture: string;
}

export interface IFreelancer {
  id: string;
  balance: number;
  bio: string;
}

export interface IMilestone {
  job_id?: string;
  freelancer_id?: string;
  status?: string;
  order: number;
  name: string;
  duration: number;
  amount: number;
}

export interface IProposal {
  jobId?: string;
  freelancer_id?: string;
  freelancer?: IAccountDisplay;
  coverLetter: string;
  status: string;
  createdAt: Date;
  milestones?: Array<IMilestone>;
}

export interface IJob {
  id: string;
  status: string;
  budget: number;
  duration: number;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    description: string;
  };
  createdAt: Date;
  client: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
  };
  proposals: Array<IProposal>;
  myJob: boolean;
  myProposal: IProposal | null;
}

export interface IAccountDisplay {
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
}
