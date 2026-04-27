import CmsPageRenderer from "@/components/cms/CmsPageRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Fallback = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const faqs = [
    { q: "What is Homie AI?", a: "Homie AI is an AI-powered platform that connects people with compatible roommates or co-investors based on lifestyle, budget, and location preferences." },
    { q: "Is Homie AI free to use?", a: "We offer both free and premium tiers. The basic matching service is free. Premium features require a subscription." },
    { q: "How does the matching algorithm work?", a: "Our AI analyzes over 50 compatibility factors including lifestyle habits, sleeping patterns, cleanliness preferences, and financial reliability." },
    { q: "Can I cancel my premium subscription?", a: "Yes, you can cancel at any time from your account settings. You'll keep access until the end of your billing period." },
    { q: "Do you offer refunds?", a: "We offer a 7-day money-back guarantee for new premium subscriptions." },
  ];
  const filtered = searchQuery
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
          <div className="max-w-3xl mx-auto mb-12 relative">
            <Input placeholder="Search for questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {filtered.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-200 rounded-md px-6">
                  <AccordionTrigger className="text-left font-medium py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-700 pb-4">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <div className="text-center mt-16 bg-roomie-purple/5 rounded-lg p-8">
            <h3 className="text-2xl font-medium mb-4">Still have questions?</h3>
            <Button onClick={() => window.location.href = '/contact-us'} className="bg-roomie-purple hover:bg-roomie-dark text-white">
              Contact Support
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FAQ = () => <CmsPageRenderer slug="faq" fallback={<Fallback />} />;
export default FAQ;
