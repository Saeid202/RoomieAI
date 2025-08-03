
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const faqs = [
    {
      category: "General Questions",
      questions: [
        {
          question: "What is RoomieMatch?",
          answer: "RoomieMatch is an AI-powered platform that connects people with compatible roommates or co-investors based on lifestyle, budget, and location preferences. We use advanced matching algorithms to suggest the most compatible matches for your specific needs."
        },
        {
          question: "Is RoomieMatch free to use?",
          answer: "We offer both free and premium tiers. The basic matching service is free, allowing you to create a profile and browse potential matches. Premium features, such as advanced filters, priority matching, and unlimited messaging, require a subscription."
        },
        {
          question: "How does the matching algorithm work?",
          answer: "Our proprietary AI algorithm analyzes over 50 different compatibility factors, including lifestyle habits, sleeping patterns, cleanliness preferences, financial reliability, and location preferences. The system then generates compatibility scores to help you find your ideal roommate or co-investor."
        },
        {
          question: "Where is RoomieMatch available?",
          answer: "RoomieMatch is currently available in most major cities across the United States, Canada, and the United Kingdom. We're rapidly expanding to new locations, so check back regularly if your area isn't currently supported."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign Up' button in the top right corner of the homepage, enter your email address and create a password, then follow the prompts to complete your profile. The more detailed your profile, the better matches we can provide."
        },
        {
          question: "Can I use RoomieMatch without creating a profile?",
          answer: "No, a profile is required to use our matching services. This ensures all users are committed to finding a roommate or co-investor and provides the necessary information for our matching algorithm."
        },
        {
          question: "How can I update my preferences?",
          answer: "Log in to your account, navigate to your profile page, and select 'Edit Preferences.' You can update your lifestyle preferences, budget range, location preferences, and other matching criteria at any time."
        },
        {
          question: "Is my personal information secure?",
          answer: "Yes, we take data security seriously. We use industry-standard encryption and security practices to protect your information. We never share your contact details with other users until you decide to connect with them."
        }
      ]
    },
    {
      category: "Roommate Matching",
      questions: [
        {
          question: "How long does it take to find a compatible roommate?",
          answer: "The timeframe varies depending on your location and specific preferences. Many users find compatible matches within the first week, and 92% of our users find suitable roommates within two weeks."
        },
        {
          question: "What if I don't like my suggested matches?",
          answer: "You can decline matches that don't interest you, and our algorithm will learn from your preferences to suggest better matches in the future. You can also adjust your preference settings to broaden or narrow your potential matches."
        },
        {
          question: "Can I search for roommates in a specific neighborhood?",
          answer: "Yes, you can specify preferred neighborhoods or areas within a city. Our location filters allow you to focus your search on specific zip codes, neighborhoods, or proximity to landmarks like universities or workplaces."
        },
        {
          question: "Do you verify roommate identities?",
          answer: "We verify all user emails, and we offer optional identity verification badges for users who complete additional verification steps like phone number verification or social media linking. We recommend connecting only with verified users."
        }
      ]
    },
    {
      category: "Co-Investment",
      questions: [
        {
          question: "What is the co-investment matching feature?",
          answer: "Our co-investment matching connects people interested in pooling their resources to purchase property together. It's designed for those who cannot afford to buy alone but want to enter the property market by sharing ownership with compatible co-investors."
        },
        {
          question: "How does co-ownership work legally?",
          answer: "Co-ownership typically involves creating a legal agreement that outlines ownership percentages, responsibilities, and exit strategies. We provide templates and guidance, but we recommend consulting with a real estate attorney to finalize any co-ownership arrangement."
        },
        {
          question: "What happens if my co-investor wants to sell their share?",
          answer: "This should be addressed in your co-ownership agreement. Common options include giving the remaining owner(s) first right of refusal to buy the share, mutually agreeing to sell the entire property, or finding a replacement co-investor."
        },
        {
          question: "Do you offer legal assistance for co-ownership?",
          answer: "We provide basic templates and guidelines, but we are not a legal service. We recommend working with a qualified real estate attorney to create a binding co-ownership agreement that protects all parties' interests."
        }
      ]
    },
    {
      category: "Payments & Subscriptions",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and certain regional payment methods. All payments are processed securely through our payment partners."
        },
        {
          question: "Can I cancel my premium subscription?",
          answer: "Yes, you can cancel your premium subscription at any time from your account settings. You'll continue to have access to premium features until the end of your current billing period."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 7-day money-back guarantee for new premium subscriptions if you're not satisfied with the service. After this period, we do not provide refunds for unused subscription time."
        },
        {
          question: "Is there a discount for longer subscription periods?",
          answer: "Yes, we offer discounted rates for quarterly and annual subscriptions compared to the monthly rate. The specific discount is displayed on the subscription page."
        }
      ]
    }
  ];
  
  const filteredFAQs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
          
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 text-gray-500"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg text-gray-600 mb-4">No results found for "{searchQuery}"</p>
              <p className="text-gray-500">Try different keywords or browse our categories below</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setSearchQuery("")}
              >
                View all questions
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {filteredFAQs.map((category, index) => (
                <div key={index} className={category.questions.length > 0 ? 'block' : 'hidden'}>
                  <h2 className="text-2xl font-semibold mb-6 text-roomie-purple">{category.category}</h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`} className="border border-gray-200 rounded-md px-6">
                        <AccordionTrigger className="text-left font-medium py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16 bg-roomie-purple/5 rounded-lg p-8">
            <h3 className="text-2xl font-medium mb-4">Still have questions?</h3>
            <p className="text-gray-700 mb-6">
              Our support team is here to help you with any questions not covered in the FAQ.
            </p>
            <Button 
              onClick={() => window.location.href = '/contact-us'}
              className="bg-roomie-purple hover:bg-roomie-dark text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
