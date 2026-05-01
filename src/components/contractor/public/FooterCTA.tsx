interface FooterCTAProps {
  onGetQuote: () => void;
  brandColor: string;
  companyName: string;
}

export function FooterCTA({ onGetQuote, brandColor, companyName }: FooterCTAProps) {
  return (
    <section
      className="py-16 text-white text-center"
      style={{ backgroundColor: brandColor }}
    >
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold mb-3">
          Ready to start your project?
        </h2>
        <p className="text-white/80 mb-8 text-lg">
          Get in touch with {companyName} today.
        </p>
        <button
          onClick={onGetQuote}
          className="px-10 py-3 rounded-full font-bold text-base border-2 border-white text-white hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          style={{ "--tw-ring-offset-color": brandColor } as React.CSSProperties}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = brandColor;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
        >
          Get a Quote
        </button>
      </div>
    </section>
  );
}
