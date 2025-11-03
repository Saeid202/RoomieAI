-- Insert mock data into profiles table
INSERT INTO public.profiles (id, full_name, email, created_at, updated_at) VALUES
(gen_random_uuid(), 'Mock John Smith', 'mock.john.smith@example.com', now(), now()),
(gen_random_uuid(), 'Mock Sarah Johnson', 'mock.sarah.johnson@example.com', now(), now()),
(gen_random_uuid(), 'Mock Mike Chen', 'mock.mike.chen@example.com', now(), now()),
(gen_random_uuid(), 'Mock Lisa Anderson', 'mock.lisa.anderson@example.com', now(), now()),
(gen_random_uuid(), 'Mock David Wilson', 'mock.david.wilson@example.com', now(), now()),
(gen_random_uuid(), 'Mock Emma Brown', 'mock.emma.brown@example.com', now(), now()),
(gen_random_uuid(), 'Mock Alex Garcia', 'mock.alex.garcia@example.com', now(), now()),
(gen_random_uuid(), 'Mock Maria Rodriguez', 'mock.maria.rodriguez@example.com', now(), now()),
(gen_random_uuid(), 'Mock James Lee', 'mock.james.lee@example.com', now(), now()),
(gen_random_uuid(), 'Mock Jennifer Taylor', 'mock.jennifer.taylor@example.com', now(), now());

