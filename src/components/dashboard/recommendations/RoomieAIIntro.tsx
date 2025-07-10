
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, Star, Route, CheckCircle } from "lucide-react";

export function RoomieAIIntro() {
  return (
    <Card className="mb-6 bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl md:text-3xl text-foreground">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div>
            <div className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to Roomie AI
            </div>
            <p className="text-sm text-muted-foreground font-normal mt-1">Your intelligent roommate matching assistant</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="intro" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted">
            <TabsTrigger value="intro" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">About Roomie AI</TabsTrigger>
            <TabsTrigger value="roadmap" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Getting Started</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="mt-6">
            <div className="space-y-6">
              <p className="text-foreground text-lg leading-relaxed">
                Your intelligent roommate matching assistant that uses advanced AI algorithms 
                to find your perfect living companion based on lifestyle, preferences, and compatibility.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Smart Matching</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI analyzes 20+ compatibility factors to find your perfect match
                  </p>
                </div>
                
                <div className="text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">Verified Profiles</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Safe and secure profile verification for peace of mind
                  </p>
                </div>
                
                <div className="text-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    24/7 chat support for all your roommate questions
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="roadmap" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                Your Journey to Finding the Perfect Roommate
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-xl flex items-center justify-center mt-1">1</Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg mb-1">Complete Your Profile</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Fill out the "About Me" section with your personal details, lifestyle, and preferences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-xl flex items-center justify-center mt-1">2</Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg mb-1">Define Your Ideal Roommate</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Specify what you're looking for in the "Ideal Roommate" section.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-xl flex items-center justify-center mt-1">3</Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg mb-1">Chat with AI Assistant</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Get personalized advice and matching insights from our AI assistant.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-xl flex items-center justify-center mt-1">4</Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg mb-1">Review Your Matches</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Browse AI-generated matches with compatibility scores and detailed profiles.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-background rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-all duration-300">
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-bold w-8 h-8 rounded-xl flex items-center justify-center mt-1">5</Badge>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground text-lg mb-1">Connect & Chat</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Start conversations with potential roommates through our secure messaging.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                <div className="flex items-center gap-3 text-green-700 mb-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-bold text-lg">Ready to get started?</span>
                </div>
                <p className="text-sm text-green-600 leading-relaxed">
                  Begin by completing your profile in the tabs below. The more information you provide, 
                  the better matches our AI can find for you!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
