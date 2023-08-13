import { User } from './user.model';

export interface Book {
    id?: number;
    title: string;
    author: string;
    userId?: number;
    User?: User;
}