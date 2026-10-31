import type { Metadata } from "next";
import LegalLayout, { LEGAL, type LegalSection } from "../../component/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy | Empavai",
  description:
    "How Empavai collects, uses and protects your personal information when you browse, enquire or order from us.",
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <>
        <p className="lg-p">
          Empavai (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) respects your privacy.
          This policy explains what personal information we collect when you visit empavai.com,
          submit an inquiry or place an order, how we use it, and the choices you have.
        </p>
        <p className="lg-p">
          By using our website or contacting us, you acknowledge the practices described here.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <h3 className="lg-h3">Information you give us</h3>
        <ul className="lg-ul">
          <li>
            <strong>Inquiry form:</strong> your name, email address, inquiry type and the message
            you write
          </li>
          <li>
            <strong>Orders:</strong> delivery and billing address, phone number, order details and
            any customisation or commission requirements
          </li>
          <li>
            <strong>Support:</strong> messages, photographs and videos you send by email or
            WhatsApp, for example when reporting a damaged item
          </li>
        </ul>
        <h3 className="lg-h3">Information collected automatically</h3>
        <ul className="lg-ul">
          <li>Device, browser type and operating system</li>
          <li>IP address and approximate location</li>
          <li>Pages visited, time spent and referring website</li>
        </ul>
        <div className="lg-callout">
          <strong>Payments:</strong> card and payment details are handled by our payment provider.
          Empavai does not store your full card number.
        </div>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: (
      <>
        <p className="lg-p">We use your information to:</p>
        <ul className="lg-ul">
          <li>Respond to inquiries, acquisition requests and commission discussions</li>
          <li>Process, deliver and support your orders</li>
          <li>Handle returns, exchanges, refunds and damage claims</li>
          <li>Improve our website, products and customer experience</li>
          <li>Prevent fraud and keep our website secure</li>
          <li>Meet legal and regulatory obligations</li>
        </ul>
        <p className="lg-p">
          We only send marketing messages where you have asked to receive them, and you can opt out
          at any time.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p className="lg-p">
        Our website uses cookies and similar technologies to keep the site working, remember your
        preferences and understand how visitors use it. You can control or delete cookies through
        your browser settings. Blocking some cookies may affect how parts of the site work.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Sharing Your Information",
    body: (
      <>
        <p className="lg-p">
          <strong>We do not sell your personal information.</strong> We share it only with trusted
          parties who help us run the business, and only as much as they need:
        </p>
        <ul className="lg-ul">
          <li>Payment providers to process your payment</li>
          <li>Couriers and delivery partners to deliver your order</li>
          <li>Hosting, email and analytics providers that support our website</li>
          <li>Authorities or advisers where required by law or to protect our legal rights</li>
        </ul>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International Transfers",
    body: (
      <p className="lg-p">
        Empavai ships worldwide, and some of our service providers operate in other countries.
        Your information may therefore be processed outside your country of residence. Where this
        happens, we take reasonable steps to make sure it is handled with appropriate protection.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How Long We Keep Information",
    body: (
      <p className="lg-p">
        We keep personal information only as long as needed for the purposes above, including to
        meet accounting, tax, warranty and legal requirements. Inquiry messages are kept for as
        long as needed to deal with your request and any follow-up. After that, we delete or
        anonymise the information.
      </p>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p className="lg-p">
        We use reasonable technical and organisational measures to protect your information from
        loss, misuse and unauthorised access. No online system is completely secure, so we cannot
        guarantee absolute security.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: (
      <>
        <p className="lg-p">
          Subject to applicable data-protection laws, including the UAE Personal Data Protection
          Law (Federal Decree-Law No. 45 of 2021) where it applies, you may have the right to:
        </p>
        <ul className="lg-ul">
          <li>Ask what personal information we hold about you and request a copy</li>
          <li>Ask us to correct inaccurate or incomplete information</li>
          <li>Ask us to delete your information, where we no longer need it</li>
          <li>Object to or restrict certain uses, and withdraw consent you have given</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <p className="lg-p">
          To exercise any of these rights, contact us using the details below. We may need to
          verify your identity before acting on a request.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p className="lg-p">
        Our website and products are intended for adults. We do not knowingly collect personal
        information from children. If you believe a child has given us their information, please
        contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: (
      <p className="lg-p">
        We may update this policy from time to time. The latest version will always be on this
        page, with the &ldquo;Last updated&rdquo; date revised.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <>
        <p className="lg-p">
          For privacy questions or requests, contact us at <strong>{LEGAL.email}</strong> or on
          WhatsApp at <strong>{LEGAL.whatsapp}</strong>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      titleLead="Privacy"
      titleEm="Policy."
      intro="Your trust matters to us. This policy explains what information Empavai collects, why we collect it, and how we look after it."
      sections={sections}
      otherHref="/terms-of-use"
      otherLabel="Terms of Use"
    />
  );
}