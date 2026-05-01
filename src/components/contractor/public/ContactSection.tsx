import { MapPin, Clock, ArrowRight, Phone, Mail } from "lucide-react";
import type { ContractorPublicProfile } from "@/types/contractor";

interface ContactSectionProps {
  profile: ContractorPublicProfile;
  brandColor: string;
  onGetQuote: () => void;
}

export function ContactSection({ profile, brandColor, onGetQuote }: ContactSectionProps) {
  return (
    <>
      {/* ── Contact section ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: brandColor }}>Contact Us</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ letterSpacing: "-0.02em" }}>
                Let's Build Something Great
              </h2>
              <p className="text-gray-500 text-[16px] leading-relaxed mb-8">
                Ready to transform your space? Tell us about your project and we'll get back to you with a detailed, no-obligation estimate.
              </p>

              <div className="space-y-5">
                {profile.location && (
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: brandColor }}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Service Area</p>
                      <p className="text-gray-500 text-sm mt-0.5">{profile.location} & surrounding areas</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: brandColor }}>
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Response Time</p>
                    <p className="text-gray-500 text-sm mt-0.5">Typically within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: brandColor }}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Get in Touch</p>
                    <p className="text-gray-500 text-sm mt-0.5">Use the quote form — we'll respond promptly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: CTA card */}
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />
              <div className="bg-white p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Request a Free Quote</h3>
                  <p className="text-gray-400 text-sm mt-1">No commitment. No spam. Just a friendly conversation.</p>
                </div>
                <ul className="space-y-3">
                  {["Free, no-obligation estimate", "Response within 24 hours", `Serving ${profile.location || "your area"}`, "Transparent pricing"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[14px] text-gray-700">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ backgroundColor: brandColor }}>✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetQuote}
                  className="w-full py-4 rounded-xl text-white font-black text-[15px] flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:scale-[1.01] focus:outline-none shadow-xl"
                  style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}44` }}>
                  Get My Free Quote <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-center text-xs text-gray-300">We'll only contact you about your project.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark footer ── */}
      <footer style={{ backgroundColor: "#1a0533" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {profile.logo_url ? (
                  <img src={profile.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: brandColor }}>
                    {profile.company.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-black text-white text-lg">{profile.company}</span>
              </div>
              {profile.tagline && <p className="text-white/50 text-sm leading-relaxed">{profile.tagline}</p>}
              {profile.location && (
                <div className="flex items-center gap-1.5 mt-3 text-white/40 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</p>
              <ul className="space-y-2">
                {["About Us", "Services", "Portfolio", "Reviews", "Contact Us"].map((label) => (
                  <li key={label}>
                    <button
                      onClick={() => document.getElementById(label.toLowerCase().replace(" ", ""))?.scrollIntoView({ behavior: "smooth" })}
                      className="text-white/60 hover:text-white text-sm transition-colors focus:outline-none"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Get Started</p>
              <p className="text-white/60 text-sm mb-4">Ready to start your project? Get a free quote today.</p>
              <button onClick={onGetQuote}
                className="px-6 py-2.5 rounded-lg text-white font-bold text-sm transition-all hover:opacity-90 focus:outline-none"
                style={{ backgroundColor: brandColor }}>
                Request a Quote
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/30">
            <span>© {new Date().getFullYear()} {profile.company}. All rights reserved.</span>
            <a href="https://homieai.ca" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white/60 transition-colors">
              Powered by <span className="font-black" style={{ color: brandColor }}>Homie AI</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
