import { UseFormReturn } from "react-hook-form";
import { ProfileFormValues } from "@/types/profile";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { PreferenceWithImportance } from "./PreferenceWithImportance";

interface PreferencesTabProps {
  form: UseFormReturn<ProfileFormValues>;
  handleTraitToggle: (trait: string) => void;
}

const roommateQualities = [
  "Clean", "Respectful", "Quiet", "Organized", "Sociable", "Responsible",
  "Communicative", "Considerate", "Reliable", "Friendly", "Adaptable",
  "Easygoing", "Honest", "Tidy", "Punctual"
];

export function PreferencesTab({ form, handleTraitToggle }: PreferencesTabProps) {
  const nationalityPreference = form.watch("nationalityPreference");
  const languagePreference = form.watch("languagePreference");
  const occupationPreference = form.watch("occupationPreference");
  const ethnicityPreference = form.watch("ethnicityPreference");
  const religionPreference = form.watch("religionPreference");
  const petPreference = form.watch("petPreference");
  const dietaryPreferences = form.watch("dietaryPreferences");
  const roommateHobbies = form.watch("roommateHobbies") || [];
  const ageRange = form.watch("ageRangePreference") || [18, 65];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground mb-6">
          Tell us about your ideal roommate preferences to help us find the perfect match.
        </p>
      </div>

      <div className="space-y-8">
        {/* Question 1: Age Range */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="ageRangePreference"
          title="1. Age Range"
        >
          <FormField
            control={form.control}
            name="ageRangePreference"
            render={({ field }) => (
              <FormItem>
                <div className="px-4 py-6">
                  <FormControl>
                    <Slider
                      min={18}
                      max={65}
                      step={1}
                      value={field.value || [18, 65]}
                      onValueChange={field.onChange}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{ageRange[0]} years</span>
                    <span>{ageRange[1]} years</span>
                  </div>
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 2: Gender Preference */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="genderPreference"
          title="2. Gender Preference"
        >
          <FormField
            control={form.control}
            name="genderPreference"
            render={() => (
              <FormItem>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {["Male", "Female", "Gay", "Lesbian", "Transgender", "Bisexual", "Non-Binary", "No preference"].map((option) => (
                    <FormField
                      key={option}
                      control={form.control}
                      name="genderPreference"
                      render={({ field }) => {
                        const isChecked = Array.isArray(field.value) && field.value.includes(option.toLowerCase().replace(" ", "-"));
                        return (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentValue = Array.isArray(field.value) ? field.value : [];
                                  const optionValue = option.toLowerCase().replace(" ", "-");
                                  if (checked) {
                                    field.onChange([...currentValue, optionValue]);
                                  } else {
                                    field.onChange(currentValue.filter((value) => value !== optionValue));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 3: Nationality */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="nationalityPreference"
          title="3. Nationality"
        >
          <FormField
            control={form.control}
            name="nationalityPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sameCountry" id="same-country" />
                        <FormLabel htmlFor="same-country">Same country as me</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noPreference" id="no-pref-nationality" />
                        <FormLabel htmlFor="no-pref-nationality">No preference</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="other-nationality" />
                        <FormLabel htmlFor="other-nationality">Other: specify</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {nationalityPreference === "custom" && (
                    <FormField
                      control={form.control}
                      name="nationalityCustom"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormControl>
                            <Input 
                              placeholder="Please specify nationality preference..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 4: Language Preference */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="languagePreference"
          title="4. Language Preference"
        >
          <FormField
            control={form.control}
            name="languagePreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sameLanguage">Same language as me</SelectItem>
                      <SelectItem value="noPreference">No preference</SelectItem>
                      <SelectItem value="specific">Specific language</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {languagePreference === "specific" && (
                    <FormField
                      control={form.control}
                      name="languageSpecific"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Please specify the language..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 5: Dietary Preferences */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="dietaryPreferences"
          title="5. Dietary Preferences"
        >
          <FormField
            control={form.control}
            name="dietaryPreferences"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vegetarian" id="only-vegetarian" />
                      <FormLabel htmlFor="only-vegetarian">Only vegetarian</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="halal" id="only-halal" />
                      <FormLabel htmlFor="only-halal">Only halal</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="kosher" id="only-kosher" />
                      <FormLabel htmlFor="only-kosher">Only Kosher</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="others" id="dietary-others" />
                      <FormLabel htmlFor="dietary-others">Others</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="noPreference" id="no-dietary-pref" />
                      <FormLabel htmlFor="no-dietary-pref">No preference</FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                
                {dietaryPreferences === "others" && (
                  <FormField
                    control={form.control}
                    name="dietaryOther"
                    render={({ field }) => (
                      <FormItem className="ml-6">
                        <FormControl>
                          <Input 
                            placeholder="Please specify dietary preference..." 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 6: Occupation Preference */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="occupationPreference"
          title="6. Do you have an occupation preference for your roommate?"
        >
          <FormField
            control={form.control}
            name="occupationPreference"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value === "yes")}
                      value={field.value ? "yes" : "no"}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="occ-yes" />
                        <FormLabel htmlFor="occ-yes">Yes (please specify)</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="occ-no" />
                        <FormLabel htmlFor="occ-no">No</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {field.value && (
                    <FormField
                      control={form.control}
                      name="occupationSpecific"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormControl>
                            <Input 
                              placeholder="Please specify occupation preference..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 7: Work Schedule Preference */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="workSchedulePreference"
          title="7. Do you have a work schedule preference for your roommate?"
        >
          <FormField
            control={form.control}
            name="workSchedulePreference"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2 mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dayShift" id="day-shift-pref" />
                      <FormLabel htmlFor="day-shift-pref">Day shift</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nightShift" id="night-shift-pref" />
                      <FormLabel htmlFor="night-shift-pref">Night shift</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overnightShift" id="overnight-shift-pref" />
                      <FormLabel htmlFor="overnight-shift-pref">Overnight shift</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="noPreference" id="no-work-pref" />
                      <FormLabel htmlFor="no-work-pref">No Preference</FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 8: Ethnicity */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="ethnicityPreference"
          title="8. Ethnicity"
        >
          <FormField
            control={form.control}
            name="ethnicityPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-ethnicity" />
                        <FormLabel htmlFor="same-ethnicity">The same as me</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noPreference" id="no-ethnicity-pref" />
                        <FormLabel htmlFor="no-ethnicity-pref">No preference</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="others" id="other-ethnicity" />
                        <FormLabel htmlFor="other-ethnicity">Others</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {ethnicityPreference === "others" && (
                    <FormField
                      control={form.control}
                      name="ethnicityOther"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormControl>
                            <Input 
                              placeholder="Please specify ethnicity preference..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 9: Religion */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="religionPreference"
          title="9. Religion"
        >
          <FormField
            control={form.control}
            name="religionPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="same" id="same-religion" />
                        <FormLabel htmlFor="same-religion">The same as me</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noPreference" id="no-religion-pref" />
                        <FormLabel htmlFor="no-religion-pref">No preference</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="others" id="other-religion" />
                        <FormLabel htmlFor="other-religion">Others</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {religionPreference === "others" && (
                    <FormField
                      control={form.control}
                      name="religionOther"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormControl>
                            <Input 
                              placeholder="Please specify religion preference..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 10: Pet */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="petPreference"
          title="10. Pet"
        >
          <FormField
            control={form.control}
            name="petPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noPets" id="no-pets" />
                        <FormLabel htmlFor="no-pets">No pet at all</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="catOk" id="cat-ok" />
                        <FormLabel htmlFor="cat-ok">Cat is ok</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2 Add">
                        <RadioGroupItem value="smallPetsOk" id="small-pets-ok" />
                        <FormLabel htmlFor="small-pets-ok">Small pet is fine</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  
                  {petPreference === "smallPetsOk" && (
                    <FormField
                      control={form.control}
                      name="petSpecification"
                      render={({ field }) => (
                        <FormItem className="ml-6">
                          <FormControl>
                            <Input 
                              placeholder="Specify pets you won't accept..." 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 11: Smokers */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="smokingPreference"
          title="11. Smokers"
        >
          <FormField
            control={form.control}
            name="smokingPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noSmoking" id="no-smoking" />
                        <FormLabel htmlFor="no-smoking">No smoke at all</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noVaping" id="no-vaping" />
                        <FormLabel htmlFor="no-vaping">No vape</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="socialOk" id="social-ok" />
                        <FormLabel htmlFor="social-ok">Social cigarette is ok</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>

        {/* Question 12: Housing */}
        <PreferenceWithImportance
          form={form}
          preferenceKey="housingPreference"
          title="12. Housing"
        >
          <FormField
            control={form.control}
            name="housingPreference"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-3 mt-3">
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="only-roommate"
                          checked={field.value?.includes("onlyRoommate") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "onlyRoommate"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "onlyRoommate"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="only-roommate">Only roommate</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sharing-room"
                          checked={field.value?.includes("sharingRoom") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "sharingRoom"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "sharingRoom"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="sharing-room">A sharing room</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sharing-apartment"
                          checked={field.value?.includes("sharingApartment") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "sharingApartment"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "sharingApartment"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="sharing-apartment">A sharing apartment (Cando)</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sharing-house"
                          checked={field.value?.includes("sharingHouse") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "sharingHouse"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "sharingHouse"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="sharing-house">A sharing house</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="single-one-bed"
                          checked={field.value?.includes("singleOneBed") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "singleOneBed"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "singleOneBed"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="single-one-bed">A single one bed (Cando)</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="two-bed"
                          checked={field.value?.includes("twoBed") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "twoBed"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "twoBed"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="two-bed">Two Bed (Cando)</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="entire-house"
                          checked={field.value?.includes("entireHouse") || false}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || [];
                            if (checked) {
                              field.onChange([...currentValue, "entireHouse"]);
                            } else {
                              field.onChange(currentValue.filter((v) => v !== "entireHouse"));
                            }
                          }}
                        />
                        <FormLabel htmlFor="entire-house">Entire house or Cando</FormLabel>
                      </div>
                    </div>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
        </PreferenceWithImportance>
      </div>
    </div>
  );
}
