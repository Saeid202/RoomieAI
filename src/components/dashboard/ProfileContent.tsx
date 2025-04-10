
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground">View and manage your profile information.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Manage your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is where your profile information will be displayed. You can edit your preferences, update personal details, and manage your roommate matching criteria.</p>
        </CardContent>
      </Card>
    </div>
  );
}
