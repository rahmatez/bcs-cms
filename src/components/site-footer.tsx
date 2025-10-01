export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-900 text-neutral-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">© {new Date().getFullYear()} Brigata Curva Sud. All rights reserved.</p>
        <nav className="flex gap-4 text-sm">
          <a href="/pages/privacy" className="hover:text-primary">
            Privacy Policy
          </a>
          <a href="/pages/terms" className="hover:text-primary">
            Terms
          </a>
          <a href="mailto:halo@bcs.id" className="hover:text-primary">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
