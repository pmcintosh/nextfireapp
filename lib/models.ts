import { UserInfo } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface Post {
  content: string;
  createdAt: number | Timestamp;
  heartCount: number;
  published: boolean;
  slug: string;
  title: string;
  uid: string;
  updatedAt: number | Timestamp;
  username: string;
}

export type UserData = UserInfo & {
  username: string;
};
