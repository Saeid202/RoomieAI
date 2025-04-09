
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { findMatches } from "@/utils/matchingAlgorithm";

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    occupation: "",
    movingDate: "",
    budget: [800, 1200],
    location: "",
    cleanliness: 50,
    pets: false,
    smoking: false,
    drinking: "sometimes",
    guests: "sometimes",
    sleepSchedule: "normal",
    interests: [],
  });
  
  const totalSteps = 3;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleCheckboxChange = (name) => (checked) => {
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleSelectChange = (name) => (value) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSliderChange = (name) => (value) => {
    setFormData({ ...formData, [name]: value[0] });
  };
  
  const handleBudgetChange = (value) => {
    setFormData({ ...formData, budget: value });
  };
  
  const handleInterestToggle = (interest) => {
    const currentInterests = [...formData.interests];
    if (currentInterests.includes(interest)) {
      setFormData({
        ...formData,
        interests: currentInterests.filter(i => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...currentInterests, interest]
      });
    }
  };
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const matches = findMatches(formData);
    setMatchResults(matches);
    setShowResults(true);
  };
  
  const [showResults, setShowResults] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  
  const interests = [
    "Fitness", "Cooking", "Reading", "Movies", "Art", 
    "Music", "Travel", "Gaming", "Sports", "Outdoors",
    "Tech", "Pets", "Photography"
  ];

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
                    className={`w-10 h-1 rounded-full ${
                      i + 1 <= step ? "bg-roomie-purple" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">Step {step} of {totalSteps}</span>
            </div>
            <CardTitle className="text-xl font-bold">
              {step === 1 && "Personal Information"}
              {step === 2 && "Living Preferences"}
              {step === 3 && "Lifestyle & Interests"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us a bit about yourself"}
              {step === 2 && "What are you looking for in your living situation?"}
              {step === 3 && "Help us match you with compatible roommates"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleInputChange}
                        placeholder="Your age"
                        min="18"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={handleSelectChange("gender")}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="Your occupation"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="movingDate">When are you looking to move?</Label>
                    <Input
                      id="movingDate"
                      name="movingDate"
                      type="date"
                      value={formData.movingDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="budget">Monthly Budget Range ($)</Label>
                    <div className="pt-5 px-2">
                      <Slider
                        defaultValue={formData.budget}
                        min={500}
                        max={3000}
                        step={50}
                        onValueChange={handleBudgetChange}
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>${formData.budget[0]}</span>
                        <span>${formData.budget[1]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="location">Preferred Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, neighborhood, etc."
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="cleanliness">Cleanliness Level</Label>
                    <div className="pt-5 px-2">
                      <Slider
                        defaultValue={[formData.cleanliness]}
                        max={100}
                        step={10}
                        onValueChange={handleSliderChange("cleanliness")}
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>Relaxed</span>
                        <span>Neat</span>
                        <span>Very Clean</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pets" 
                        checked={formData.pets}
                        onCheckedChange={handleCheckboxChange("pets")}
                      />
                      <Label htmlFor="pets" className="cursor-pointer">Pet Friendly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="smoking" 
                        checked={formData.smoking}
                        onCheckedChange={handleCheckboxChange("smoking")}
                      />
                      <Label htmlFor="smoking" className="cursor-pointer">Smoking Allowed</Label>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="drinking">Drinking Habits</Label>
                    <Select 
                      value={formData.drinking} 
                      onValueChange={handleSelectChange("drinking")}
                    >
                      <SelectTrigger id="drinking">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="sometimes">Sometimes</SelectItem>
                        <SelectItem value="often">Often</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="guests">How often do you have guests over?</Label>
                    <Select 
                      value={formData.guests} 
                      onValueChange={handleSelectChange("guests")}
                    >
                      <SelectTrigger id="guests">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="rarely">Rarely</SelectItem>
                        <SelectItem value="sometimes">Sometimes</SelectItem>
                        <SelectItem value="often">Often</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="sleepSchedule">Sleep Schedule</Label>
                    <Select 
                      value={formData.sleepSchedule} 
                      onValueChange={handleSelectChange("sleepSchedule")}
                    >
                      <SelectTrigger id="sleepSchedule">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="early">Early Bird (Before 10PM)</SelectItem>
                        <SelectItem value="normal">Average (10PM - 12AM)</SelectItem>
                        <SelectItem value="night">Night Owl (After 12AM)</SelectItem>
                        <SelectItem value="variable">Variable Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Interests (Select all that apply)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {interests.map((interest) => (
                        <div
                          key={interest}
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                            formData.interests.includes(interest)
                              ? "bg-roomie-purple text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
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
        </Card>
      </div>
    </section>
  );
};

export default ProfileForm;
