import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service | Giveaway4You",
  description: "Terms of Service for Giveaway4You Discord Bot",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-sm text-foreground mb-12">Last updated: May 16, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"By inviting, accessing, or using the Bot (\"Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, you must stop using the Service immediately."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">2. Description of Service</h2>
              <p className="text-sm text-foreground leading-relaxed">
                The Service is a Discord bot that provides automated features and optional Premium subscriptions that unlock additional functionality.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">3. Eligibility</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"You must comply with "}
                <a href="https://discord.com/terms" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Discord Terms of Service</a>
                {" and all applicable laws when using the Service."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">4. Premium Subscriptions</h2>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                {"Premium subscriptions are processed securely through "}
                <a href="https://stripe.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe</a>
                {". Premium access may be granted through a unique redemption code or by linking your account after purchase."}
              </p>

              <h3 className="text-sm font-semibold text-foreground mt-5 mb-2">Billing</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li>Premium subscriptions may renew automatically unless canceled.</li>
                <li>Pricing and billing intervals are displayed before purchase.</li>
                <li>Taxes may be applied where required.</li>
              </ul>

              <h3 className="text-sm font-semibold text-foreground mt-5 mb-2">Cancellation</h3>
              <p className="text-sm text-foreground leading-relaxed">
                You may cancel your subscription at any time through your Stripe customer portal or the payment interface provided at checkout. Premium access remains active until the end of the current paid billing period unless otherwise stated.
              </p>

              <h3 className="text-sm font-semibold text-foreground mt-5 mb-2">Refunds</h3>
              <p className="text-sm text-foreground leading-relaxed">
                Refunds are provided at our sole discretion unless required by applicable law.
              </p>

              <h3 className="text-sm font-semibold text-foreground mt-5 mb-2">Redemption Codes</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li>Codes are intended for single use only.</li>
                <li>Codes may not be resold, shared, or transferred unless expressly permitted.</li>
                <li>Used, expired, or invalid codes cannot be redeemed again.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">5. Acceptable Use</h2>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li>Abuse, exploit, or attempt to bypass restrictions in the Service.</li>
                <li>Reverse engineer or disrupt the Service.</li>
                <li>Use the Service for unlawful activities.</li>
                <li>Share premium access in unauthorized ways.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">6. Suspension and Termination</h2>
              <p className="text-sm text-foreground leading-relaxed">
                We may suspend or terminate access at any time for abuse, fraud, chargebacks, violations of these Terms, or technical/security reasons.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">7. Availability</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"The Service is provided on an \"as is\" and \"as available\" basis. We do not guarantee uninterrupted or error-free operation."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">8. Limitation of Liability</h2>
              <p className="text-sm text-foreground leading-relaxed">
                To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">9. Changes to the Terms</h2>
              <p className="text-sm text-foreground leading-relaxed">
                We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">10. Contact</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"For support, billing, or legal inquiries regarding the Service, please contact us through our "}
                <a href="https://discord.gg/EuWYYbHwmv" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">official Discord support server</a>
                {"."}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
