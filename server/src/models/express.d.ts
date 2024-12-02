import { IAccount, IFreelancer } from './model';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: IAccount & {
        freelancer?: IFreelancer;
      };
    }
  }
}
