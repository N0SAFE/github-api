import { Button } from "@repo/ui/components/shadcn/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react";

export default function GitHubSignInButton() {
  return (
    <Button
      onClick={() => signIn("github")}
      variant="outline"
      className="w-full"
    >
      <GitHubLogoIcon className="mr-2 h-5 w-5" />
      Sign in with GitHub
    </Button>
  );
}