import Link from "next/link";

const siteLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Bible",
    href: "/bible",
  },
  {
    label: "Hymns",
    href: "/hymns",
  },
  {
    label: "Open Heavens Daily Devotional",
    href: "/",
  },
];

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-wrap gap-4">
            {siteLinks.map((link, index) => (
              <Link
                key={link.href+index}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Open Heavens App
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Powered by{" "}
            <a
              href="https://oxygne.com"
              className="hover:text-primary"
            >
              Oxygne
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
