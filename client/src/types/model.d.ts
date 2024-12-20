interface IPreviousWork {
  order?: number;
  title?: string;
  description?: string;

  url?: string;
}

interface IJob {
  id?: string;
  status?: string;
  budget?: number;
  duration?: string;
  title?: string;
  description?: string;
  category?: {
    id?: string;
    name?: string;
    description: string;
  };
  createdAt?: string;
  client?: {
    firstName?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
  };
}

interface IBadge {
  name?: string;
  description?: string;
  icon?: string;
}

interface INewData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

interface INotifications {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  url: string;
}
