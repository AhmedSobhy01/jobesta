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
  category: JobCategory;
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
  };
}
