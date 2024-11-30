import { IAccount } from './model';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: IAccount;
    }
  }
}
