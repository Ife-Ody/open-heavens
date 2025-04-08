import { constructMetadata } from "@repo/utils";
import { BibleReader } from "./bible-reader";

export const metadata = constructMetadata({
  title: "Open Heavens App - Bible",
  description:
    "Read the Bible online with the Open Heavens App. You can search the scriptures easily and read different bible version",
});

export default async function BiblePage() {
  return <BibleReader />;
}
