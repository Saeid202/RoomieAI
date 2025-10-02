import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Clock, MapPin, ArrowRight, CheckCircle, Star } from "lucide-react";

export default function WorkExchangePage() {
  const [showOfferForm, setShowOfferForm] = useState(false);

  const handleCreateOffer = () => {
    setShowOfferForm(true);
  };

  const handleCloseForm = () => {
    setShowOfferForm(false);
  };

  if (showOfferForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Work Exchange Offer</h1>
            <p className="text-muted-foreground mt-1">Offer your space in exchange for work services</p>
          </div>
          <Button variant="outline" onClick={handleCloseForm}>
            Back to Listings
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Work Exchange Form</CardTitle>
            <CardDescription>This form is temporarily disabled. Database setup required.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The work exchange form will be available once the database is configured.</p>
            <Button onClick={handleCloseForm} className="mt-4">
              Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Exchange Housing</h1>
          <p className="text-muted-foreground mt-1">Provide services in exchange for reduced rent or free housing</p>
        </div>
        <Button onClick={handleCreateOffer} size="lg">
          <Briefcase className="h-5 w-5 mr-2" />
          Offer Your Space
        </Button>
      </div>

      {/* How It Works Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            How Work Exchange Works
          </CardTitle>
          <CardDescription>
            Exchange skills for housing - cleaning, tutoring, IT development, caregiving, pet sitting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Offer Your Space</h3>
              <p className="text-sm text-muted-foreground">
                List your available space and specify what work you need in exchange
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Find Workers</h3>
              <p className="text-sm text-muted-foreground">
                Connect with people who have the skills you need and are looking for housing
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Exchange Services</h3>
              <p className="text-sm text-muted-foreground">
                Agree on terms and start your work exchange arrangement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Space Owners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Get Help Around the House</h4>
                <p className="text-sm text-muted-foreground">Cleaning, maintenance, pet care, and more</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Reduce Housing Costs</h4>
                <p className="text-sm text-muted-foreground">Lower your expenses while helping others</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Build Community</h4>
                <p className="text-sm text-muted-foreground">Connect with like-minded people</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">For Workers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Affordable Housing</h4>
                <p className="text-sm text-muted-foreground">Reduce or eliminate rent costs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Flexible Schedule</h4>
                <p className="text-sm text-muted-foreground">Work around your other commitments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Gain Experience</h4>
                <p className="text-sm text-muted-foreground">Build skills while saving money</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Work Types */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Work Exchange Types</CardTitle>
          <CardDescription>Common services exchanged for housing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "House Cleaning", icon: "🧹", count: "45 offers" },
              { name: "Pet Care", icon: "🐕", count: "32 offers" },
              { name: "Tutoring", icon: "📚", count: "28 offers" },
              { name: "IT Support", icon: "💻", count: "25 offers" },
              { name: "Cooking", icon: "👨‍🍳", count: "22 offers" },
              { name: "Gardening", icon: "🌱", count: "18 offers" },
              { name: "Childcare", icon: "👶", count: "15 offers" },
              { name: "Maintenance", icon: "🔧", count: "12 offers" }
            ].map((work, index) => (
              <div key={index} className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-2xl mb-2">{work.icon}</div>
                <h4 className="font-medium text-sm">{work.name}</h4>
                <p className="text-xs text-muted-foreground">{work.count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Available Work Exchange Opportunities</CardTitle>
          <CardDescription>Current opportunities for work exchange housing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">Private Room in Toronto</h3>
                  <p className="text-sm text-muted-foreground">Sarah Johnson • Toronto, ON</p>
                  <p className="text-sm">House cleaning, pet care, and light cooking</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📅 3 months</span>
                    <span>⏰ 15 hours/week</span>
                    <span>📍 123 Main Street</span>
                  </div>
                </div>
                <Button size="sm">Contact</Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">Studio in Vancouver</h3>
                  <p className="text-sm text-muted-foreground">Mike Chen • Vancouver, BC</p>
                  <p className="text-sm">IT support, tutoring, and apartment maintenance</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>📅 6 months</span>
                    <span>⏰ 20 hours/week</span>
                    <span>📍 456 Queen Street</span>
                  </div>
                </div>
                <Button size="sm">Contact</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}