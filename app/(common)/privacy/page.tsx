import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Friends of Raleigh Greenway Scavenger Hunt',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date: March 1, 2026</strong>
      </p>

      <p className="text-muted-foreground">
        Friends of the Raleigh Greenway (&quot;FRoG&quot;, &quot;we&quot;, &quot;our&quot;, or
        &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use,
        and protect information when you use our scavenger hunt website and mobile application
        (the &quot;Services&quot;). Our Services are operated in the United States by Friends of
        the Raleigh Greenway, a North Carolina nonprofit organization.
      </p>

      {/* Information We Collect */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>

        <p className="text-muted-foreground">
          <strong>Account Information:</strong> When you create an account, we may collect your
          name, email address, and any profile information you choose to provide.
        </p>

        <p className="text-muted-foreground">
          <strong>Hunt Activity:</strong> When you participate in a scavenger hunt, we collect the
          hunts you join, items you complete, submissions you upload (such as photos and optional
          comments), and timestamps of participation.
        </p>

        <p className="text-muted-foreground">
          <strong>Location Information (Optional):</strong> If you allow location access, we may
          collect geographic coordinates and device-reported accuracy at the time of a hunt
          submission. Location data is collected only to help verify participation. We do not use
          location data for tracking, marketing, or advertising.
        </p>

        <p className="text-muted-foreground">
          <strong>Technical Information:</strong> We may collect limited technical data such as
          device type, browser type, operating system, and basic usage information to maintain and
          improve the Services.
        </p>

        <p className="text-muted-foreground">
          <strong>Push Notifications (Mobile App Only):</strong> If you enable push notifications,
          your device may generate a notification token through our provider (such as Firebase
          Cloud Messaging). This allows us to send event-related updates. You may disable
          notifications at any time in your device settings.
        </p>
      </section>

      {/* How We Use Information */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>

        <p className="text-muted-foreground">
          We use information to operate scavenger hunts, verify participation, maintain account
          security, send important event-related updates, improve the user experience, and generate
          aggregated, de-identified reports for planning future events.
        </p>

        <p className="text-muted-foreground">
          We do <strong>not</strong> sell your personal information and we do <strong>not</strong>{' '}
          use your information for advertising.
        </p>
      </section>

      {/* Photos & Content */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Photo and Submission Content</h2>

        <p className="text-muted-foreground">
          Photos and other content you upload are stored so they can be reviewed, verified, and
          tallied for hunt purposes.
        </p>

        <p className="text-muted-foreground">
          By submitting content, you confirm that you have the right to share it and that it does
          not violate any laws or rights of others. We reserve the right to remove content that is
          inappropriate, unlawful, or inconsistent with the spirit of the event.
        </p>
      </section>

      {/* Sharing */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Sharing of Information</h2>

        <p className="text-muted-foreground">
          We may share limited information with trusted service providers that help us operate the
          Services, such as hosting providers, database providers, email services, and push
          notification services. These providers may only use information as necessary to perform
          services for us.
        </p>

        <p className="text-muted-foreground">
          We may also disclose information if required by law or to protect the safety and
          integrity of our participants and organization.
        </p>
      </section>

      {/* Retention */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Data Retention</h2>

        <p className="text-muted-foreground">
          We retain personal information only as long as necessary to operate the Services,
          administer scavenger hunts, and meet legal and safety obligations.
        </p>

        <p className="text-muted-foreground">
          If you delete your account using the in-app delete feature, your personal information
          will be removed from active systems within a reasonable timeframe, except where
          retention is required by law or necessary for legitimate organizational purposes such as
          fraud prevention or event recordkeeping.
        </p>
      </section>

      {/* User Rights */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Your Rights</h2>

        <p className="text-muted-foreground">
          You may request access to, correction of, or deletion of your personal information. You
          may delete your account directly within the app or contact us through our main website
          for assistance.
        </p>
      </section>

      {/* Children's Privacy */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Children’s Privacy</h2>

        <p className="text-muted-foreground">
          Our Services are not directed to children under 13. We do not knowingly collect personal
          information from children under 13 without appropriate parental involvement. If you
          believe a child has provided personal information without consent, please contact us so
          we can take appropriate action.
        </p>
      </section>

      {/* Security */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Data Security</h2>

        <p className="text-muted-foreground">
          We use reasonable administrative, technical, and physical safeguards to protect personal
          information. However, no system can be guaranteed to be completely secure.
        </p>
      </section>

      {/* US Operations */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. United States Operations</h2>

        <p className="text-muted-foreground">
          Our Services are operated in the United States. By using the Services, you understand
          that your information will be processed in the United States.
        </p>
      </section>

      {/* Changes */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>

        <p className="text-muted-foreground">
          We may update this Privacy Policy from time to time. When we do, we will revise the
          Effective Date at the top of this page. Continued use of the Services after changes are
          posted constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">11. Contact Us</h2>

        <p className="text-muted-foreground">
          If you have questions about this Privacy Policy or how your information is used, please
          contact Friends of the Raleigh Greenway through the contact information provided on our
          main website.
        </p>
      </section>
    </div>
  );
}