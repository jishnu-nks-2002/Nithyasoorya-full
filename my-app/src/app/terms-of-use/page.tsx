import type { Metadata } from "next";
import LegalLayout, { LEGAL, type LegalSection } from "../../component/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use | Empavai",
  description:
    "Terms of use and the return, exchange and refund policy for Empavai handcrafted crystal art décor, bracelets and jewellery.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <>
        <p className="lg-p">
          By accessing empavai.com or placing an order with Empavai, you agree to these Terms of
          Use, including the Return, Exchange &amp; Refund Policy below. If you do not agree, please
          do not use the website or place an order.
        </p>
        <p className="lg-p">
          Every Empavai creation is handcrafted with care and individually inspected before
          dispatch. Please read these terms carefully before placing your order.
        </p>
      </>
    ),
  },
  {
    id: "handcrafted",
    title: "Handcrafted Products",
    body: (
      <>
        <p className="lg-p">
          Each artwork is individually handcrafted using natural crystals, resin, wood and other
          artistic materials. Natural variations in crystal colour, shape, inclusions, arrangement
          and texture are part of the piece&rsquo;s unique character and are not considered defects.
        </p>
        <p className="lg-p">
          Because Empavai products are handcrafted and may be one of a kind, photographs are
          indicative, and an identical replacement cannot always be guaranteed.
        </p>
      </>
    ),
  },
  {
    id: "art-decor",
    title: "Crystal Art Décor",
    body: (
      <>
        <div className="lg-callout">
          <strong>All crystal art décor purchases are final and non-returnable.</strong>
        </div>
        <p className="lg-p">This includes:</p>
        <ul className="lg-ul">
          <li>Aranyaa crystal trees</li>
          <li>Nithyasoori spiritual crystal art</li>
          <li>Terralume crystal art trays</li>
          <li>Customised or commissioned artwork</li>
          <li>Other handcrafted décor pieces</li>
        </ul>
        <p className="lg-p">Art décor cannot be returned or exchanged because of:</p>
        <ul className="lg-ul">
          <li>A change of mind</li>
          <li>Differences in natural crystal colour, shape or pattern</li>
          <li>Minor handcrafted variations</li>
          <li>
            Preference regarding size, colour or appearance where the product matches its
            description
          </li>
          <li>
            Damage caused after delivery through misuse, dropping, moisture, heat, chemicals,
            direct sunlight or improper handling
          </li>
        </ul>
        <p className="lg-p">
          This final-sale condition does not affect the customer&rsquo;s rights where an item
          arrives damaged, defective, incomplete, incorrect or materially different from its
          advertised photos or description.
        </p>
      </>
    ),
  },
  {
    id: "jewellery-returns",
    title: "Bracelets & Jewellery Returns",
    body: (
      <>
        <p className="lg-p">
          Eligible bracelets and jewellery may be returned within{" "}
          <strong>7 calendar days of delivery</strong>, subject to the conditions below.
        </p>
        <p className="lg-p">The product must be:</p>
        <ul className="lg-ul">
          <li>Unworn and unused</li>
          <li>In its original condition</li>
          <li>Returned with its original packaging, tags and accessories</li>
          <li>Free from perfume, cosmetics, scratches, alterations or other signs of use</li>
          <li>Accompanied by the order confirmation or proof of purchase</li>
        </ul>
        <p className="lg-p">
          The customer must contact Empavai before returning any product. Items sent without prior
          return authorisation may not be accepted.
        </p>

        <h3 className="lg-h3">Non-Returnable Jewellery</h3>
        <p className="lg-p">
          Unless defective, damaged or incorrectly supplied, returns will not be accepted for:
        </p>
        <ul className="lg-ul">
          <li>Personalised, customised or specially sized jewellery</li>
          <li>Bracelets altered to a requested wrist size</li>
          <li>Earrings or other hygiene-sensitive products once opened or tried on</li>
          <li>Jewellery showing signs of wear, damage or alteration</li>
          <li>Gift cards</li>
          <li>Items marked &ldquo;Final Sale&rdquo; before purchase</li>
          <li>Products returned after the permitted return period</li>
        </ul>

        <h3 className="lg-h3">Change-of-Mind Returns</h3>
        <p className="lg-p">For an approved bracelet or jewellery return:</p>
        <ul className="lg-ul">
          <li>The customer is responsible for return-delivery charges</li>
          <li>Original delivery charges are non-refundable</li>
          <li>
            The product remains the customer&rsquo;s responsibility until safely received by
            Empavai
          </li>
          <li>A secure, trackable delivery service should be used</li>
        </ul>
        <p className="lg-p">
          Empavai reserves the right to decline a return if the product does not satisfy the stated
          return conditions.
        </p>
      </>
    ),
  },
  {
    id: "damaged-items",
    title: "Damaged, Defective or Incorrect Items",
    body: (
      <>
        <p className="lg-p">Please inspect your order immediately after delivery.</p>
        <p className="lg-p">
          If any product, including crystal art décor, arrives damaged, defective, incomplete,
          incorrect or materially different from its description, contact Empavai within{" "}
          <strong>48 hours of delivery</strong>.
        </p>
        <p className="lg-p">Please provide:</p>
        <ul className="lg-ul">
          <li>Your order number</li>
          <li>Clear photographs or a video of the product</li>
          <li>Photographs of the outer and inner packaging</li>
          <li>A brief description of the issue</li>
        </ul>
        <p className="lg-p">
          Please retain the product and all packaging while the matter is reviewed.
        </p>
        <p className="lg-p">
          Where the claim is confirmed, Empavai will provide an appropriate remedy in accordance
          with applicable UAE consumer-protection requirements. This may include repair,
          replacement or refund.
        </p>
        <p className="lg-p">
          Reasonable return-delivery costs for a confirmed defective, damaged or incorrect item
          will be borne by Empavai.
        </p>
      </>
    ),
  },
  {
    id: "exchanges",
    title: "Exchanges",
    body: (
      <>
        <p className="lg-p">
          Eligible unworn bracelets and jewellery may be exchanged, subject to product
          availability.
        </p>
        <p className="lg-p">
          If the replacement product costs more, the customer must pay the difference. If it costs
          less, the balance will be refunded or provided as store credit, as agreed.
        </p>
        <p className="lg-p">
          Because Empavai products are handcrafted and may be one of a kind, an identical
          replacement cannot always be guaranteed.
        </p>
        <p className="lg-p">Crystal art décor is not eligible for a change-of-mind exchange.</p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <>
        <p className="lg-p">
          Once an eligible return has been received and inspected, Empavai will notify the customer
          whether the refund has been approved.
        </p>
        <p className="lg-p">
          Approved refunds will be issued to the original payment method within{" "}
          <strong>{LEGAL.refundDays} business days</strong>. Banks and payment providers may
          require additional time to reflect the amount in the customer&rsquo;s account.
        </p>
      </>
    ),
  },
  {
    id: "return-requests",
    title: "Return Requests",
    body: (
      <>
        <p className="lg-p">To request an eligible return or report a problem, contact:</p>
        <ul className="lg-ul">
          <li>
            <strong>Email:</strong> {LEGAL.email}
          </li>
          <li>
            <strong>WhatsApp:</strong> {LEGAL.whatsapp}
          </li>
          <li>
            <strong>Order number:</strong> Please include your order number
          </li>
        </ul>
        <div className="lg-callout">
          <strong>Please do not send any item back</strong> until you receive return authorisation
          and instructions from Empavai.
        </div>
      </>
    ),
  },
  {
    id: "customer-rights",
    title: "Customer Rights",
    body: (
      <p className="lg-p">
        Nothing in this policy limits any mandatory rights or remedies available to customers under
        applicable UAE consumer-protection laws.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <p className="lg-p">
        All content on this website, including designs, photographs, text, logos and artwork names
        such as Aranyaa, Nithyasoori and Terralume, belongs to Empavai and may not be copied,
        reproduced or used commercially without prior written permission.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <p className="lg-p">
        To the extent permitted by law, Empavai is not liable for indirect or consequential loss
        arising from the use of this website or its products. Crystal and spiritual art pieces are
        sold as decorative artworks and are not a substitute for medical, psychological or
        professional advice. Nothing in these terms excludes liability that cannot be excluded
        under applicable law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    body: (
      <p className="lg-p">
        Empavai may update these terms from time to time. The updated version will be posted on
        this page with a revised &ldquo;Last updated&rdquo; date. Orders are governed by the terms
        in force at the time of purchase.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <p className="lg-p">
        For any questions about these terms, contact us at <strong>{LEGAL.email}</strong> or on
        WhatsApp at <strong>{LEGAL.whatsapp}</strong>.
      </p>
    ),
  },
];

export default function TermsOfUsePage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      titleLead="Terms of"
      titleEm="Use."
      intro="Every Empavai creation is handcrafted with care and individually inspected before dispatch. Please read the following terms and our return, exchange and refund policy before placing your order."
      sections={sections}
      otherHref="/privacy-policy"
      otherLabel="Privacy Policy"
    />
  );
}