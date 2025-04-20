import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pt-12">
      {/* Welcome Panel */}
      <Card className="col-span-1 sm:col-span-2 lg:col-span-3 bg-[#f4f1fd]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl">
                Welcome back, Ghazaleh! 💜
              </CardTitle>
              <Badge
                variant="secondary"
                className="mt-1 text-xs sm:text-sm lg:text-base"
              >
                Pro Member
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm sm:text-base lg:text-lg text-muted-foreground">
          Ready to find your perfect match today?
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      <Card className="col-span-1 sm:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Roommate Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">12</p>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            based on your preferences
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1 sm:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Saved Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">8</p>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            waiting for your message
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1 sm:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            New Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">3</p>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1">
            from potential roommates
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="col-span-1 sm:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="default" className="text-sm sm:text-base lg:text-lg">
            ➕ Post a Room
          </Button>
          <Button variant="outline" className="text-sm sm:text-base lg:text-lg">
            🧭 Browse Listings
          </Button>
          <Button
            variant="secondary"
            className="text-sm sm:text-base lg:text-lg"
          >
            ✏️ Edit Preferences
          </Button>
          <Button variant="ghost" className="text-sm sm:text-base lg:text-lg">
            📢 Share Profile
          </Button>
        </CardContent>
      </Card>

      {/* Profile Progress */}
      <Card className="col-span-1 sm:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={70} />
          <p className="text-xs sm:text-sm lg:text-base mt-2 text-muted-foreground">
            You're almost there!
          </p>
        </CardContent>
      </Card>

      {/* Notifications or News */}
      <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl lg:text-2xl">
            Latest Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs sm:text-sm lg:text-base">
          <p>📣 New roommate search filters available</p>
          <p>📍 Map view now includes transportation lines</p>
          <p>✨ Tip: Add a bio to boost your chances</p>
        </CardContent>
      </Card>
    </div>
  );
}
