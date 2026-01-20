
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>

          <div className="max-w-4xl mx-auto space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Introduction</h2>
              <p className="leading-relaxed">
                At Roomie AI, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our service. Please read this policy carefully
                to understand our practices regarding your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Information We Collect</h2>
              <p className="leading-relaxed mb-4">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account and profile</li>
                <li>Complete preference questionnaires</li>
                <li>Use our matching services</li>
                <li>Communicate with other users</li>
                <li>Contact our customer support</li>
                <li>Participate in surveys or promotional activities</li>
              </ul>
              <p className="leading-relaxed mt-4">
                This information may include your name, email address, phone number, location, lifestyle preferences,
                financial information relevant to roommate or co-investment matching, and any other information you
                choose to provide.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">How We Use Your Information</h2>
              <p className="leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create and maintain your account</li>
                <li>Provide, improve, and develop our services</li>
                <li>Match you with compatible roommates or co-investors</li>
                <li>Communicate with you about our services</li>
                <li>Ensure platform safety and security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">How We Share Your Information</h2>
              <p className="leading-relaxed">
                We may share your information with other users as part of the matching process, but only to the
                extent necessary to facilitate connections. We do not sell your personal data to third parties.
                We may share information with service providers who help us operate our platform, or when required
                by law or to protect our rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Your Rights and Choices</h2>
              <p className="leading-relaxed">
                You can access, update, or delete your account information at any time through your profile settings.
                You may also have certain rights regarding your personal data, including the right to access, correct,
                or delete the data we have about you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data against
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the effective date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at privacy@roomieai.com.
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Last updated: April 13, 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
