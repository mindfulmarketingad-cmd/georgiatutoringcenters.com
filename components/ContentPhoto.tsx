import Image from "next/image";

/**
 * A photograph inside a content column: fixed frame, caption, no layout shift.
 */
export default function ContentPhoto({
  src,
  alt,
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <figure className="content-photo">
      <Image src={src} alt={alt} width={900} height={600} priority={priority} sizes="(max-width: 760px) 100vw, 720px" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
