"use client";
import { useUser } from "@auth0/nextjs-auth0";

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) return <a href="/auth/login">Login</a>;

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={user.picture}
        alt={user.name}
        style={{ borderRadius: "50%", width: "80px", height: "80px" }}
      />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <a href="/auth/logout">Logout</a>
    </div>
  );
}
