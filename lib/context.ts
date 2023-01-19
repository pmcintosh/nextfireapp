import { createContext } from "react";

interface UserData {
  user?: any;
  username: string | null;
}

const init: UserData = { user: null, username: null };
export const UserContext = createContext(init);