-- Insert mock data into roommate table
INSERT INTO public.roommate (user_id, full_name, email, age, gender, occupation, phone_number, preferred_location, budget_range, move_in_date, housing_type, living_space, has_pets, smoking, lives_with_smokers, diet, work_location, work_schedule, pet_preference, roommate_gender_preference, roommate_lifestyle_preference, hobbies, important_roommate_traits, linkedin_profile, created_at, updated_at) VALUES
(gen_random_uuid(), 'Mock Alex Johnson', 'mock.alex.johnson@example.com', 25, 'Male', 'Software Engineer', '+1234567890', 'Downtown', '$1200-$1800', '2024-02-01', 'Apartment', 'Shared', false, false, false, 'Omnivore', 'Tech District', '9AM-5PM', 'No pets', 'Any', 'Clean and quiet', ARRAY['coding', 'gaming', 'hiking'], ARRAY['organized', 'quiet', 'friendly'], 'https://linkedin.com/in/mock-alex-johnson', now(), now()),
(gen_random_uuid(), 'Mock Sarah Chen', 'mock.sarah.chen@example.com', 28, 'Female', 'Marketing Manager', '+1234567891', 'Midtown', '$1000-$1600', '2024-03-15', 'Apartment', 'Shared', true, false, false, 'Vegetarian', 'Business District', '8AM-4PM', 'Cat friendly', 'Female preferred', 'Active lifestyle', ARRAY['yoga', 'reading', 'cooking'], ARRAY['clean', 'respectful', 'active'], 'https://linkedin.com/in/mock-sarah-chen', now(), now()),
(gen_random_uuid(), 'Mock Mike Rodriguez', 'mock.mike.rodriguez@example.com', 30, 'Male', 'Graphic Designer', '+1234567892', 'Arts District', '$800-$1400', '2024-04-01', 'Loft', 'Private room', false, false, true, 'Omnivore', 'Creative Hub', '10AM-6PM', 'No pets', 'Any', 'Creative and social', ARRAY['art', 'photography', 'music'], ARRAY['creative', 'social', 'easygoing'], 'https://linkedin.com/in/mock-mike-rodriguez', now(), now()),
(gen_random_uuid(), 'Mock Emily Davis', 'mock.emily.davis@example.com', 26, 'Female', 'Nurse', '+1234567893', 'Medical District', '$900-$1300', '2024-05-01', 'Apartment', 'Shared', true, false, false, 'Pescatarian', 'Hospital Area', 'Rotating shifts', 'Dog friendly', 'Female preferred', 'Quiet and clean', ARRAY['fitness', 'cooking', 'volunteering'], ARRAY['responsible', 'clean', 'caring'], 'https://linkedin.com/in/mock-emily-davis', now(), now()),
(gen_random_uuid(), 'Mock Ryan Wilson', 'mock.ryan.wilson@example.com', 29, 'Male', 'Financial Analyst', '+1234567894', 'Financial District', '$1500-$2200', '2024-06-01', 'High-rise', 'Private room', false, false, false, 'Omnivore', 'Wall Street', '7AM-3PM', 'No pets', 'Male preferred', 'Professional and quiet', ARRAY['finance', 'running', 'reading'], ARRAY['professional', 'organized', 'ambitious'], 'https://linkedin.com/in/mock-ryan-wilson', now(), now()),
(gen_random_uuid(), 'Mock Jessica Liu', 'mock.jessica.liu@example.com', 24, 'Female', 'Graduate Student', '+1234567895', 'University Area', '$600-$1000', '2024-07-01', 'Shared house', 'Shared', false, false, false, 'Vegan', 'Campus', 'Flexible', 'Any pets', 'Any', 'Studious and friendly', ARRAY['studying', 'language learning', 'travel'], ARRAY['studious', 'international', 'friendly'], 'https://linkedin.com/in/mock-jessica-liu', now(), now()),
(gen_random_uuid(), 'Mock Carlos Martinez', 'mock.carlos.martinez@example.com', 32, 'Male', 'Chef', '+1234567896', 'Restaurant District', '$1000-$1500', '2024-08-01', 'Apartment', 'Private room', false, false, false, 'Omnivore', 'Various locations', 'Evening shifts', 'No pets', 'Any', 'Food lover and social', ARRAY['cooking', 'food tasting', 'socializing'], ARRAY['culinary', 'social', 'night owl'], 'https://linkedin.com/in/mock-carlos-martinez', now(), now()),
(gen_random_uuid(), 'Mock Amanda Thompson', 'mock.amanda.thompson@example.com', 27, 'Female', 'Teacher', '+1234567897', 'Suburban', '$700-$1100', '2024-09-01', 'Townhouse', 'Shared', true, false, false, 'Vegetarian', 'School District', '7AM-3PM', 'Cat friendly', 'Female preferred', 'Family-oriented', ARRAY['teaching', 'gardening', 'crafts'], ARRAY['nurturing', 'organized', 'patient'], 'https://linkedin.com/in/mock-amanda-thompson', now(), now()),
(gen_random_uuid(), 'Mock Kevin Park', 'mock.kevin.park@example.com', 31, 'Male', 'Data Scientist', '+1234567898', 'Tech Hub', '$1300-$1900', '2024-10-01', 'Modern apartment', 'Private room', false, false, false, 'Omnivore', 'Tech Campus', '9AM-5PM', 'No pets', 'Any', 'Tech-savvy and analytical', ARRAY['data analysis', 'machine learning', 'gaming'], ARRAY['analytical', 'tech-savvy', 'quiet'], 'https://linkedin.com/in/mock-kevin-park', now(), now()),
(gen_random_uuid(), 'Mock Sophia Williams', 'mock.sophia.williams@example.com', 23, 'Female', 'Social Media Manager', '+1234567899', 'Trendy District', '$800-$1200', '2024-11-01', 'Loft', 'Shared', true, false, false, 'Flexitarian', 'Digital Hub', 'Flexible hours', 'Small pets ok', 'Any', 'Creative and outgoing', ARRAY['social media', 'photography', 'events'], ARRAY['creative', 'outgoing', 'trendy'], 'https://linkedin.com/in/mock-sophia-williams', now(), now());

