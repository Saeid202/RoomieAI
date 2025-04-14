
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function HouseHabitsTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">House Rules & Habits! 🏡</h3>
      <p className="text-muted-foreground">Seeking someone who shares your "dishes don't wash themselves" philosophy? Let's set some ground rules! 📝</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Important house rules:</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="clean-kitchen" />
            <Label htmlFor="clean-kitchen">Cleans up kitchen after use</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="quiet-hours" />
            <Label htmlFor="quiet-hours">Respects quiet hours</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="shared-groceries" />
            <Label htmlFor="shared-groceries">Willing to share groceries</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
