import { constructMetadata } from "@repo/utils";
import { BibleReader } from "./bible-reader";

export const metadata = constructMetadata({
  title: "Open Heavens App - Bible",
});

export default async function BiblePage() {
  return <BibleReader />;
}
