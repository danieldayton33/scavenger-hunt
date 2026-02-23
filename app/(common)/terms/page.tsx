import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | Friends of Raleigh Greenway Scavenger Hunt',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Terms of Use</h1>
      <p className="text-muted-foreground">
        These Terms of Use govern your participation in the Friends of the Raleigh Greenway
        (&quot;FRoG&quot;) scavenger hunt and your use of this website. By creating an account,
        joining a hunt, or submitting clues, you agree to these terms.
      </p>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Participation</h2>
        <p className="text-muted-foreground">
          You agree to follow all posted rules for each hunt, respect other participants, and use
          the greenway safely and responsibly. Please stay on designated paths, follow local laws,
          and be mindful of other trail users.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Content and submissions</h2>
        <p className="text-muted-foreground">
          You retain ownership of photos and other content you submit but grant FRoG a
          non-exclusive license to store and use that content for running the hunt, reviewing
          entries, and celebrating the event (for example, in communications or highlight reels),
          consistent with our mission.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Disclaimer</h2>
        <p className="text-muted-foreground">
          This site and the scavenger hunt are provided &quot;as is&quot; without warranties of any
          kind. Outdoor activities involve inherent risks; you are responsible for your own safety
          and judgment while participating.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Changes</h2>
        <p className="text-muted-foreground">
          We may update these terms from time to time to reflect changes in the site or in
          applicable law. Continued use of the site after changes become effective means you accept
          the updated terms.
        </p>
      </section>
    </div>
  );
}

