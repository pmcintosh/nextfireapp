import Link from "next/link";
import { PropsWithChildren, ReactNode, useContext } from "react";
import { UserContext } from "@/lib/context";

interface Props {
  fallback?: ReactNode;
}

export default function AuthCheck(props: PropsWithChildren<Props>) {
  const { username } = useContext(UserContext);
  const render = username
    ? props.children
    : props.fallback || <Link href="/enter">You must be signed in</Link>;
  return <>{render}</>;
}
