import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>

          <p className="text-sm text-foreground">
            © 2026 Giveaway4You. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
