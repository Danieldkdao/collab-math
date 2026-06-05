import type { ComponentPropsWithoutRef } from "react";

type MarkdownImageProps = ComponentPropsWithoutRef<"img"> & {
  node?: unknown;
};

export const MarkdownImage = (props: MarkdownImageProps) => {
  const { src, alt = "" } = props;
  const safeSrc = typeof src === "string" ? src.trim() : "";

  if (!safeSrc) {
    return null;
  }

  const { node, ...imgProps } = props;
  void node;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...imgProps} src={safeSrc} alt={alt} loading={props.loading ?? "lazy"} />
  );
};
