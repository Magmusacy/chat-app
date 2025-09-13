import { useState } from "react";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";

export default function AuthScreen() {
  const [isSignIn, setIsSignIn] = useState<boolean>(true);

  return (
    <>
      {isSignIn ? (
        <LoginScreen setIsSignIn={setIsSignIn}></LoginScreen>
      ) : (
        <RegisterScreen setIsSignIn={setIsSignIn}></RegisterScreen>
      )}
    </>
  );
}
