
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function LifestyleMatchTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Lifestyle Twins or Opposites? 🎭</h3>
      <p className="text-muted-foreground">Does your ideal roomie need to match your wild party schedule or balance it out? No wrong answers! 🎉</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Looking for someone who:</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="similar-schedule" />
            <Label htmlFor="similar-schedule">Has a similar daily schedule</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="similar-interests" />
            <Label htmlFor="similar-interests">Shares my interests and hobbies</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="work-style" />
            <Label htmlFor="work-style">Has a compatible work style with me</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
