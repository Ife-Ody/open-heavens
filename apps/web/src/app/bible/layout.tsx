import { BibleProvider } from "../context/bible-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BibleProvider>
      <div className="h-full">{children}</div>
    </BibleProvider>
  );
}
