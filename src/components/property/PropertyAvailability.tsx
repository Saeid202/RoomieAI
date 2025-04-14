
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface PropertyAvailabilityProps {
  formData: {
    availability: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function PropertyAvailability({ formData, handleChange }: PropertyAvailabilityProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const event = {
        target: {
          name: 'availability',
          value: format(selectedDate, 'PPP')
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
      // Close the calendar automatically after selection
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Availability Information</h3>
      
      <div>
        <Label htmlFor="availability">Available From</Label>
        <div className="flex gap-2">
          <Input
            id="availability"
            name="availability"
            placeholder="Select availability date"
            value={formData.availability}
            onChange={handleChange}
            readOnly
            className="flex-1"
          />
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="pl-3 pr-3"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          When will this property be available for rent or sale?
        </div>
      </div>
    </div>
  );
}
