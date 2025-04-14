
import React from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MatchesTab() {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">2 Matches Found</h4>
            <p className="text-sm text-green-700">
              We've found potential matches for your Toronto housing plan starting September 2025.
            </p>
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden border-l-4 border-l-green-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-lg">Sarah, 22 - University Student</h4>
                <Badge className="bg-purple-500">Roommate</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Looking for a roommate in Toronto for Fall 2025 semester at University of Toronto.
                Budget range $900-$1600, clean and quiet.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                Match Score
              </div>
              <div className="text-xl font-bold text-green-600">
                92%
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="bg-green-50">Early Bird</Badge>
            <Badge variant="outline" className="bg-green-50">University Student</Badge>
            <Badge variant="outline" className="bg-green-50">Similar Timeline</Badge>
            <Badge variant="outline" className="bg-green-50">Compatible Lifestyle</Badge>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" size="sm">Skip</Button>
            <Button variant="default" size="sm">View Profile</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-l-4 border-l-green-500">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-lg">Campus View Apartment</h4>
                <Badge className="bg-green-500">Property</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                2-bedroom apartment available for September 2025, 10-minute walk to University of Toronto.
                $1,800/month, utilities included, pre-leasing available.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">
                Match Score
              </div>
              <div className="text-xl font-bold text-green-600">
                87%
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" className="bg-green-50">Pre-leasing Available</Badge>
            <Badge variant="outline" className="bg-green-50">Close to University</Badge>
            <Badge variant="outline" className="bg-green-50">Within Budget</Badge>
            <Badge variant="outline" className="bg-green-50">Utilities Included</Badge>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" size="sm">Skip</Button>
            <Button variant="default" size="sm">View Property</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
