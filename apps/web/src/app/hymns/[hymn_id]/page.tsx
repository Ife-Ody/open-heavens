import { hymns } from "src/app/content/hymns";
import HymnPageClient from "./page-client";
import { constructMetadata, truncate } from "@repo/utils";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ hymn_id: string }>;
}) => {
  const { hymn_id } = await params;
  const hymn = hymns.find((hymn) => hymn.id === parseInt(hymn_id));
  return constructMetadata({
    title: truncate(
      `Hymn ${hymn?.hymn_number} - ${hymn?.title} - Open Heavens Hymn`,
      60,
    ) as string,
    description: truncate(hymn?.lyrics, 160) as string,
  });
};

export default async function HymnPage({
  params,
}: {
  params: Promise<{ hymn_id: string }>;
}) {
  const { hymn_id } = await params;

  return (
    <>
      <HymnPageClient hymn_id={hymn_id} />
    </>
  );
}

export async function generateStaticParams() {
  return hymns.map((hymn) => ({ hymn_id: hymn.id.toString() }));
}
