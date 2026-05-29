import remarkDirective from "remark-directive";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { visit } from "unist-util-visit";
import {
  CircleAlertIcon,
  CircleCheckBigIcon,
  InfoIcon,
  LightbulbIcon,
  type LucideIcon,
} from "lucide-react";

export const CALLOUT_TYPES = [
  "note",
  "info",
  "success",
  "warning",
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number];

export const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  note: {
    label: "Note",
    icon: LightbulbIcon,
    className: "markdown-callout markdown-callout-note",
  },
  info: {
    label: "Info",
    icon: InfoIcon,
    className: "markdown-callout markdown-callout-info",
  },
  success: {
    label: "Success",
    icon: CircleCheckBigIcon,
    className: "markdown-callout markdown-callout-success",
  },
  warning: {
    label: "Warning",
    icon: CircleAlertIcon,
    className: "markdown-callout markdown-callout-warning",
  },
};

type DirectiveNode = {
  type: string;
  name?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
};

const replaceSoftBreaks = (children?: Array<Record<string, unknown>>) => {
  if (!children) {
    return children;
  }

  return children.flatMap((child) => {
    if ("children" in child && Array.isArray(child.children)) {
      child.children = replaceSoftBreaks(
        child.children as Array<Record<string, unknown>>,
      );
    }

    if (child.type !== "text" || typeof child.value !== "string") {
      return [child];
    }

    if (!child.value.includes("\n")) {
      return [child];
    }

    return child.value.split("\n").flatMap((segment, index, array) => {
      const nodes: Array<Record<string, unknown>> = [];

      if (segment.length > 0) {
        nodes.push({ ...child, value: segment });
      }

      if (index < array.length - 1) {
        nodes.push({ type: "break" });
      }

      return nodes;
    });
  });
};

export const remarkCallouts = () => {
  return (tree: unknown) => {
    visit(tree as never, (node) => {
      const directiveNode = node as DirectiveNode;
      if ("children" in directiveNode && Array.isArray(directiveNode.children)) {
        directiveNode.children = replaceSoftBreaks(
          directiveNode.children as Array<Record<string, unknown>>,
        ) as never;
      }

      if (directiveNode.type !== "containerDirective") {
        return;
      }

      if (!directiveNode.name || !(directiveNode.name in CALLOUT_CONFIG)) {
        return;
      }

      const config = CALLOUT_CONFIG[directiveNode.name as CalloutType];
      const data = directiveNode.data ?? (directiveNode.data = {});

      data.hName = "div";
      data.hProperties = {
        className: config.className,
        dataCallout: directiveNode.name,
      };
    });
  };
};

export const markdownRemarkPlugins = [remarkDirective, remarkCallouts];

export const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "div"],
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...((defaultSchema.attributes?.div as Array<string | [string, ...string[]]>) ??
        []),
      [
        "className",
        "markdown-callout",
        "markdown-callout-note",
        "markdown-callout-info",
        "markdown-callout-success",
        "markdown-callout-warning",
      ],
      [
        "dataCallout",
        "note",
        "info",
        "success",
        "warning",
      ],
    ],
  },
};

export { rehypeSanitize };

export const getCalloutTemplate = (
  type: CalloutType,
  selectedText?: string,
) => {
  const content = selectedText?.trim() || `Add ${CALLOUT_CONFIG[type].label.toLowerCase()} text here.`;

  return `:::${type}\n${content}\n:::`;
};
