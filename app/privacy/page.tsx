import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | Giveaway4You",
  description: "Privacy Policy for Giveaway4You Discord Bot",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-sm text-foreground mb-12">Last updated: May 16, 2026</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">1. Information We Collect</h2>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                We may collect and store:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li>Discord user IDs and usernames</li>
                <li>Server IDs</li>
                <li>Premium subscription status</li>
                <li>Redemption code usage records</li>
                <li>Payment-related identifiers such as Stripe customer and subscription IDs</li>
                <li>Basic usage and diagnostic logs</li>
              </ul>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                {"We do not store full payment card details. Payments are processed by "}
                <a href="https://stripe.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe</a>
                {" in accordance with "}
                <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>
                {"."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">2. How We Use Information</h2>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li>Operate and improve the Bot</li>
                <li>Provide Premium features</li>
                <li>Process and verify subscriptions</li>
                <li>Prevent fraud and abuse</li>
                <li>Respond to support requests</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">3. Data Storage</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"Data may be stored in "}
                <a href="https://www.mongodb.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">MongoDB</a>
                {" or other secure hosting providers."}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">4. Data Sharing</h2>
              <p className="text-sm text-foreground leading-relaxed mb-3">
                We do not sell your personal information. We may share information only with trusted service providers such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground leading-relaxed">
                <li><a href="https://discord.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Discord</a></li>
                <li><a href="https://stripe.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe</a></li>
                <li>Hosting and database providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">5. Data Retention</h2>
              <p className="text-sm text-foreground leading-relaxed">
                We retain information only as long as necessary to provide the Service, maintain records, resolve disputes, and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">6. Your Rights</h2>
              <p className="text-sm text-foreground leading-relaxed">
                Depending on your location, you may have rights to access, correct, or request deletion of your personal data. Contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">7. Security</h2>
              <p className="text-sm text-foreground leading-relaxed">
                We implement reasonable technical and organizational measures to protect your information, but no system is completely secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">8. {"Children's"} Privacy</h2>
              <p className="text-sm text-foreground leading-relaxed">
                The Service is not directed to children under the minimum age required to use Discord in their jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">9. International Users</h2>
              <p className="text-sm text-foreground leading-relaxed">
                Your information may be processed in countries other than your own.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">10. Changes to This Policy</h2>
              <p className="text-sm text-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. Continued use of the Service after updates constitutes acceptance of the revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-primary mb-3">11. Contact</h2>
              <p className="text-sm text-foreground leading-relaxed">
                {"For privacy-related questions or requests, please contact us through our "}
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
