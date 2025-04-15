
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, MessageSquare, ShieldCheck, XCircle } from "lucide-react";

const CommunityGuidelines = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Community Guidelines</h1>
          
          <div className="max-w-4xl mx-auto space-y-12">
            <section className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-roomie-purple/10 rounded-full mb-4">
                <Users className="w-10 h-10 text-roomie-purple" />
              </div>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Our community guidelines help ensure that RoomieMatch remains a safe, respectful, 
                and productive platform for everyone. By joining our community, you agree to follow these guidelines.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" /> 
                Respectful Communication
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We expect all users to communicate respectfully:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Be courteous and kind in all interactions</li>
                  <li>Respect personal boundaries and privacy</li>
                  <li>Avoid offensive language, harassment, or bullying</li>
                  <li>Be responsive to messages, especially when coordinating meetings or viewings</li>
                  <li>Respect differences in lifestyle, culture, and background</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2" />
                Honest Representation
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Trust is essential to our community:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate and truthful information in your profile</li>
                  <li>Use recent and real photos of yourself</li>
                  <li>Be honest about your preferences, habits, and financial situation</li>
                  <li>Disclose any relevant information that might affect a potential roommate or co-investor</li>
                  <li>Report any suspicious or fraudulent activities</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple flex items-center">
                <XCircle className="w-6 h-6 mr-2" />
                Prohibited Behaviors
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed mb-4">
                  The following behaviors are not tolerated on RoomieMatch:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Discrimination based on race, ethnicity, gender, sexual orientation, religion, or disability</li>
                  <li>Harassment, intimidation, or threatening behavior</li>
                  <li>Sharing another user's personal information without consent</li>
                  <li>Creating fake or misleading profiles</li>
                  <li>Using the platform for any illegal activities</li>
                  <li>Soliciting or advertising unrelated products or services</li>
                  <li>Creating multiple accounts to circumvent platform rules</li>
                </ul>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-roomie-purple">Consequences of Violation</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Violations of these community guidelines may result in:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Warnings from our moderation team</li>
                  <li>Temporary suspension of account privileges</li>
                  <li>Permanent account termination for serious or repeated violations</li>
                  <li>Legal action in cases of illegal activity</li>
                </ul>
                <p className="mt-4">
                  We review reported violations on a case-by-case basis and take appropriate action based on the severity and frequency of the violation.
                </p>
              </div>
            </section>
            
            <section className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Help us maintain a positive community!
              </p>
              <p className="text-gray-700">
                If you witness a violation of these guidelines, please report it immediately through the platform or by contacting <a href="mailto:community@roomiematch.com" className="text-roomie-purple hover:underline">community@roomiematch.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CommunityGuidelines;
