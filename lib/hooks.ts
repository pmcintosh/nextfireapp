import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore, subscribeToUsernameWithUid } from "./firebase";

export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe;

    const fetch = async () => {
      if (user) {
        unsubscribe = await subscribeToUsernameWithUid(user.uid, (name) =>
          setUsername(name)
        );
      } else setUsername(null);
    };

    fetch();

    return unsubscribe;
  }, [user]);

  return { user, username };
}
