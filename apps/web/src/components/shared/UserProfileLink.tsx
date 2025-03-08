import React from "react";
import Link from "next/link";

interface UserProfileLinkProps {
  username: string;
  children: React.ReactNode;
  className?: string;
}

export const UserProfileLink: React.FC<UserProfileLinkProps> = ({
  username,
  children,
  className = "",
}) => {
  if (!username) return <>{children}</>;

  return (
    <Link href={`/users/${username}`} className={className}>
      {children}
    </Link>
  );
};
