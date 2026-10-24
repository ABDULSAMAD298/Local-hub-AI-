import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service — LocalHub AI",
  description:
    "Read the Terms of Service governing your use of LocalHub AI's WhatsApp Business Automation platform.",
};

const LAST_UPDATED = "October 23, 2025";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <>
        <p>
          By registering for or using LocalHub AI ("<strong>Service</strong>"),
          you ("<strong>User</strong>", "<strong>you</strong>", or "
          <strong>your</strong>") agree to be bound by these Terms of Service ("
          <strong>Terms</strong>"). If you are using the Service on behalf of a
          business entity, you represent that you have authority to bind that
          entity to these Terms.
        </p>
        <p className="mt-3">
          If you do not agree to these Terms, you must not access or use the
          Service. These Terms constitute a legally binding agreement between you
          and LocalHub AI.
        </p>
      </>
    ),
  },
  {
    id: "description",
    title: "2. Description of Service",
    content: (
      <>
        <p>
          LocalHub AI provides a cloud-based Software-as-a-Service platform that
          enables businesses to automate customer communications via the{" "}
          <strong>WhatsApp Business API</strong> (provided by Meta Platforms,
          Inc.). The Service includes, but is not limited to:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>AI-powered automated replies to inbound WhatsApp messages</li>
          <li>Conversation management dashboard</li>
          <li>Media and document delivery via WhatsApp</li>
          <li>Contact management and conversation history storage</li>
          <li>Analytics and reporting</li>
        </ul>
        <p className="mt-3">
          Features may change over time. We will provide reasonable notice of
          material changes.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "3. Eligibility & Account Registration",
    content: (
      <>
        <p>To use the Service you must:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>Be at least 18 years old</li>
          <li>
            Have a valid WhatsApp Business account approved by Meta and comply
            with Meta's WhatsApp Business Terms of Service
          </li>
          <li>Provide accurate and complete registration information</li>
          <li>Maintain the security of your login credentials</li>
        </ul>
        <p className="mt-3">
          You are responsible for all activity that occurs under your account.
          Notify us immediately at{" "}
          <a
            href="mailto:shahnawaz.malbari@gmail.com"
            className="text-accent hover:underline"
          >
            shahnawaz.malbari@gmail.com
          </a>{" "}
          if you suspect unauthorised access.
        </p>
      </>
    ),
  },
  {
    id: "whatsapp-compliance",
    title: "4. WhatsApp Business API & Meta Compliance",
    content: (
      <>
        <p>
          Your use of the Service necessarily involves the WhatsApp Business API
          operated by Meta. By using LocalHub AI you agree to:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>
            Comply with{" "}
            <a
              href="https://www.whatsapp.com/legal/business-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Meta's WhatsApp Business Policy ↗
            </a>
          </li>
          <li>
            Comply with{" "}
            <a
              href="https://developers.facebook.com/policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Meta's Platform Terms ↗
            </a>
          </li>
          <li>
            Only message users who have opted in to receive communications from
            your business
          </li>
          <li>
            Not use the Service to send spam, unsolicited messages, or content
            that violates Meta's messaging policies
          </li>
          <li>
            Not send messages that are deceptive, misleading, harmful, or
            illegal
          </li>
          <li>
            Honour opt-out requests from end users promptly (within 24 hours)
          </li>
        </ul>
        <p className="mt-3 rounded-lg border border-[#1a2f52] bg-[#0d1526] px-4 py-3 text-sm text-text-secondary">
          <strong className="text-text-primary">Important:</strong> Violation of
          Meta's policies may result in your WhatsApp Business Account being
          restricted or terminated by Meta, independent of any action taken by
          LocalHub AI.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "5. Acceptable Use Policy",
    content: (
      <>
        <p>You agree <strong>not</strong> to use the Service to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>
            Transmit any content that is unlawful, harassing, defamatory,
            obscene, or discriminatory
          </li>
          <li>
            Violate any applicable local, national, or international law or
            regulation
          </li>
          <li>
            Send bulk unsolicited messages ("spam") or operate in ways that
            violate anti-spam laws
          </li>
          <li>
            Reverse engineer, decompile, or attempt to extract source code from
            the Service
          </li>
          <li>
            Resell or sublicense the Service without our written consent
          </li>
          <li>
            Attempt to gain unauthorised access to our systems or other users'
            accounts
          </li>
          <li>
            Use the Service for any purpose that infringes third-party
            intellectual property rights
          </li>
        </ul>
        <p className="mt-3">
          We reserve the right to suspend or terminate your access immediately
          for any violation of this Acceptable Use Policy.
        </p>
      </>
    ),
  },
  {
    id: "ai-generated-content",
    title: "6. AI-Generated Content",
    content: (
      <>
        <p>
          The Service uses artificial intelligence (powered by OpenAI) to
          generate automated message replies on your behalf. You acknowledge
          and agree that:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>
            AI-generated responses may occasionally contain errors,
            inaccuracies, or inappropriate content
          </li>
          <li>
            You are solely responsible for reviewing and supervising
            AI-generated messages sent to your customers
          </li>
          <li>
            LocalHub AI does not guarantee the accuracy, completeness, or
            fitness for purpose of AI-generated content
          </li>
          <li>
            You will not use AI features to deceive end users into believing
            they are conversing with a human without appropriate disclosure
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "subscription-billing",
    title: "7. Subscription & Billing",
    content: (
      <>
        <p>
          The Service is provided on a subscription basis. By subscribing, you
          authorise us (or our payment processor) to charge your payment method
          on a recurring basis at the frequency selected during sign-up.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-secondary">
          <li>
            Prices are listed in USD and are exclusive of applicable taxes
          </li>
          <li>
            Subscriptions auto-renew unless cancelled before the renewal date
          </li>
          <li>
            You may cancel your subscription at any time from your dashboard;
            cancellation takes effect at the end of the current billing period
          </li>
          <li>
            We reserve the right to change pricing with 30 days' advance notice
          </li>
        </ul>
        <p className="mt-3">
          WhatsApp messaging costs (charged by Meta per conversation) are
          separate from our subscription fee and billed directly by Meta.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "8. Refund Policy",
    content: (
      <>
        <p>
          Subscription fees are generally non-refundable. However, if you
          experience a material service failure caused solely by LocalHub AI, you
          may request a pro-rated refund within{" "}
          <strong>14 days</strong> of the issue by contacting{" "}
          <a
            href="mailto:shahnawaz.malbari@gmail.com"
            className="text-accent hover:underline"
          >
            shahnawaz.malbari@gmail.com
          </a>
          . Refunds are issued at our sole discretion.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual Property",
    content: (
      <>
        <p>
          LocalHub AI and its licensors own all right, title, and interest in the
          Service, including all software, design, trademarks, and content
          created by us. Nothing in these Terms transfers any ownership to you.
        </p>
        <p className="mt-3">
          You retain ownership of any data, content, or materials you upload
          to the Service ("<strong>Your Content</strong>"). You grant LocalHub AI
          a limited, non-exclusive, royalty-free licence to process Your Content
          solely as necessary to provide the Service.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "10. Disclaimers",
    content: (
      <>
        <p>
          THE SERVICE IS PROVIDED "<strong>AS IS</strong>" AND "
          <strong>AS AVAILABLE</strong>" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, LOCALHUB
          AI DISCLAIMS ALL WARRANTIES INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="mt-3">
          We do not warrant that the Service will be uninterrupted, error-free,
          or free of harmful components. We are not responsible for any
          disruption to the Service caused by Meta, OpenAI, or other third-party
          providers outside our reasonable control.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "11. Limitation of Liability",
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LOCALHUB AI'S
          AGGREGATE LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF OR RELATING TO
          THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE FEES PAID BY YOU TO
          LOCALHUB AI IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
        </p>
        <p className="mt-3">
          IN NO EVENT SHALL LOCALHUB AI BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
          DATA, OR BUSINESS OPPORTUNITIES, EVEN IF ADVISED OF THE POSSIBILITY OF
          SUCH DAMAGES.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "12. Termination",
    content: (
      <>
        <p>
          Either party may terminate these Terms at any time. We may suspend or
          terminate your access immediately, without notice, if we reasonably
          believe you have violated these Terms, applicable law, or Meta's
          platform policies.
        </p>
        <p className="mt-3">
          Upon termination, your right to use the Service ceases. We will
          retain and delete your data in accordance with our{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "13. Governing Law & Disputes",
    content: (
      <>
        <p>
          These Terms are governed by the laws applicable in the jurisdiction
          in which LocalHub AI is registered. Any disputes shall first be
          attempted to be resolved through good-faith negotiation. If unresolved,
          disputes shall be submitted to binding arbitration or the competent
          courts of the applicable jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "14. Changes to Terms",
    content: (
      <>
        <p>
          We may update these Terms from time to time. We will notify you of
          material changes by email or in-app notification at least{" "}
          <strong>14 days</strong> before they take effect. Continued use of
          the Service after the effective date constitutes acceptance of the
          updated Terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "15. Contact",
    content: (
      <>
        <p>For any questions about these Terms, please contact:</p>
        <div className="mt-4 rounded-xl border border-[#1a2f52] bg-[#0d1526] p-5">
          <p className="font-semibold text-text-primary">LocalHub AI</p>
          <p className="mt-1 text-text-secondary">
            Email:{" "}
            <a
              href="mailto:shahnawaz.malbari@gmail.com"
              className="text-accent hover:underline"
            >
              shahnawaz.malbari@gmail.com
            </a>
          </p>
        </div>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#1a2f52] py-20 sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,198,255,0.12) 0%, transparent 70%)",
            }}
          />
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
              Legal
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-text-secondary">
              Last updated:{" "}
              <time dateTime="2025-10-23">{LAST_UPDATED}</time>
            </p>
            <p className="mt-3 text-base text-text-secondary">
              Please read these Terms carefully before using LocalHub AI.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          {/* Table of contents */}
          <nav
            aria-label="Table of contents"
            className="mb-12 rounded-xl border border-[#1a2f52] bg-[#0d1526] p-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-text-secondary">
              Contents
            </h2>
            <ol className="space-y-2 text-sm text-text-secondary">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-14 text-[15px] leading-relaxed text-text-secondary">
            {sections.map((s) => (
              <article key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="mb-3 text-xl font-semibold text-text-primary">
                  {s.title}
                </h2>
                {s.content}
              </article>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-[#1a2f52] bg-[#0d1526] p-8 text-center">
            <p className="text-text-secondary">
              Questions about our Terms of Service?
            </p>
            <a
              href="mailto:shahnawaz.malbari@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-[#001018] transition-colors hover:bg-accent-hover"
            >
              Contact Us
            </a>
            <p className="text-sm text-text-muted">
              Also see our{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
