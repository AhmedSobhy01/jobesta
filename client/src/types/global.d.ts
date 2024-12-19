interface User {
  accountId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  isBanned: string | null;
  profilePicture: string | null;
}

interface Freelancer {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

interface Account {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture: string;
  isBanned: boolean;
  role: string;
  createdAt: string;
}

interface JobCategory {
  id: number;
  name: string;
  description: string;
  jobsCount?: number;
}

interface Job {
  id: number;
  status: string;
  budget: number;
  duration: number;
  title: string;
  description: string;
  myJob: boolean;
  category: JobCategory;
  proposalsCount?: number;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
  };
  freelancer?: Freelancer;
  myProposal?: Proposal;
  proposals?: Proposal[];
  reviews?: Review[];
}

interface Milestone {
  status?: string;
  name: string;
  amount: string;
  duration: string;
  order: number;
}

interface Review {
  rating: string;
  comment: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    profilePicture: string;
  };
  job?: Job;
}

interface Proposal {
  status?: string;
  coverLetter: string;
  createdAt?: string;
  freelancer?: Freelancer;
  milestones: Milestone[];
}

interface Message {
  id: number;
  message: string;
  attachmentPath: string | null;
  sentAt: string;
  sender: {
    firstName: string;
    lastName: string;
    profilePicture: string;
    username: string;
    isAdmin: boolean;
  };
}

interface Message {
  id: number;
  message: string;
  attachmentPath: string | null;
  sentAt: string;
  sender: {
    firstName: string;
    lastName: string;
    profilePicture: string;
    username: string;
  };
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
}
