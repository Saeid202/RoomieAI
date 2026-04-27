import CmsPageRenderer from "@/components/cms/CmsPageRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Fallback = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Safety Center</h1>
        <div className="max-w-4xl mx-auto space-y-8 text-gray-700">
          <p className="text-xl text-center">Your safety is our top priority.</p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Safety Tips</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Meet in public places for your first few meetings</li>
              <li>Inform a friend or family member about your meeting details</li>
              <li>Trust your instincts — if something feels wrong, don't proceed</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const SafetyCenter = () => <CmsPageRenderer slug="safety-center" fallback={<Fallback />} />;
export default SafetyCenter;
