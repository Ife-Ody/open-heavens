import { constructMetadata } from "@repo/utils";

export const metadata = constructMetadata({
  title: "Privacy Policy - Open Heavens",
  description:
    "How the Open Heavens website and iOS app handle your data. The iOS app collects no personal data.",
});

const LAST_UPDATED = "31 October 2026";
const CONTACT_EMAIL = "i.odubela@gmail.com";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl p-4 mx-auto">
      <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Last updated {LAST_UPDATED}
      </p>

      <div className="space-y-6 text-sm leading-6">
        <p>
          Open Heavens is a free, open-source reader for the Open Heavens daily
          devotional, the Bible and a collection of hymns. It is published by
          Oxygne Media Ltd and is available as a website (openheavens.app) and
          as an iOS app. This policy explains what each of them does with your
          data.
        </p>

        <section>
          <h2 className="text-lg font-semibold mb-2">iOS app</h2>
          <p>
            The iOS app does not collect, store or share any personal data. It
            has no accounts, no sign-in and no analytics. Devotionals, hymns and
            all Bible versions are bundled inside the app, so reading works
            entirely offline. Your settings (text size and appearance) are kept
            on your device only.
          </p>
          <p className="mt-2">
            Each hymn page can show an embedded YouTube video. When you play a
            video, it is loaded from YouTube and YouTube&apos;s own privacy
            policy applies to that playback. No video loads until you choose to
            play it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <p>
            The website uses privacy-friendly product analytics (PostHog) to
            understand which pages are read and to keep the site working well.
            This records page views and basic technical information such as
            browser type and approximate region. It may also use the Meta Pixel
            to measure the reach of our posts. You can block either with a
            content blocker or by disabling cookies; the site keeps working.
          </p>
          <p className="mt-2">
            The website does not ask you to create an account and does not sell
            your data to anyone.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>YouTube (hymn videos, website and iOS app)</li>
            <li>PostHog and Meta Pixel (website analytics only)</li>
            <li>Vercel (website hosting)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Children</h2>
          <p>
            Our services are suitable for all ages and do not knowingly collect
            personal information from anyone, including children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Changes and contact</h2>
          <p>
            If this policy changes we will update this page and the date above.
            Questions about privacy can be sent to{" "}
            <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
