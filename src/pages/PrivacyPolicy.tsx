import CmsPageRenderer from "@/components/cms/CmsPageRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Fallback = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        <div className="max-w-4xl mx-auto space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Introduction</h2>
            <p className="leading-relaxed">
              At Homie AI, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our service.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Contact Us</h2>
            <p className="leading-relaxed">If you have any questions, please contact us at privacy@homieai.com.</p>
          </section>
          <p className="text-sm text-gray-500 mt-8">Last updated: April 13, 2025</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const PrivacyPolicy = () => <CmsPageRenderer slug="privacy-policy" fallback={<Fallback />} />;
export default PrivacyPolicy;
