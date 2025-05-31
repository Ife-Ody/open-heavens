import Link from "next/link";
import YoutubeEmbed from "./YoutubeEmbed";
import parse, {
  HTMLReactParserOptions,
  Element,
  Text,
} from "html-react-parser";

interface HymnCardProps {
  hymn: {
    id: number;
    hymn_number: number;
    title: string;
    hymn_url: string;
    hymn_image?: string;
    lyrics?: string;
  };
}

function truncateHtml(html: string, maxLength: number): string {
  let textLength = 0;
  let truncated = false;

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (truncated) return <></>;

      if (domNode instanceof Element && domNode.children) {
        return;
      }

      if (domNode instanceof Text) {
        const text = domNode.data;
        if (textLength + text.length > maxLength) {
          const remaining = maxLength - textLength;
          domNode.data = text.slice(0, remaining) + "...";
          truncated = true;
        }
        textLength += domNode.data.length;
      }
    },
  };

  return parse(html || "", options) as string;
}

export default function HymnCard({ hymn }: HymnCardProps) {
  return (
    <Link
      key={hymn.id}
      href={`/hymns/${hymn.id}`}
      className="p-4 md:px-6 transition-colors border rounded-lg hover:bg-muted w-full"
    >
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row">
        <div className="flex-1 min-w-0">
          <span className="font-medium">#{hymn.hymn_number}</span>
          <h2 className="text-lg font-semibold">{hymn.title}</h2>
          {hymn.lyrics && (
            <div className="mt-2 text-sm text-muted-foreground">
              {truncateHtml(hymn.lyrics, 160)}
            </div>
          )}
        </div>
        <div className="w-full md:w-auto max-w-96 h-56 rounded-lg bg-black">
          <YoutubeEmbed url={hymn.hymn_url} title={hymn.title} />
        </div>
        <svg
          className="flex-shrink-0 hidden w-6 h-6 md:block text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
