import { buttonVariants } from "@repo/ui/components/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen gap-6 p-8 pb-16 md:px-24">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <p className="text-center text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        Return to Homepage
      </Link>
    </div>
  );
}
