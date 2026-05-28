"use client";

import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useState } from "react";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const themes = [
  {
    value: "light",
    icon: SunIcon,
  },
  {
    value: "dark",
    icon: MoonIcon,
  },
  {
    value: "system",
    icon: LaptopIcon,
  },
];

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [pending, setPending] = useState(true);

  useEffect(() => {
    setPending(false);
  }, []);

  if (pending) {
    return null;
  }

  const activeTheme = theme === "system" ? "system" : (resolvedTheme ?? theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {activeTheme === "light" ? (
            <SunIcon className="text-primary size-4" />
          ) : activeTheme === "dark" ? (
            <MoonIcon className="text-primary size-4" />
          ) : (
            <LaptopIcon className="text-primary size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            onClick={() => setTheme(t.value)}
            key={t.value}
            className="flex items-center gap-3"
          >
            <t.icon
              className={cn(activeTheme === t.value && "text-primary size-4")}
            />
            <label
              className={cn(
                activeTheme === t.value &&
                  "text-primary cursor-pointer font-semibold",
                "font-medium capitalize",
              )}
            >
              {t.value}
            </label>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