-- Insert mock data into co_owner table
INSERT INTO public.co_owner (user_id, full_name, email, age, occupation, phone_number, preferred_location, investment_capacity, investment_timeline, property_type, co_ownership_experience, created_at, updated_at) VALUES
(gen_random_uuid(), 'Mock Robert Johnson', 'mock.robert.johnson@example.com', 35, 'Investment Banker', '+1234567800', 'Manhattan', ARRAY[500000, 800000], '6-12 months', 'Luxury Condo', 'Experienced', now(), now()),
(gen_random_uuid(), 'Mock Linda Chen', 'mock.linda.chen@example.com', 42, 'Real Estate Agent', '+1234567801', 'Brooklyn', ARRAY[300000, 500000], '3-6 months', 'Townhouse', 'Expert', now(), now()),
(gen_random_uuid(), 'Mock Michael Brown', 'mock.michael.brown@example.com', 38, 'Software Architect', '+1234567802', 'Queens', ARRAY[400000, 600000], '12-18 months', 'Single Family Home', 'Intermediate', now(), now()),
(gen_random_uuid(), 'Mock Patricia Davis', 'mock.patricia.davis@example.com', 45, 'Doctor', '+1234567803', 'Westchester', ARRAY[600000, 900000], '6-12 months', 'Luxury Home', 'Beginner', now(), now()),
(gen_random_uuid(), 'Mock Christopher Wilson', 'mock.christopher.wilson@example.com', 33, 'Entrepreneur', '+1234567804', 'New Jersey', ARRAY[250000, 400000], '3-6 months', 'Condo', 'Experienced', now(), now()),
(gen_random_uuid(), 'Mock Margaret Garcia', 'mock.margaret.garcia@example.com', 40, 'Lawyer', '+1234567805', 'Long Island', ARRAY[450000, 700000], '12-24 months', 'Single Family Home', 'Intermediate', now(), now()),
(gen_random_uuid(), 'Mock Daniel Rodriguez', 'mock.daniel.rodriguez@example.com', 36, 'Finance Director', '+1234567806', 'Connecticut', ARRAY[350000, 550000], '6-12 months', 'Townhouse', 'Beginner', now(), now()),
(gen_random_uuid(), 'Mock Elizabeth Martinez', 'mock.elizabeth.martinez@example.com', 41, 'Marketing Director', '+1234567807', 'Staten Island', ARRAY[300000, 450000], '3-6 months', 'Condo', 'Experienced', now(), now()),
(gen_random_uuid(), 'Mock Anthony Taylor', 'mock.anthony.taylor@example.com', 39, 'Consultant', '+1234567808', 'Bronx', ARRAY[200000, 350000], '12-18 months', 'Apartment', 'Intermediate', now(), now()),
(gen_random_uuid(), 'Mock Mary Anderson', 'mock.mary.anderson@example.com', 37, 'Executive', '+1234567809', 'Yonkers', ARRAY[400000, 650000], '6-12 months', 'Luxury Condo', 'Beginner', now(), now());

-- Insert mock data into Both table
INSERT INTO public.Both (user_id, full_name, email, created_at, updated_at) VALUES
(gen_random_uuid(), 'Mock Jennifer Lopez', 'mock.jennifer.lopez@example.com', now(), now()),
(gen_random_uuid(), 'Mock William Smith', 'mock.william.smith@example.com', now(), now()),
(gen_random_uuid(), 'Mock Ashley Johnson', 'mock.ashley.johnson@example.com', now(), now()),
(gen_random_uuid(), 'Mock Matthew Davis', 'mock.matthew.davis@example.com', now(), now()),
(gen_random_uuid(), 'Mock Nicole Wilson', 'mock.nicole.wilson@example.com', now(), now()),
(gen_random_uuid(), 'Mock Joshua Brown', 'mock.joshua.brown@example.com', now(), now()),
(gen_random_uuid(), 'Mock Stephanie Garcia', 'mock.stephanie.garcia@example.com', now(), now()),
(gen_random_uuid(), 'Mock Andrew Miller', 'mock.andrew.miller@example.com', now(), now()),
(gen_random_uuid(), 'Mock Michelle Rodriguez', 'mock.michelle.rodriguez@example.com', now(), now()),
(gen_random_uuid(), 'Mock Tyler Martinez', 'mock.tyler.martinez@example.com', now(), now());