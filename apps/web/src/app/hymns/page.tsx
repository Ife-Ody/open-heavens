import { hymns as defaultHymns } from "../content/hymns";
import SearchHeader from "./components/SearchHeader";
import HymnCard from "./components/HymnCard";
import { constructMetadata } from "@repo/utils";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = constructMetadata({
  title: "Hymns Directory - Open Heavens Hymn",
  description:
    "These are the hymns available in the Open Heavens App. You can search for hymns by title or number. You can also search for hymns by the lyrics.",
});

export default async function HymnsListPage({ searchParams }: PageProps) {
  // Get the search term, ensuring it's a string
  const params = await searchParams;
  const searchTerm = typeof params.q === "string" ? params.q : "";

  // In a real app, you would fetch this from your API
  // For now, we'll use the default hymns and filter them
  const hymns = defaultHymns;

  const filteredHymns = hymns
    .filter((hymn) => {
      const titleMatch = hymn.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const numberMatch = hymn.hymn_number.toString().includes(searchTerm);
      return titleMatch || numberMatch;
    })
    .sort((a, b) => a.hymn_number - b.hymn_number);

  return (
    <div className="max-w-4xl p-4 mx-auto">
      <SearchHeader />
      <div className="grid gap-4">
        {filteredHymns.map((hymn) => (
          <HymnCard key={hymn.id} hymn={hymn} />
        ))}
      </div>
    </div>
  );
}
