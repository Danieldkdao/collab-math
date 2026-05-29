"use client";

import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { rehypeKatexOptions } from "./katex-config";
import {
  markdownSanitizeSchema,
  markdownRemarkPlugins,
  rehypeSanitize,
} from "./callouts";

const markdownThemeVars = {
  "--color-canvas-default": "transparent",
} as CSSProperties;

const markdownComponents = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      {...props}
      className="mt-8 text-4xl font-bold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-8 border-b border-border pb-2 text-3xl font-semibold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-6 text-2xl font-semibold tracking-tight text-foreground"
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4 {...props} className="mt-6 text-xl font-semibold text-foreground">
      {children}
    </h4>
  ),
  h5: ({ children, ...props }: ComponentPropsWithoutRef<"h5">) => (
    <h5 {...props} className="mt-5 text-lg font-semibold text-foreground">
      {children}
    </h5>
  ),
  h6: ({ children, ...props }: ComponentPropsWithoutRef<"h6">) => (
    <h6
      {...props}
      className="mt-5 text-base font-semibold uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </h6>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p
      {...props}
      className="my-4 break-words text-[1.02rem] leading-8 text-foreground/90 [overflow-wrap:anywhere]"
    >
      {children}
    </p>
  ),
  a: ({ children, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary/80"
    >
      {children}
    </a>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="my-4 ml-6 list-disc space-y-2 text-foreground/90"
      style={{ listStyleType: "disc", listStylePosition: "outside" }}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="my-4 ml-6 list-decimal space-y-2 text-foreground/90"
      style={{ listStyleType: "decimal", listStylePosition: "outside" }}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li
      {...props}
      className="break-words pl-1 leading-7 [overflow-wrap:anywhere]"
    >
      {children}
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-6 rounded-r-lg border-l-4 border-primary/35 bg-muted/40 px-5 py-3 italic text-muted-foreground"
    >
      {children}
    </blockquote>
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr {...props} className="my-8 border-border" />
  ),
  code: ({
    children,
    className,
    ...props
  }: ComponentPropsWithoutRef<"code">) => {
    const isBlock = Boolean(className);

    if (isBlock) {
      return (
        <code
          {...props}
          className={`${className ?? ""} block overflow-x-auto rounded-lg bg-muted px-4 py-3 text-sm leading-7`}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        {...props}
        className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.95em] text-foreground"
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="my-6 overflow-x-auto rounded-xl border border-border bg-muted/70 p-0 text-sm"
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 w-full overflow-x-auto">
      <table
        {...props}
        className="w-full min-w-xl border-collapse overflow-hidden rounded-lg border border-border text-left text-sm"
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead {...props} className="bg-muted/60">
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border-b border-border px-4 py-3 font-semibold text-foreground"
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      {...props}
      className="border-t border-border px-4 py-3 align-top text-foreground/90"
    >
      {children}
    </td>
  ),
};

export const MarkdownRenderer = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <div
      data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
      className={cn("min-w-0 w-full font-sans text-foreground", className)}
      style={markdownThemeVars}
    >
      <div className="wmde-markdown-var" style={markdownThemeVars} />
      <MDEditor.Markdown
        source={children}
        remarkPlugins={[remarkMath, ...markdownRemarkPlugins]}
        rehypePlugins={[
          [rehypeSanitize, markdownSanitizeSchema],
          [rehypeKatex, rehypeKatexOptions],
        ]}
        className="max-w-none min-w-0 bg-transparent font-sans text-base text-foreground [&_.katex]:text-foreground [&_.katex-display]:my-6 [&_.katex-display]:w-full [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2 [&_.katex-display]:text-foreground [&_.katex-display>span]:min-w-max [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full"
        style={markdownThemeVars}
        components={markdownComponents}
      />
    </div>
  );
};
