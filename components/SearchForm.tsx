"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchForm({
  initialQuery = "",
  label = "Search Georgia tutoring centers",
}: {
  initialQuery?: string;
  label?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  return (
    <form
      className="search-form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = value.trim();
        if (!query) return;
        router.push(`/search/${encodeURIComponent(query.toLowerCase())}`);
      }}
    >
      <label className="skip-link" htmlFor="site-search">
        {label}
      </label>
      <input
        id="site-search"
        type="search"
        name="q"
        placeholder="Try math tutoring, Savannah, or SAT prep"
        aria-label={label}
        value={value}
        maxLength={80}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="btn" type="submit">
        Search
      </button>
    </form>
  );
}
