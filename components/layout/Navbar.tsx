"use client"
import { Video } from "lucide-react";
import Container from "./Container";
import { useRouter } from "next/navigation"; 
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

const Navbar = () => {
  const router = useRouter();
  const { userId } = useAuth(); // whether we are logged in or not

  const handleSignup = () => {
    router.push("/sign-up");
  };

  const handleSignin = () => {
    router.push("/sign-in");
  };

  return (
    <div className="sticky top-0 border-b-primary/10">
      <Container>
        <div className="flex justify-between items-center">
          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Video />
            <div className="font-bold text-xl">Video Chat</div>
          </div>
          <div className="flex gap-3 items-center">
            <UserButton />
            {!userId && (
              <>
                <Button
                  onClick={() => {
                    console.log("Signin button clicked directly");
                    handleSignin();
                  }}
                  size="sm"
                  variant="outline"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => {
                    console.log("Signup button clicked directly");
                    handleSignup();
                  }}
                  size="sm"
                >
                  Sign up
                </Button>
              </>
            )}
            
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Navbar;
