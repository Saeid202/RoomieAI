
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RouteGuard } from "@/components/dashboard/RouteGuard";
import { RoleInitializer } from "@/components/dashboard/RoleInitializer";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, PlayCircle } from "lucide-react";

export default function Dashboard() {
  const { role } = useRole();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const assignedRole = user?.user_metadata?.role;
  
  useEffect(() => {
    console.log("Dashboard mounted - current path:", location.pathname);
    console.log("Dashboard mounted - role:", role);
    console.log("Dashboard mounted - user:", user?.email);
    console.log("Dashboard mounted - loading:", loading);
    console.log("Dashboard mounted - assigned role:", assignedRole);
    
    // If user is logged in but has no role assigned, show the role selection dialog
    if (!loading && user && !assignedRole && location.pathname === '/dashboard') {
      console.log("No role assigned, showing role selection dialog");
      setShowRoleDialog(true);
    }
  }, [location.pathname, role, user, loading, assignedRole]);
  
  const handlePlayVideo = () => {
    setShowVideo(true);
  };

  // Only redirect if we're exactly at /dashboard and not at a sub-route
  if (!loading && location.pathname === '/dashboard' && !showRoleDialog) {
    // Make sure we have routes for all these destinations
    if (assignedRole === 'landlord') {
      return <Navigate to="/dashboard/landlord" replace />;
    } else if (assignedRole === 'developer') {
      return <Navigate to="/dashboard/developer" replace />;
    }
  }

  // If we're at the root dashboard page and not redirecting elsewhere, show the Roomie AI introduction
  const showDashboardContent = location.pathname === '/dashboard' && !showRoleDialog;
  
  return (
    <>
      <RoleInitializer>
        <RouteGuard>
          <DashboardLayout>
            {showDashboardContent ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Roomie AI</h1>
                    <p className="text-muted-foreground">
                      Your intelligent roommate matching assistant powered by advanced AI
                    </p>
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Meet Roomie AI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/2 space-y-4">
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-primary" />
                          <h3 className="text-lg font-medium">About Roomie AI</h3>
                        </div>
                        <p>
                          Roomie AI is our advanced artificial intelligence system designed to help you find 
                          the perfect roommate match. Using sophisticated algorithms and machine learning, 
                          Roomie AI analyzes over 20 compatibility factors including lifestyle habits, 
                          schedules, and personal preferences.
                        </p>
                        <div className="space-y-2">
                          <h4 className="font-medium">Key Features:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Personality compatibility analysis</li>
                            <li>Lifestyle and habit matching</li>
                            <li>Schedule compatibility detection</li>
                            <li>Location and commute optimization</li>
                            <li>Budget alignment verification</li>
                          </ul>
                        </div>
                        <p>
                          By understanding your unique preferences and comparing them with thousands of potential 
                          roommates, Roomie AI helps you find people you'll truly enjoy living with.
                        </p>
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
                            Learn how Roomie AI works and how it can help you find your perfect roommate match. 
                            This short video explains our matching process and how to get the most out of our platform.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium mb-4">Start Finding Matches</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">Find Roommates</h4>
                            <p className="text-sm mb-4">
                              Discover compatible roommates based on your lifestyle, preferences, and personality traits.
                            </p>
                            <Button variant="default" asChild>
                              <a href="/dashboard/roommate-recommendations">Explore Roommate Matches</a>
                            </Button>
                          </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-2">Co-Owner Matching</h4>
                            <p className="text-sm mb-4">
                              Looking to co-own a property? Find reliable co-owners to share investment and responsibilities.
                            </p>
                            <Button variant="default" asChild>
                              <a href="/dashboard/co-owner-recommendations">Explore Co-Owner Matches</a>
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Outlet />
            )}
          </DashboardLayout>
        </RouteGuard>
      </RoleInitializer>
      
      <RoleSelectionDialog 
        isOpen={showRoleDialog} 
        onClose={() => setShowRoleDialog(false)}
        showCloseButton={false}
      />
    </>
  );
}
