import CmsPageRenderer from "@/components/cms/CmsPageRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Fallback = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Community Guidelines</h1>
        <div className="max-w-4xl mx-auto space-y-8 text-gray-700">
          <p className="text-xl text-center">
            Our community guidelines help ensure that Homie AI remains a safe, respectful, and productive platform for everyone.
          </p>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Respectful Communication</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Be courteous and kind in all interactions</li>
              <li>Respect personal boundaries and privacy</li>
              <li>Avoid offensive language, harassment, or bullying</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const CommunityGuidelines = () => <CmsPageRenderer slug="community-guidelines" fallback={<Fallback />} />;
export default CommunityGuidelines;
