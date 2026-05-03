import { useNavigate } from "react-router-dom";
import { ImotionLogo } from "@/components/brand/ImotionLogo";

const columns = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/solutions" },
      { label: "Tarifs", href: "/pricing" },
      { label: "Démo", href: "/audit-gratuit" },
      { label: "Roadmap", href: "/how-it-works" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/audit-methodologie" },
      { label: "FAQ", href: "/faq" },
      { label: "Centre d'aide", href: "/guide/support" },
    ],
  },
  {
    title: "Société",
    links: [
      { label: "À propos", href: "/solutions" },
      { label: "Contact", href: "/contact" },
      { label: "Mentions légales", href: "/legal/mentions" },
      { label: "RGPD", href: "/legal/rgpd" },
    ],
  },
];

export const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer
      className="relative overflow-hidden bg-[hsl(var(--ink-900))] text-[hsl(var(--ink-50))]"
      id="contact"
      style={{ fontFamily: "'General Sans', Inter, sans-serif" }}
    >
      {/* Top flame accent line */}
      <div className="h-[3px] w-full" style={{ backgroundImage: "var(--gradient-flame)" }} />

      {/* Ambient flame glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(50% 100% at 80% 0%, hsl(var(--amber-500)/0.18) 0%, transparent 70%), radial-gradient(40% 100% at 15% 0%, hsl(var(--coral-600)/0.15) 0%, transparent 70%)",
        }}
      />

      <div className="container relative mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="cursor-pointer" onClick={() => navigate("/")}>
              <ImotionLogo tone="light" showTagline />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[hsl(var(--ink-300))]">
              L'IA qui transforme vos idées en cahiers des charges professionnels — gratuitement, en 45 minutes.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--ink-700))] bg-[hsl(var(--ink-800)/0.6)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--ink-200))] backdrop-blur">
              <span className="h-2 w-2 rounded-full" style={{ backgroundImage: "var(--gradient-flame)" }} />
              Creator Studio · v2
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--ink-400))]">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                    >
                      <span
                        className="h-px w-0 transition-all group-hover:w-3"
                        style={{ backgroundImage: "var(--gradient-flame)" }}
                      />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div className="md:col-span-2">
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--ink-400))]">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@imotion-conseil.fr"
                  className="text-sm font-medium text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                >
                  contact@imotion-conseil.fr
                </a>
              </li>
              <li>
                <a
                  href="/legal/cgu"
                  className="text-sm font-medium text-[hsl(var(--ink-100))] transition-colors hover:text-[hsl(var(--coral-400))]"
                >
                  CGU
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[hsl(var(--ink-700))] pt-6 md:flex-row md:items-center">
          <p className="text-xs text-[hsl(var(--ink-400))]">
            © 2026 IMOTION — AI No-Code Solutions
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--ink-500))]">
            Designed in France · Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
};
