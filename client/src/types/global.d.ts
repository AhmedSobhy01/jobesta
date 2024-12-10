interface Job {
  id: number;
  status: string;
  budget: number;
  duration: number;
  title: string;
  description: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  createdAt: string;
  client: {
    firstName: string;
    lastName: string;
    username: string;
    profilePicture: string;
  };
}
