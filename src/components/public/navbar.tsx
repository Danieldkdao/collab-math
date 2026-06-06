import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { MenuIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export const PublicNavbar = () => {
  return (
    <nav className="p-6 border-b flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-8">
        <h1 className="text-3xl font-semibold text-primary">CollabMath</h1>
        <Link
          href="/threads"
          className="text-lg hover:underline font-medium hidden md:block"
        >
          Public Threads
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="flex md:hidden">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="sr-only">
              <SheetTitle>Content</SheetTitle>
              <SheetDescription>The sidebar links.</SheetDescription>
            </SheetHeader>
            <PublicNavbarResponsiveSidebarLinks />
          </SheetContent>
        </Sheet>
        <Suspense fallback={<PublicNavbarAuthLoading />}>
          <PublicNavbarAuthSuspense />
        </Suspense>
      </div>
    </nav>
  );
};

const PublicNavbarAuthLoading = () => {
  return (
    <div className="items-center gap-2 hidden md:flex">
      <Skeleton className="h-9 w-28" />
      <Skeleton className="h-9 w-28" />
    </div>
  );
};

const PublicNavbarAuthSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return (
      <div className="items-center gap-2 hidden md:flex">
        <Button variant="ghost" className="w-28" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button className="w-28" asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button className="w-40 hidden md:flex" asChild>
      <Link href="/dashboard">Go to dashboard</Link>
    </Button>
  );
};

const PublicNavbarResponsiveSidebarLinks = () => {
  return (
    <div className="p-4 flex flex-col min-h-full">
      <div className="w-full mb-auto">
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/threads">Public Threads</Link>
        </Button>
      </div>
      <Suspense fallback={<PublicNavbarMobileAuthLoading />}>
        <PublicNavbarMobileAuthSuspense />
      </Suspense>
    </div>
  );
};

const PublicNavbarMobileAuthLoading = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
};

const PublicNavbarMobileAuthSuspense = async () => {
  const { userId } = await getCurrentUser();
  if (!userId) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button variant="ghost" className="w-full" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button className="w-full" asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  return (
    <Button className="w-full" asChild>
      <Link href="/dashboard">Go to dashboard</Link>
    </Button>
  );
};
