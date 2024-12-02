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
