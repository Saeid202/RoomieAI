
import { 
  ShieldCheck, 
  Heart, 
  Map, 
  MessageSquare, 
  Star, 
  Calendar
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-roomie-purple" />,
      title: "Verified Profiles",
      description: "All users are verified to ensure safety and build trust in our community."
    },
    {
      icon: <Heart className="w-8 h-8 text-roomie-purple" />,
      title: "Lifestyle Matching",
      description: "Find roommates who share your habits, from cleanliness to sleep schedules."
    },
    {
      icon: <Map className="w-8 h-8 text-roomie-purple" />,
      title: "Location Based",
      description: "Search for roommates in specific neighborhoods or near your workplace."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-roomie-purple" />,
      title: "Secure Messaging",
      description: "Chat safely within our platform before sharing personal contact information."
    },
    {
      icon: <Star className="w-8 h-8 text-roomie-purple" />,
      title: "Detailed Preferences",
      description: "Specify pet preferences, noise tolerance, and other important living factors."
    },
    {
      icon: <Calendar className="w-8 h-8 text-roomie-purple" />,
      title: "Move-in Date Matching",
      description: "Coordinate timing with roommates who are ready to move when you are."
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-muted/10 via-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium mb-4">
              ✨ Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">Features You'll Love</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
            RoomieMatch makes finding a compatible roommate easier than ever with these powerful features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card p-6 animate-fade-in" 
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
