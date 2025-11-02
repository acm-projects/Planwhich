"use client";
import Image from "next/image";

// Double-check this domain in your AWS Cognito console
const COGNITO_DOMAIN =
  "https://us-east-1mupktbr1j.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "462l892q21b3emij4ob4rjr5ji";

export default function HomePage() {
  const handleGoogleSignIn = () => {
    // Build redirect URI only on client side
    const redirectUri = `${window.location.origin}/projects`;

    const cognitoAuthUrl =
      `${COGNITO_DOMAIN}/oauth2/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `scope=email+openid+profile&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `identity_provider=Google`;
    `prompt=select_account`;

    console.log("Redirecting to:", cognitoAuthUrl); // Debug log
    window.location.href = cognitoAuthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-300 via-yellow-200 to-green-300 text-gray-800">
      <div className="bg-white rounded-xl shadow-xl border border-blue-400 p-10 w-96 text-center">
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="PlanWhich Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold mt-2">PlanWhich</h1>
          <p className="text-gray-600 text-sm mt-1">
            Plan and coordinate your projects <br />
            with ease all on one platform
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Login or Sign Up</h2>

        <button
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100 transition"
          onClick={handleGoogleSignIn}
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Icon"
            width={20}
            height={20}
          />
          <span className="font-medium text-gray-700">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  );
}
