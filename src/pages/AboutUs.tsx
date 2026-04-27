import CmsPageRenderer from "@/components/cms/CmsPageRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Fallback = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-20 pb-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At Homie AI, our mission is to revolutionize the way people find compatible roommates and co-investors.
              We believe that living with the right person or investing with the right partner can significantly
              improve your quality of life and financial future. Our AI-powered platform is designed to make these
              connections seamless, trustworthy, and tailored to your unique preferences.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Story</h2>
            <p className="text-gray-700 leading-relaxed">
              Homie AI was founded in 2023 by a group of friends who experienced firsthand the challenges of
              finding compatible roommates in urban areas. After several disappointing experiences with random
              roommate matches, they decided there had to be a better way.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium text-lg mb-2">Trust &amp; Safety</h3>
                <p className="text-gray-600">We prioritize creating a secure platform with verified profiles and comprehensive background checks.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-medium text-lg mb-2">Innovation</h3>
                <p className="text-gray-600">We constantly improve our matching algorithms to provide the most compatible connections.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

const AboutUs = () => <CmsPageRenderer slug="about-us" fallback={<Fallback />} />;
export default AboutUs;
