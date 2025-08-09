import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlanAheadMatchingPage() {
  return (
    import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaMapMarkerAlt, FaCalendarAlt, FaCommentAlt, FaPaperPlane, FaSave, FaBrain, FaCalendarCheck, FaFileContract } from 'react-icons/fa';

const RoomiAIForm = () => {
  const [formData, setFormData] = useState({
    currentLocation: '',
    targetLocations: [],
    moveDate: '',
    ageRange: '',
    genderPref: 'any',
    nationality: '',
    languagePref: '',
    dietaryPref: {
      none: false,
      veg: false,
      vegan: false,
      gluten: false,
      kosher: false,
      halal: false
    },
    occupationPref: {
      student: false,
      professional: false,
      freelancer: false,
      remote: false,
      none: false
    },
    workSchedulePref: '',
    ethnicityPref: '',
    religionPref: '',
    petPref: 'nopref',
    smokePref: 'nopref',
    additionalInfo: ''
  });

  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Set default move date to 30 days from now
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(defaultDate.getDate() + 30);
    const defaultDateStr = defaultDate.toISOString().split('T')[0];
    
    setFormData(prev => ({
      ...prev,
      moveDate: defaultDateStr
    }));
  }, []);

  const handleAddLocation = () => {
    if (newLocation.trim() && formData.targetLocations.length < 5) {
      if (!formData.targetLocations.includes(newLocation.trim())) {
        setFormData(prev => ({
          ...prev,
          targetLocations: [...prev.targetLocations, newLocation.trim()]
        }));
        setNewLocation('');
      }
    }
  };

  const handleRemoveLocation = (index) => {
    setFormData(prev => {
      const updatedLocations = [...prev.targetLocations];
      updatedLocations.splice(index, 1);
      return {
        ...prev,
        targetLocations: updatedLocations
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const field = name.includes('diet') ? 'dietaryPref' : 'occupationPref';
    const key = name.split('-')[1];
    
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: checked
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Your preferences have been saved! Our AI is now finding your perfect co-living match.');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container">
      <header>
        <h1 className="logo">
          <FaRobot /> Roomi AI
        </h1>
        <p className="tagline">The World's First Fully Automated Co-Living Platform</p>
      </header>
      
      <div className="form-container">
        <div className="form-header">
          <h2>Plan Ahead for Your Future Co-Living Space</h2>
          <p>Our AI will find your perfect match based on your preferences for future relocations</p>
        </div>
        
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>
            
            <div className="form-note">
              <div className="ai-icon">
                <FaLightbulb />
              </div>
              <div>
                <strong>AI Tip:</strong> The more details you provide, the better our AI can match you with compatible roommates and living spaces.
              </div>
            </div>
            
            {/* Location Preferences */}
            <div className="form-section">
              <div className="section-title">
                <FaMapMarkerAlt />
                <h3>Location Preferences</h3>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentLocation" className="required">Current Location</label>
                  <input
                    type="text"
                    id="currentLocation"
                    name="currentLocation"
                    value={formData.currentLocation}
                    onChange={handleInputChange}
                    required
                    placeholder="City or country where you currently live"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="targetLocation" className="required">Target Location(s)</label>
                  <div className="location-input-container">
                    <input
                      type="text"
                      id="targetLocation"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Add up to 5 cities or countries"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                    />
                    <button
                      type="button"
                      className="add-location-btn"
                      onClick={handleAddLocation}
                      disabled={formData.targetLocations.length >= 5}
                    >
                      +
                    </button>
                  </div>
                  <div className="location-tags">
                    {formData.targetLocations.map((location, index) => (
                      <div key={index} className="location-tag">
                        {location}
                        <span
                          className="remove-location"
                          onClick={() => handleRemoveLocation(index)}
                        >
                          &times;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="moveDate" className="required">Planned Move Date</label>
                <input
                  type="date"
                  id="moveDate"
                  name="moveDate"
                  value={formData.moveDate}
                  onChange={handleInputChange}
                  required
                  min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Lifestyle & Schedule Preferences */}
            <div className="form-section">
              <div className="section-title">
                <FaCalendarAlt />
                <h3>Lifestyle & Schedule Preferences</h3>
              </div>
              
              <div className="form-group">
                <label className="required">Your Age Range</label>
                <div className="radio-group">
                  {['18-24', '25-30', '31-40', '41-50', '51+'].map((range) => (
                    <div key={range} className="radio-item">
                      <input
                        type="radio"
                        id={`age-${range}`}
                        name="ageRange"
                        value={range}
                        checked={formData.ageRange === range}
                        onChange={handleInputChange}
                      />
                      <label htmlFor={`age-${range}`}>{range}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="required">Gender Preference for Roommate</label>
                <div className="radio-group">
                  {['any', 'male', 'female', 'nonbinary'].map((gender) => (
                    <div key={gender} className="radio-item">
                      <input
                        type="radio"
                        id={`gender-${gender}`}
                        name="genderPref"
                        value={gender}
                        checked={formData.genderPref === gender}
                        onChange={handleInputChange}
                      />
                      <label htmlFor={`gender-${gender}`}>
                        {gender === 'any' ? 'No Preference' : 
                         gender === 'nonbinary' ? 'Non-binary' : 
                         gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nationality">Nationality Preference (optional)</label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="e.g., American, European, Asian, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="languagePref" className="required">Language Preference</label>
                  <input
                    type="text"
                    id="languagePref"
                    name="languagePref"
                    value={formData.languagePref}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., English, Spanish, French, etc."
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Dietary Preferences</label>
                <div className="checkbox-group">
                  {[
                    { id: 'diet-none', value: 'none', label: 'No Restrictions' },
                    { id: 'diet-veg', value: 'veg', label: 'Vegetarian' },
                    { id: 'diet-vegan', value: 'vegan', label: 'Vegan' },
                    { id: 'diet-gluten', value: 'gluten', label: 'Gluten-Free' },
                    { id: 'diet-kosher', value: 'kosher', label: 'Kosher' },
                    { id: 'diet-halal', value: 'halal', label: 'Halal' }
                  ].map((item) => (
                    <div key={item.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={item.id}
                        name={`diet-${item.value}`}
                        checked={formData.dietaryPref[item.value]}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor={item.id}>{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Roommate Occupation Preference</label>
                <div className="checkbox-group">
                  {[
                    { id: 'occ-student', value: 'student', label: 'Student' },
                    { id: 'occ-professional', value: 'professional', label: 'Professional' },
                    { id: 'occ-freelancer', value: 'freelancer', label: 'Freelancer' },
                    { id: 'occ-remote', value: 'remote', label: 'Remote Worker' },
                    { id: 'occ-none', value: 'none', label: 'No Preference' }
                  ].map((item) => (
                    <div key={item.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={item.id}
                        name={`occ-${item.value}`}
                        checked={formData.occupationPref[item.value]}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor={item.id}>{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="workSchedulePref" className="required">Work Schedule Preference for Roommate</label>
                <select
                  id="workSchedulePref"
                  name="workSchedulePref"
                  value={formData.workSchedulePref}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select preferred schedule</option>
                  <option value="same">Same as mine</option>
                  <option value="9to5">9 AM - 5 PM</option>
                  <option value="flexible">Flexible Hours</option>
                  <option value="nightShift">Night Shift</option>
                  <option value="shiftWorker">Shift Worker</option>
                  <option value="student">Student Schedule</option>
                  <option value="remote">Remote/Freelance</option>
                  <option value="none">No Preference</option>
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ethnicityPref">Ethnicity Preference (optional)</label>
                  <input
                    type="text"
                    id="ethnicityPref"
                    name="ethnicityPref"
                    value={formData.ethnicityPref}
                    onChange={handleInputChange}
                    placeholder="e.g., Caucasian, Hispanic, Asian, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="religionPref">Religion Preference (optional)</label>
                  <input
                    type="text"
                    id="religionPref"
                    name="religionPref"
                    value={formData.religionPref}
                    onChange={handleInputChange}
                    placeholder="e.g., Christian, Muslim, Jewish, etc."
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="required">Pet Preference</label>
                  <div className="radio-group">
                    {['yes', 'no', 'nopref'].map((pref) => (
                      <div key={`pet-${pref}`} className="radio-item">
                        <input
                          type="radio"
                          id={`pet-${pref}`}
                          name="petPref"
                          value={pref}
                          checked={formData.petPref === pref}
                          onChange={handleInputChange}
                        />
                        <label htmlFor={`pet-${pref}`}>
                          {pref === 'yes' ? 'Pets Allowed' : 
                           pref === 'no' ? 'No Pets' : 'No Preference'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="required">Smoking Preference</label>
                  <div className="radio-group">
                    {['yes', 'no', 'nopref'].map((pref) => (
                      <div key={`smoke-${pref}`} className="radio-item">
                        <input
                          type="radio"
                          id={`smoke-${pref}`}
                          name="smokePref"
                          value={pref}
                          checked={formData.smokePref === pref}
                          onChange={handleInputChange}
                        />
                        <label htmlFor={`smoke-${pref}`}>
                          {pref === 'yes' ? 'Smoking Allowed' : 
                           pref === 'no' ? 'Non-Smoking Only' : 'No Preference'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <div className="section-title">
                <FaCommentAlt />
                <h3>Additional Preferences</h3>
              </div>
              
              <div className="form-group">
                <label htmlFor="additionalInfo">Anything else we should know?</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Special requirements, additional preferences, or other information that might help us find your perfect match..."
                ></textarea>
              </div>
            </div>
            
            <div className="submit-section">
              <button type="submit" className="btn" disabled={isSubmitting}>
                <FaSave /> {isSubmitting ? 'Saving...' : 'Save and Find My Perfect Match'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <h2 className="ai-feature-highlight">Roomi AI Advanced Features</h2>
      
      <div className="ai-features">
        <div className="feature-card">
          <h3><FaBrain /> AI-Powered Matching</h3>
          <p>Our algorithm pairs roommates based on lifestyle, values, schedules, and preferences for the perfect match.</p>
        </div>
        
        <div className="feature-card">
          <h3><FaCalendarCheck /> Smart Move-In Coordination</h3>
          <p>Plan your relocation in advance with our "Plan Ahead" system that matches you with future availability.</p>
        </div>
        
        <div className="feature-card">
          <h3><FaFileContract /> Automated Lease Agreements</h3>
          <p>Generate and e-sign legally compliant leases in minutes—no lawyers or paperwork required.</p>
        </div>
      </div>
      
      <footer>
        <p>© {new Date().getFullYear()} Roomi AI. Revolutionizing Co-Living Experiences. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RoomiAIForm;