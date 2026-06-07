import { HeroImage } from "@/components/public/hero-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  ArrowRightIcon,
  LayoutDashboardIcon,
  LinkIcon,
  LockIcon,
  PenLineIcon,
  UserPlusIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const features = [
  {
    icon: WorkflowIcon,
    feature: "Nested math discussions",
    text: "Organize complex solutions with multi-level threading that keeps context perfectly intact.",
  },
  {
    icon: PenLineIcon,
    feature: "Markdown & Katex",
    text: "A powerful editor designed for scholars. Write rich text and complex LaTeX formulas side-by-side.",
  },
  {
    icon: LinkIcon,
    feature: "Problem-threading linking",
    text: "Connect separate problems and discussions to build a comprehensive knowledge graph.",
  },
  {
    icon: LockIcon,
    feature: "Privacy controls",
    text: "Granular permissions for public exploration or private researcher-only collaborative circles.",
  },
  {
    icon: UserPlusIcon,
    feature: "Invitation management",
    text: "Seamlessly onboard team members, students, or peers into specific problem threads.",
  },
  {
    icon: LayoutDashboardIcon,
    feature: "Dashboard tracking",
    text: "Stay on top of active threads and peer responses with an intuitive overview system.",
  },
];

const HomePage = () => {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="text-5xl font-bold text-center max-w-200">
          Work through math together, one thread at a time.
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-175">
          The collaborative space for students, tutors, and researchers to
          discuss, solve, and track math problems with academic precision.
        </p>
        <div className="flex items-center gap-2">
          <Suspense fallback={<Skeleton className="w-44 h-11" />}>
            <GetStartedButton />
          </Suspense>

          <Button variant="outline" className="w-42 h-11" asChild>
            <Link href="/threads">Browse public threads</Link>
          </Button>
        </div>
      </div>
      <HeroImage />
      <div className="flex flex-col gap-6 items-center w-full">
        <h2 className="text-3xl font-semibold text-center max-w-200">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col gap-2">
                <div className="size-12 rounded-md bg-primary/30 flex items-center justify-center mt-2">
                  <feature.icon className="size-6" />
                </div>
                <span className="text-xl font-medium">{feature.feature}</span>
                <p className="text-base text-muted-foreground">
                  {feature.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const GetStartedButton = async () => {
  const { userId } = await getCurrentUser();
  const href = userId ? "/dashboard" : "/sign-in";

  return (
    <Button className="w-44 h-11" asChild>
      <Link href={href}>
        Start collaborating
        <ArrowRightIcon />
      </Link>
    </Button>
  );
};

export default HomePage;
