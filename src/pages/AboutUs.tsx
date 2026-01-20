
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">About Us</h1>

          <div className="max-w-4xl mx-auto space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                At Roomie AI, our mission is to revolutionize the way people find compatible roommates and co-investors.
                We believe that living with the right person or investing with the right partner can significantly
                improve your quality of life and financial future. Our AI-powered platform is designed to make these
                connections seamless, trustworthy, and tailored to your unique preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Story</h2>
              <p className="text-gray-700 leading-relaxed">
                Roomie AI was founded in 2023 by a group of friends who experienced firsthand the challenges of
                finding compatible roommates in urban areas. After several disappointing experiences with random
                roommate matches, they decided there had to be a better way. Combining expertise in AI, psychology,
                and real estate, they developed a sophisticated matching algorithm that considers lifestyle habits,
                financial compatibility, and personal preferences to create harmonious living situations.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                As the platform evolved, we expanded our services to include co-investment matching, helping people
                pool their resources to enter the property market when individual purchasing power might be limited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Team</h2>
              <p className="text-gray-700 leading-relaxed">
                Our diverse team of experts combines knowledge from real estate, technology, finance, and psychology
                to create a holistic approach to roommate and co-investor matching. We're passionate about helping
                people find living situations that contribute positively to their lives and financial well-being.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-roomie-purple">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-medium text-lg mb-2">Trust & Safety</h3>
                  <p className="text-gray-600">We prioritize creating a secure platform with verified profiles and comprehensive background checks.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-medium text-lg mb-2">Innovation</h3>
                  <p className="text-gray-600">We constantly improve our matching algorithms to provide the most compatible connections.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-medium text-lg mb-2">Inclusivity</h3>
                  <p className="text-gray-600">We welcome users from all backgrounds and aim to create a diverse, respectful community.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-medium text-lg mb-2">Transparency</h3>
                  <p className="text-gray-600">We believe in clear communication about how our platform works and how your data is used.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
