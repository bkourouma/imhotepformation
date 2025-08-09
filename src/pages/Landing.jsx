import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, Shield, Phone, MessageCircle } from 'lucide-react';
import Button from '../components/shared/Button';
import Logo from '../components/shared/Logo';
import cegciLogo from '../assets/cegci.jpeg';
import fdfpLogo from '../assets/fdfp.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="w-full">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="white" />
            <span className="sr-only">Formations</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4">
            <a href="#features" className="text-sm text-slate-300 hover:text-white">Fonctionnalités</a>
            <a href="#about" className="text-sm text-slate-300 hover:text-white">À propos</a>
            <a href="#contact" className="text-sm text-slate-300 hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Decorative blurred gradient */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-[-10%] h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  Plateforme de formations moderne
                </div>
                <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight">
                  Développez les compétences de vos équipes, simplement
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  Une expérience fluide pour les auditeurs, les entreprises et les administrateurs. Accédez à votre espace en un clic.
                </p>

                {/* CTA buttons */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button as={Link} to="/employe/login" className="w-full justify-center h-12 text-base">
                    <Users className="h-5 w-5 mr-2" />
                    Access Auditeurs
                  </Button>
                  <Button as={Link} to="/entreprise/login" variant="secondary" className="w-full justify-center h-12 text-base">
                    <Building2 className="h-5 w-5 mr-2" />
                    Entreprise
                  </Button>
                  <Button as={Link} to="/admin/login" variant="ghost" className="w-full justify-center h-12 text-base bg-white/5 hover:bg-white/10 ring-1 ring-white/10">
                    <Shield className="h-5 w-5 mr-2" />
                    Admin
                  </Button>
                </div>

                {/* Secondary trust row */}
                <div className="mt-8 flex items-center gap-6 text-slate-400 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    Sécurisé et fiable
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    Interface moderne
                  </div>
                </div>
              </div>

              {/* Preview card */}
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur shadow-2xl">
                  <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                    <div className="h-full w-full rounded-lg border border-white/10 bg-slate-900/30 grid place-items-center">
                      <div className="text-center px-6">
                        <p className="text-lg font-semibold">Bienvenue sur votre plateforme de formations</p>
                        <p className="mt-2 text-slate-400 text-sm">Conçue spécialement pour</p>
                        <div className="mt-6 flex items-center justify-center gap-6">
                          <img
                            src={fdfpLogo}
                            alt="FDFP"
                            className="h-28 w-auto rounded bg-white/5 p-2 ring-1 ring-white/10"
                          />
                          <img
                            src={cegciLogo}
                            alt="CGECI"
                            className="h-28 w-auto rounded bg-white/5 p-2 ring-1 ring-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Pour les Auditeurs',
                desc: 'Accédez à vos formations, séances et évaluations en toute simplicité.',
              },
              {
                title: 'Pour les Entreprises',
                desc: 'Gérez vos employés, suivez les présences et les performances.',
              },
              {
                title: 'Pour les Admins',
                desc: 'Pilotez l’ensemble de la plateforme et suivez les indicateurs clés.',
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-4">
            <Phone className="h-5 w-5 text-slate-300" aria-hidden="true" />
            <MessageCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            <a
              href="https://wa.me/2250708977823"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white underline-offset-2 hover:underline"
              aria-label="Contacter via WhatsApp +225 07 08 97 78 23"
            >
              +225 07 08 97 78 23
            </a>
          </div>
          <p className="text-center">© 2025 IMHOTEP DATA. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}


