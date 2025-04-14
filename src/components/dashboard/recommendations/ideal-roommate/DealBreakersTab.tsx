
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function DealBreakersTab() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Absolutely Not! 🙅‍♂️</h3>
      <p className="text-muted-foreground">What crosses the line? Midnight drum practice? Pineapple on pizza? We won't judge (much)! 🍍</p>
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">My deal breakers:</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="smoking" />
            <Label htmlFor="smoking">Smoking indoors</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="loud-music" />
            <Label htmlFor="loud-music">Frequently playing loud music</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="late-payments" />
            <Label htmlFor="late-payments">History of late rent payments</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
