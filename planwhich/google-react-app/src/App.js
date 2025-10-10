import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Log In</button>
      ) : (
        <>
          <h2>Welcome, {user.name}</h2>
          <img src={user.picture} alt={user.name} width={50} />
          <p>{user.email}</p>
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log Out
          </button>
        </>
      )}
    </div>
  );
}

export default App;