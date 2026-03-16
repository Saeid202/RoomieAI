import {
  DollarSign,
  Users,
  Lock,
  Brain,
  FileText,
  Map
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-300 dark:border-emerald-700",
      title: "Mortgage Pre-approval",
      description: "Get pre-approved for mortgages and explore co-buying options with brokers."
    },
    {
      icon: <Users className="w-8 h-8 text-violet-500" />,
      bg: "bg-violet-50 dark:bg-violet-900/30",
      border: "border-violet-300 dark:border-violet-700",
      title: "Co-Ownership Matching",
      description: "Find co-buyers with compatible financial goals and investment strategies."
    },
    {
      icon: <Lock className="w-8 h-8 text-rose-500" />,
      bg: "bg-rose-50 dark:bg-rose-900/30",
      border: "border-rose-300 dark:border-rose-700",
      title: "Secure Document Rooms",
      description: "Store and share sensitive documents with controlled access and encryption."
    },
    {
      icon: <Brain className="w-8 h-8 text-cyan-500" />,
      bg: "bg-cyan-50 dark:bg-cyan-900/30",
      border: "border-cyan-300 dark:border-cyan-700",
      title: "Legal AI Assistant",
      description: "Get instant legal guidance and document review powered by AI."
    },
    {
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-300 dark:border-amber-700",
      title: "Lawyer Referrals",
      description: "Connect with verified lawyers for complex transactions and legal advice."
    },
    {
      icon: <Map className="w-8 h-8 text-teal-500" />,
      bg: "bg-teal-50 dark:bg-teal-900/30",
      border: "border-teal-300 dark:border-teal-700",
      title: "Property Search",
      description: "Find rental and sale properties with AI-powered recommendations."
    }
  ];

  return (
    <section id="features" className="py-0 bg-gradient-to-br from-muted/10 via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium mb-4">
              ✨ Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Features You'll Love</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Homie AI makes finding a compatible roommate easier than ever with these powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`rounded-xl border ${feature.border} ${feature.bg} p-6 animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
