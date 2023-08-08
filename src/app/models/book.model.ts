import { User } from './user.model';

export interface Book {
    title: string;
    author: string;
    userId?: number;
    User?: User;
}