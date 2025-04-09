
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";
import { findMatches } from "@/utils/matchingAlgorithm";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, Home, Building } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the validation schema
const profileSchema = z.object({
  // Basic Information
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
    message: "Age must be a number and at least 18",
  }),
  gender: z.string().optional(),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  linkedinProfile: z.string().optional(),
  
  // Housing Preferences
  preferredLocation: z.string().min(1, "Location is required"),
  budgetRange: z.array(z.number()).min(2).max(2),
  moveInDate: z.date({
    required_error: "Please select a move-in date",
  }),
  housingType: z.enum(["house", "apartment"]),
  livingSpace: z.enum(["privateRoom", "sharedRoom", "entirePlace"]),
  
  // Lifestyle & Habits
  smoking: z.boolean(),
  livesWithSmokers: z.boolean(),
  hasPets: z.boolean(),
  petPreference: z.enum(["noPets", "onlyCats", "onlyDogs", "both"]),
  workLocation: z.enum(["remote", "office", "hybrid"]),
  dailyRoutine: z.enum(["morning", "night", "mixed"]),
  hobbies: z.array(z.string()),
  
  // Work/Sleep Schedule
  workSchedule: z.string().min(1, "Work schedule is required"),
  sleepSchedule: z.string().min(1, "Sleep schedule is required"),
  overnightGuests: z.enum(["yes", "no", "occasionally"]),
  
  // Cleanliness & Organization
  cleanliness: z.enum(["veryTidy", "somewhatTidy", "doesntMindMess"]),
  cleaningFrequency: z.enum(["daily", "weekly", "biweekly", "monthly", "asNeeded"]),
  
  // Social Preferences
  socialLevel: z.enum(["extrovert", "introvert", "balanced"]),
  guestsOver: z.enum(["yes", "no", "occasionally"]),
  familyOver: z.enum(["yes", "no", "occasionally"]),
  atmosphere: z.enum(["quiet", "lively", "balanced"]),
  hostingFriends: z.enum(["yes", "no", "occasionally"]),
  
  // Cooking & Meals
  diet: z.enum(["vegetarian", "vegan", "omnivore", "other"]),
  cookingSharing: z.enum(["share", "separate"]),
  
  // Lease Terms
  stayDuration: z.enum(["threeMonths", "sixMonths", "oneYear", "flexible"]),
  leaseTerm: z.enum(["shortTerm", "longTerm"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  
  const totalSteps = 8;
  
  // Initialize form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      phoneNumber: "",
      email: "",
      linkedinProfile: "",
      preferredLocation: "",
      budgetRange: [800, 1500],
      moveInDate: new Date(),
      housingType: "apartment",
      livingSpace: "privateRoom",
      smoking: false,
      livesWithSmokers: false,
      hasPets: false,
      petPreference: "noPets",
      workLocation: "office",
      dailyRoutine: "morning",
      hobbies: [],
      workSchedule: "",
      sleepSchedule: "",
      overnightGuests: "occasionally",
      cleanliness: "somewhatTidy",
      cleaningFrequency: "weekly",
      socialLevel: "balanced",
      guestsOver: "occasionally",
      familyOver: "occasionally",
      atmosphere: "balanced",
      hostingFriends: "occasionally",
      diet: "omnivore",
      cookingSharing: "share",
      stayDuration: "oneYear",
      leaseTerm: "longTerm",
    },
  });
  
  const nextStep = () => {
    // Validate current step before moving forward
    const currentStepFields = getFieldsForStep(step);
    const isValid = currentStepFields.every(field => 
      !form.formState.errors[field as keyof ProfileFormValues]
    );
    
    if (isValid && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Trigger validation to show errors
      form.trigger(currentStepFields as any);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const onSubmit = (data: ProfileFormValues) => {
    console.log("Form submitted:", data);
    const matches = findMatches(data);
    setMatchResults(matches);
    setShowResults(true);
  };
  
  // Get fields to validate for each step
  const getFieldsForStep = (currentStep: number): string[] => {
    switch (currentStep) {
      case 1: // Basic Information
        return ["fullName", "age", "gender", "phoneNumber", "email", "linkedinProfile"];
      case 2: // Housing Preferences
        return ["preferredLocation", "budgetRange", "moveInDate", "housingType", "livingSpace"];
      case 3: // Lifestyle & Habits
        return ["smoking", "livesWithSmokers", "hasPets", "petPreference", "workLocation", "dailyRoutine", "hobbies"];
      case 4: // Work/Sleep Schedule
        return ["workSchedule", "sleepSchedule", "overnightGuests"];
      case 5: // Cleanliness & Organization
        return ["cleanliness", "cleaningFrequency"];
      case 6: // Social Preferences
        return ["socialLevel", "guestsOver", "familyOver", "atmosphere", "hostingFriends"];
      case 7: // Cooking & Meals
        return ["diet", "cookingSharing"];
      case 8: // Lease Terms
        return ["stayDuration", "leaseTerm"];
      default:
        return [];
    }
  };
  
  const hobbiesList = [
    "Reading", "Gaming", "Cooking", "Hiking", "Movies", 
    "Music", "Art", "Sports", "Photography", "Yoga", 
    "Crafting", "Gardening", "Writing", "Dancing", "Meditation"
  ];
  
  // Helper for handling hobbies selection
  const handleHobbyToggle = (hobby: string) => {
    const current = form.getValues("hobbies");
    if (current.includes(hobby)) {
      form.setValue("hobbies", current.filter(h => h !== hobby));
    } else {
      form.setValue("hobbies", [...current, hobby]);
    }
  };

  if (showResults) {
    return (
      <div id="profile-form" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Potential Matches</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Based on your preferences, we've found these potential roommates for you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchResults.map((match, index) => (
              <Card key={index} className="overflow-hidden card-hover">
                <div className="h-3 bg-gradient-to-r from-roomie-purple to-roomie-accent"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">{match.name}, {match.age}</CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {match.occupation} • {match.location}
                      </CardDescription>
                    </div>
                    <div className="bg-roomie-light text-roomie-purple font-semibold px-3 py-1 rounded-full text-sm">
                      {match.compatibilityScore}% Match
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Budget</h4>
                      <p className="font-medium">${match.budget[0]} - ${match.budget[1]}/month</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Moving Date</h4>
                      <p className="font-medium">{match.movingDate}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Lifestyle</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.cleanliness > 70 && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Very Clean</span>
                        )}
                        {match.pets && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Pet Friendly</span>
                        )}
                        {match.sleepSchedule === "early" && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Early Bird</span>
                        )}
                        {match.sleepSchedule === "night" && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Night Owl</span>
                        )}
                        {!match.smoking && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Non-Smoker</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Interests</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.interests.slice(0, 4).map((interest, i) => (
                          <span key={i} className="bg-roomie-light text-roomie-purple text-xs px-2 py-1 rounded-full">
                            {interest}
                          </span>
                        ))}
                        {match.interests.length > 4 && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            +{match.interests.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-roomie-purple hover:bg-roomie-dark">
                    Contact {match.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" className="border-roomie-purple text-roomie-purple" onClick={() => setShowResults(false)}>
              Back to Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="profile-form" className="py-20 bg-roomie-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Roommate</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Tell us about yourself and what you're looking for in a roommate.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1 rounded-full ${
                      i + 1 <= step ? "bg-roomie-purple" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            </div>
            <CardTitle className="text-xl font-bold">
              {step === 1 && "Basic Information"}
              {step === 2 && "Housing Preferences"}
              {step === 3 && "Lifestyle & Habits"}
              {step === 4 && "Work & Sleep Schedule"}
              {step === 5 && "Cleanliness & Organization"}
              {step === 6 && "Social Preferences"}
              {step === 7 && "Cooking & Meals"}
              {step === 8 && "Lease Terms"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What kind of housing are you looking for?"}
              {step === 3 && "Let us know about your lifestyle"}
              {step === 4 && "Share your daily schedule"}
              {step === 5 && "How do you like to keep your living space?"}
              {step === 6 && "Tell us about your social preferences"}
              {step === 7 && "Share your cooking and meal preferences"}
              {step === 8 && "What are your lease term preferences?"}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Your age" {...field} min="18" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This information is optional and helps find compatible roommates
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedinProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                          </FormControl>
                          <FormDescription>
                            Add your LinkedIn link for better roommate compatibility
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 2: Housing Preferences */}
                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="preferredLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Neighborhood, ZIP code, or exact address" {...field} />
                          </FormControl>
                          <FormDescription>
                            Where are you looking to live?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Budget Range ($)</FormLabel>
                          <FormControl>
                            <div className="pt-5 px-2">
                              <Slider
                                defaultValue={field.value}
                                min={500}
                                max={3000}
                                step={50}
                                onValueChange={field.onChange}
                              />
                              <div className="flex justify-between mt-2 text-sm text-gray-500">
                                <span>${field.value[0]}</span>
                                <span>${field.value[1]}</span>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Monthly rent you're comfortable with
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="moveInDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Preferred Move-in Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            When would you like to move in?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="housingType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you prefer to live in a house or apartment?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="house" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <Home className="h-4 w-4" /> House
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="apartment" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center gap-2">
                                  <Building className="h-4 w-4" /> Apartment
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="livingSpace"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>What type of living space are you looking for?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="privateRoom" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Private room
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="sharedRoom" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Shared room
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="entirePlace" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Entire place
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 3: Lifestyle & Habits */}
                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="smoking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Do you smoke?
                            </FormLabel>
                            <FormDescription>
                              Check this box if you are a smoker
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="livesWithSmokers"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Are you comfortable living with smokers?
                            </FormLabel>
                            <FormDescription>
                              Check this box if you're fine living with someone who smokes
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hasPets"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Do you have pets?
                            </FormLabel>
                            <FormDescription>
                              Check this box if you own pets
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="petPreference"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Are you okay with living with pets?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="noPets" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No pets, please
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="onlyCats" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Only cats
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="onlyDogs" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Only dogs
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="both" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Open to both
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="workLocation"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you work from home or go to an office?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="remote" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Work from home
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="office" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Go to office
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="hybrid" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Hybrid (both)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dailyRoutine"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>What is your typical daily routine?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="morning" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Morning person (early riser)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="night" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Night owl (stay up late)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="mixed" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Mixed/Flexible schedule
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hobbies & Activities</FormLabel>
                          <FormDescription>
                            Select activities you enjoy at home
                          </FormDescription>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {hobbiesList.map((hobby) => (
                              <div
                                key={hobby}
                                onClick={() => handleHobbyToggle(hobby)}
                                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                                  form.getValues("hobbies").includes(hobby)
                                    ? "bg-roomie-purple text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                {hobby}
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 4: Work/Sleep Schedule */}
                {step === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="workSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What's your typical work schedule?</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 9-5, night shift, flexible hours" {...field} />
                          </FormControl>
                          <FormDescription>
                            Describe your typical work hours
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sleepSchedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What time do you usually go to bed and wake up?</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Sleep 11pm-7am, Sleep 1am-9am" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your typical sleep schedule
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="overnightGuests"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How do you feel about roommates having partners overnight?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes, that's fine
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No, not comfortable with that
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="occasionally" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Occasionally is fine
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 5: Cleanliness & Organization */}
                {step === 5 && (
                  <>
                    <FormField
                      control={form.control}
                      name="cleanliness"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How would you describe your level of cleanliness?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="veryTidy" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Very tidy (clean regularly, everything has its place)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="somewhatTidy" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Somewhat tidy (generally clean but not obsessive)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="doesntMindMess" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Doesn't mind mess (clean when necessary)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cleaningFrequency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How often do you like to clean common areas?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="daily" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Daily
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="weekly" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Weekly
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="biweekly" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Bi-weekly
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="monthly" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Monthly
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="asNeeded" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  As needed
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 6: Social Preferences */}
                {step === 6 && (
                  <>
                    <FormField
                      control={form.control}
                      name="socialLevel"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How social are you?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="extrovert" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Extrovert (love being around people)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="introvert" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Introvert (prefer quiet time alone)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="balanced" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Balanced (enjoy both social time and alone time)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="guestsOver"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you prefer to have guests over often?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes, frequently
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No, rarely or never
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="occasionally" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Occasionally
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="familyOver"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How do you feel about having friends or family over?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes, I welcome it
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No, I prefer privacy
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="occasionally" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Occasionally is fine
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="atmosphere"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Would you prefer a quiet environment or more of a lively, social atmosphere?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="quiet" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Quiet environment
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="lively" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Lively, social atmosphere
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="balanced" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Balanced (mix of both)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hostingFriends"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you often host friends at home?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes, frequently
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No, rarely or never
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="occasionally" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Occasionally
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 7: Cooking & Meals */}
                {step === 7 && (
                  <>
                    <FormField
                      control={form.control}
                      name="diet"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Are you vegetarian, vegan, or omnivore?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="vegetarian" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Vegetarian
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="vegan" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Vegan
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="omnivore" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Omnivore (eat everything)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Other dietary preference
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cookingSharing"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you share cooking duties or prefer separate meals?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="share" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Share cooking and meals
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="separate" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Prefer separate cooking and meals
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 8: Lease Terms */}
                {step === 8 && (
                  <>
                    <FormField
                      control={form.control}
                      name="stayDuration"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How long do you plan to stay?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="threeMonths" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  3 months
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="sixMonths" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  6 months
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="oneYear" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  1 year
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="flexible" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Flexible
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="leaseTerm"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>What is your ideal lease duration?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="shortTerm" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Short-term (less than 6 months)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="longTerm" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Long-term (6 months or more)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}
                
                {step < totalSteps ? (
                  <Button type="button" className="bg-roomie-purple hover:bg-roomie-dark" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" className="bg-roomie-purple hover:bg-roomie-dark">
                    Find Matches
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
};

export default ProfileForm;
