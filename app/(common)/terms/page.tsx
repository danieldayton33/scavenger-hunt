import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use | Friends of Raleigh Greenway Scavenger Hunt',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Terms of Use</h1>

      <p className="text-muted-foreground">
        <strong>Effective Date: March 1, 2026</strong>
      </p>

      <p className="text-muted-foreground">
        These Terms of Use (&quot;Terms&quot;) govern your participation in the Friends of the
        Raleigh Greenway (&quot;FRoG&quot;) scavenger hunts and your use of our website and mobile
        application (the &quot;Services&quot;). By creating an account, joining a hunt, or
        submitting content, you agree to these Terms.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Eligibility</h2>
        <p className="text-muted-foreground">
          You must be able to form a legally binding agreement to use the Services. If you are
          under 18, you may participate only with the involvement and permission of a parent or
          legal guardian. The Services are not directed to children under 13.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Participation and Safety</h2>
        <p className="text-muted-foreground">
          You agree to follow all posted rules for each hunt, respect other participants, and use
          the greenway safely and responsibly. Please stay on designated paths, follow local laws,
          obey signage, and be mindful of other trail users.
        </p>
        <p className="text-muted-foreground">
          You are responsible for your own safety and judgment while participating, including
          monitoring weather, trail conditions, and your personal limitations. If you feel unsafe,
          stop participating and seek help as appropriate.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Accounts</h2>
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your account credentials and
          for activity that occurs under your account. You agree to provide accurate information
          and to keep your account details up to date.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Fair Play and Prohibited Conduct</h2>
        <p className="text-muted-foreground">
          Please play fairly and participate in the spirit of the event. You agree not to:
        </p>
        <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
          <li>Cheat, falsify submissions, or misrepresent your participation</li>
          <li>Harass, threaten, or discriminate against other participants</li>
          <li>Damage property, disturb wildlife, or leave designated trails</li>
          <li>Upload unlawful, harmful, hateful, or inappropriate content</li>
          <li>Attempt to access or disrupt the Services, accounts, or systems without authorization</li>
        </ul>
        <p className="text-muted-foreground">
          FRoG may disqualify participants, remove content, or suspend accounts for violations of
          these Terms or posted hunt rules.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Content and Submissions</h2>
        <p className="text-muted-foreground">
          You retain ownership of photos and other content you submit (&quot;User Content&quot;).
          By submitting User Content, you grant FRoG a non-exclusive, royalty-free, worldwide
          license to host, store, reproduce, and display that content solely for purposes of
          operating the hunts, reviewing entries, reporting results, and celebrating the event in
          ways consistent with our nonprofit mission (for example, event communications, newsletters,
          or recap materials).
        </p>
        <p className="text-muted-foreground">
          You represent that you have the rights needed to submit the User Content and that it does
          not violate the rights of others. Please do not submit content containing sensitive
          personal information about yourself or others.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Location Features</h2>
        <p className="text-muted-foreground">
          Some hunts may allow or require optional location features (for example, to help verify a
          submission). If you enable location access, you understand that location information may
          be collected at the time of submission. You can disable location access in your device
          settings, but doing so may affect certain hunt features.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Disclaimers</h2>
        <p className="text-muted-foreground">
          The Services and scavenger hunts are provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, whether express or implied,
          including implied warranties of merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
        <p className="text-muted-foreground">
          Outdoor activities involve inherent risks. You assume all risks associated with
          participating, including risks related to weather, trail conditions, traffic, other users,
          and physical activity.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
        <p className="text-muted-foreground">
          To the maximum extent permitted by law, FRoG will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of data, loss of
          profits, or personal injury arising out of or related to your use of the Services or
          participation in a hunt.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Termination</h2>
        <p className="text-muted-foreground">
          You may stop using the Services at any time. FRoG may suspend or terminate access to the
          Services, remove content, or disqualify participants if we believe there has been a
          violation of these Terms, posted hunt rules, or applicable law.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">10. Governing Law</h2>
        <p className="text-muted-foreground">
          These Terms are governed by the laws of the State of North Carolina, without regard to
          conflict of law principles.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">11. Changes to These Terms</h2>
        <p className="text-muted-foreground">
          We may update these Terms from time to time to reflect changes in the Services or in
          applicable law. When we do, we will update the Effective Date above. Continued use of the
          Services after changes become effective means you accept the updated Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">12. Contact</h2>
        <p className="text-muted-foreground">
          If you have questions about these Terms, please contact Friends of the Raleigh Greenway
          through the contact information on our main website.
        </p>
      </section>
    </div>
  );
}