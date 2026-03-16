import { Home, DollarSign, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    const signupButton = document.querySelector('[data-signup-button="true"]') as HTMLButtonElement;
    if (signupButton) signupButton.click();
  };

  const journeys = [
    {
      icon: <Home className="w-8 h-8 text-blue-600" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      badge: "bg-blue-100 text-blue-700",
      dot: "bg-blue-500",
      title: "Find & Apply",
      subtitle: "Seekers & Landlords",
      features: [
        "Search thousands of rental & sale listings",
        "AI-powered roommate matching",
        "Submit rental applications online",
        "Schedule property viewings",
        "Manage rent payments digitally",
        "Landlord portfolio management",
      ],
    },
    {
      icon: <DollarSign className="w-8 h-8 text-purple-600" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      badge: "bg-purple-100 text-purple-700",
      dot: "bg-purple-500",
      title: "Buy & Invest",
      subtitle: "Buyers, Brokers & Lawyers",
      features: [
        "Mortgage pre-approval & profile",
        "Co-ownership planning & matching",
        "Secure document rooms for deals",
        "Lawyer-assisted closing process",
        "Legal compliance & form generation",
        "AI-powered legal assistant",
      ],
    },
    {
      icon: <Wrench className="w-8 h-8 text-green-600" />,
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      badge: "bg-green-100 text-green-700",
      dot: "bg-green-500",
      title: "Renovate & Improve",
      subtitle: "Renovators & Property Owners",
      features: [
        "Get free renovation quotes",
        "Browse verified renovators",
        "Project timeline & management",
        "Quality assurance tracking",
        "Integrated payment processing",
        "Construction product marketplace",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium mb-4">
              🚀 How It Works
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">How Homie AI Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            One platform, three powerful journeys — all connected, all intelligent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {journeys.map((journey, index) => (
            <div
              key={index}
              className={`rounded-2xl border-2 ${journey.border} ${journey.bg} p-6 animate-fade-in`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  {journey.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{journey.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${journey.badge}`}>
                    {journey.subtitle}
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {journey.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${journey.dot}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <button
            className="btn-primary text-lg h-14 px-10 shadow-glow hover:shadow-glow-lg transition-all duration-300"
            onClick={handleSignupClick}
          >
            Start Your Journey →
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
