
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Users, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";

const SafetyCenter = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Safety Center</h1>

          <div className="max-w-4xl mx-auto space-y-12">
            <section className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-roomie-purple/10 rounded-full mb-4">
                <Shield className="w-10 h-10 text-roomie-purple" />
              </div>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Your safety is our top priority. We've implemented various features and protocols
                to ensure you have a secure experience while using Roomie AI.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Profile Verification
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We verify user identities through multiple methods to ensure you're connecting with real people:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Email verification for all new accounts</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Optional phone number verification for enhanced trust</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Social media account linking to confirm identity</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Photo verification option to prevent catfishing</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <AlertCircle className="w-6 h-6 mr-2" />
                Safety Tips for Meeting Potential Roommates
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  When meeting potential roommates or co-investors in person:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Meet in public places for your first few meetings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Inform a friend or family member about your meeting details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Use our in-app messaging system before sharing personal contact information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Trust your instincts—if something feels wrong, don't proceed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Consider video chatting before meeting in person</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                Reporting & Support
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you encounter any issues or concerns:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Use the "Report" button on any profile to flag suspicious activity</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Contact our support team at safety@roomieai.com</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Our safety team reviews all reports within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">For emergencies, always contact your local authorities first</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Have questions about safety on Roomie AI?
              </p>
              <a
                href="mailto:safety@roomieai.com"
                className="inline-flex items-center px-6 py-3 bg-roomie-purple text-white rounded-full hover:bg-roomie-dark transition-colors"
              >
                Contact Our Safety Team
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SafetyCenter;
