interface StickyMobileCTAProps {
  onGetQuote: () => void;
  brandColor: string;
}

export function StickyMobileCTA({ onGetQuote, brandColor }: StickyMobileCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 bg-white border-t border-gray-100 shadow-lg">
      <button
        onClick={onGetQuote}
        className="w-full py-3 rounded-full text-white font-bold text-base transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ backgroundColor: brandColor }}
      >
        Get a Quote
      </button>
    </div>
  );
}
