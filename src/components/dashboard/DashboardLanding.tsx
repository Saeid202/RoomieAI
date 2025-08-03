
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle, HeartHandshake, Home, LightbulbIcon, PlayCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DashboardLanding() {
  const { toast } = useToast();
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  
  const handlePlayVideo = () => {
    setShowVideo(true);
    toast({
      title: "Video playing",
      description: "Enjoy our introduction to Roomie AI"
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Roomie AI</h1>
          <p className="text-muted-foreground">
            Your intelligent roommate and co-ownership matching platform powered by advanced AI
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <CardTitle>Meet Roomie AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 space-y-4">
                <div className="tabs flex space-x-2 border-b mb-4">
                  <button 
                    onClick={() => setActiveTab("about")}
                    className={`pb-2 px-4 ${activeTab === "about" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                  >
                    About
                  </button>
                  <button 
                    onClick={() => setActiveTab("features")}
                    className={`pb-2 px-4 ${activeTab === "features" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                  >
                    Features
                  </button>
                  <button 
                    onClick={() => setActiveTab("how-it-works")}
                    className={`pb-2 px-4 ${activeTab === "how-it-works" ? "border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
                  >
                    How It Works
                  </button>
                </div>
                
                {activeTab === "about" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">About Roomie AI</h3>
                    <p>
                      Roomie AI is our advanced artificial intelligence system designed to revolutionize
                      how people find compatible roommates and co-ownership partners. Using sophisticated 
                      algorithms and machine learning, Roomie AI analyzes over 20 compatibility factors 
                      including lifestyle habits, schedules, financial goals, and personal preferences.
                    </p>
                    <p>
                      Whether you're looking for someone to share rent with or a partner to co-invest in 
                      property ownership, our platform creates perfect matches based on compatibility, 
                      ensuring harmonious living arrangements and successful property investments.
                    </p>
                    <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-3">
                      <LightbulbIcon className="h-5 w-5 text-primary" />
                      <p className="text-sm">
                        Founded in 2023, Roomie AI has already facilitated over 5,000 successful matches 
                        across major metropolitan areas.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === "features" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Features</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Advanced Compatibility Analysis</h4>
                          <p className="text-sm text-muted-foreground">
                            Our AI evaluates over 20 lifestyle factors to find your perfect match
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Dual Matching Systems</h4>
                          <p className="text-sm text-muted-foreground">
                            Find roommates for rentals or co-owners for property investments
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Verified Profiles</h4>
                          <p className="text-sm text-muted-foreground">
                            All users are verified for safety and security
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Legal Assistance</h4>
                          <p className="text-sm text-muted-foreground">
                            Built-in legal assistant for agreement guidance and document creation
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Financial Tools</h4>
                          <p className="text-sm text-muted-foreground">
                            Integrated wallet, rent savings calculator, and investment capacity analysis
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                
                {activeTab === "how-it-works" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">How Roomie AI Works</h3>
                    <ol className="space-y-3 list-decimal pl-5">
                      <li>
                        <span className="font-medium">Complete Your Profile</span>
                        <p className="text-sm text-muted-foreground">
                          Fill out your personal details, preferences, and what you're looking for
                        </p>
                      </li>
                      <li>
                        <span className="font-medium">AI Matching Process</span>
                        <p className="text-sm text-muted-foreground">
                          Our algorithm analyzes compatibility factors to find your ideal matches
                        </p>
                      </li>
                      <li>
                        <span className="font-medium">Review Recommendations</span>
                        <p className="text-sm text-muted-foreground">
                          Browse through your personalized match recommendations with compatibility scores
                        </p>
                      </li>
                      <li>
                        <span className="font-medium">Connect Safely</span>
                        <p className="text-sm text-muted-foreground">
                          Use our secure messaging system to get to know potential matches
                        </p>
                      </li>
                      <li>
                        <span className="font-medium">Finalize Arrangements</span>
                        <p className="text-sm text-muted-foreground">
                          Use our legal tools to create agreements and finalize your living arrangement
                        </p>
                      </li>
                    </ol>
                  </div>
                )}
                
                {!showVideo && (
                  <Button 
                    className="mt-4 flex items-center gap-2" 
                    onClick={handlePlayVideo}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Watch Introduction Video
                  </Button>
                )}
              </div>
              <div className="md:w-1/2">
                {showVideo ? (
                  <div className="aspect-video rounded-md overflow-hidden bg-black">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                      title="Roomie AI Introduction"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video rounded-md bg-muted flex items-center justify-center cursor-pointer" onClick={handlePlayVideo}>
                    <div className="flex flex-col items-center gap-2">
                      <PlayCircle className="h-16 w-16 text-primary opacity-80" />
                      <span className="font-medium">Click to watch introduction video</span>
                    </div>
                  </div>
                )}
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Learn how Roomie AI works and how it can help you find your perfect roommate or co-owner match. 
                    This short video explains our matching process and how to get the most out of our platform.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Find Roommates</h3>
              </div>
              <p className="mb-4">
                Looking for someone to share a rental with? Our roommate matching system uses AI to 
                find compatible roommates based on lifestyle, preferences, and personality traits.
              </p>
              <Button variant="default" asChild className="w-full">
                <a href="/dashboard/roommate-recommendations">Find Roommate Matches</a>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Home className="h-6 w-6 text-primary" />
                <h3 className="font-semibold text-lg">Co-Owner Matching</h3>
              </div>
              <p className="mb-4">
                Ready to invest in real estate? Find reliable co-owners to share property investments
                matched by financial goals, investment capacity, and risk tolerance.
              </p>
              <Button variant="default" asChild className="w-full">
                <a href="/dashboard/co-owner-recommendations">Find Co-Owner Matches</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <HeartHandshake className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Compatibility Score</h3>
              </div>
              <p className="text-sm">
                Our proprietary algorithm calculates compatibility scores between 1-100% based on 
                lifestyle factors, personal habits, and preferences.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Property Listings</h3>
              </div>
              <p className="text-sm">
                Browse through verified property listings or create your own listing to
                find the perfect match for your living situation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <p className="text-sm">
                Use our AI assistant to help you navigate the platform, answer questions, and provide 
                guidance throughout your matching journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
