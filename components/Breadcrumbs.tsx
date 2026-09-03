import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export type Crumb = { name: string; path: string };

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <div className="wrap">
        <ol>
          {trail.map((crumb, i) => (
            <li key={crumb.path}>
              {i === trail.length - 1 ? (
                <span aria-current="page">{crumb.name}</span>
              ) : (
                <Link href={crumb.path}>{crumb.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </div>
      <JsonLd data={breadcrumbSchema(trail)} />
    </nav>
  );
}
