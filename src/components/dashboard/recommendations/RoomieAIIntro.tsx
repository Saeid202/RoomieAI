
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, Star, Route, CheckCircle } from "lucide-react";

export function RoomieAIIntro() {
  return (
    <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl text-purple-700">
          <Bot className="h-6 w-6" />
          Welcome to Roomie AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="intro" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="intro">About Roomie AI</TabsTrigger>
            <TabsTrigger value="roadmap">Getting Started</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="mt-4">
            <div className="space-y-4">
              <p className="text-gray-700 text-lg">
                Your intelligent roommate matching assistant that uses advanced AI algorithms 
                to find your perfect living companion based on lifestyle, preferences, and compatibility.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Smart Matching</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    AI analyzes 20+ compatibility factors
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Verified Profiles</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Safe and secure profile verification
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Bot className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    24/7 chat support for your questions
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="roadmap" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Route className="h-5 w-5 text-purple-600" />
                Your Journey to Finding the Perfect Roommate
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">1</Badge>
                  <div>
                    <h4 className="font-medium text-gray-800">Complete Your Profile</h4>
                    <p className="text-sm text-gray-600">Fill out the "About Me" section with your personal details, lifestyle, and preferences.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">2</Badge>
                  <div>
                    <h4 className="font-medium text-gray-800">Define Your Ideal Roommate</h4>
                    <p className="text-sm text-gray-600">Specify what you're looking for in the "Ideal Roommate" section.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">3</Badge>
                  <div>
                    <h4 className="font-medium text-gray-800">Chat with AI Assistant</h4>
                    <p className="text-sm text-gray-600">Get personalized advice and matching insights from our AI assistant.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">4</Badge>
                  <div>
                    <h4 className="font-medium text-gray-800">Review Your Matches</h4>
                    <p className="text-sm text-gray-600">Browse AI-generated matches with compatibility scores and detailed profiles.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 mt-1">5</Badge>
                  <div>
                    <h4 className="font-medium text-gray-800">Connect & Chat</h4>
                    <p className="text-sm text-gray-600">Start conversations with potential roommates through our secure messaging.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Ready to get started?</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
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
