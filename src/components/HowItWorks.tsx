
import { Check, UserCircle, Users, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    const signupButton = document.querySelector('[data-signup-button="true"]') as HTMLButtonElement;
    if (signupButton) signupButton.click();
  };

  const steps = [
    {
      icon: <UserCircle className="w-10 h-10 text-roomie-purple" />,
      title: "Create Your Profile",
      description: "Fill out your preferences, budget, and lifestyle details to help us find your ideal match.",
      action: handleSignupClick
    },
    {
      icon: <Check className="w-10 h-10 text-roomie-purple" />,
      title: "Get AI-Powered Matches",
      description: "Our algorithm analyzes compatibility factors to suggest roommates you'll actually get along with."
    },
    {
      icon: <Users className="w-10 h-10 text-roomie-purple" />,
      title: "Connect & Chat",
      description: "Message potential roommates directly through our platform to see if you're a good fit."
    },
    {
      icon: <Building className="w-10 h-10 text-roomie-purple" />,
      title: "Find Your New Home",
      description: "Once you've found your match, start planning your move and future living arrangement."
    }
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">How RoomieMatch Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            Finding the perfect roommate is just a few simple steps away.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`card p-6 relative animate-fade-in ${step.action ? 'cursor-pointer' : ''}`}
              style={{animationDelay: `${index * 0.1}s`}}
              onClick={step.action}
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-glow">
                {index + 1}
              </div>
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="inline-block bg-background/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-primary/20">
            <p className="text-foreground">
              <span className="font-medium text-primary">92% of users</span> find a compatible roommate within 2 weeks!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
