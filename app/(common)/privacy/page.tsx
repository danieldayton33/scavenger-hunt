import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Friends of Raleigh Greenway Scavenger Hunt',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-muted-foreground">
        Friends of the Raleigh Greenway (&quot;FRoG&quot;) cares about your privacy. This scavenger
        hunt site collects only the information needed to run the event, communicate with
        participants, and improve the experience.
      </p>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <p className="text-muted-foreground">
          We may collect basic account details (such as your name and email), your hunt activity
          (for example which hunts you join and completed clues), and limited technical information
          like your device and browser. If you upload photos or other submissions as part of a hunt,
          those are stored so that they can be reviewed and tallied.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How we use your information</h2>
        <p className="text-muted-foreground">
          Information is used to operate the scavenger hunt, keep your account secure, send
          important updates about events, and understand how the site is being used so we can
          improve it. We may also use aggregated, de-identified information for reporting and
          planning future events.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sharing and retention</h2>
        <p className="text-muted-foreground">
          We do not sell your personal information. Limited information may be shared with trusted
          service providers who help us operate this site (for example, hosting and email). We keep
          your information only as long as necessary to provide the service and meet our legal and
          safety obligations.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Questions</h2>
        <p className="text-muted-foreground">
          If you have questions about this policy or how your information is used, please contact
          Friends of the Raleigh Greenway through the contact information on our main website.
        </p>
      </section>
    </div>
  );
}

