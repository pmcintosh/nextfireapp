import { UserData } from "@/lib/models";

interface Props {
  user: UserData;
}

export default function UserProfile({ user }: Props) {
  return (
    <div className="box-center">
      <img src={user.photoURL} alt="profile pic" className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
