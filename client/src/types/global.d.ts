interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
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
