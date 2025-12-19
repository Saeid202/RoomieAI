import { supabase } from "@/integrations/supabase/client";

export const seedMockRoommates = async () => {
    const mockUsers = [
        {
            user_id: '11111111-1111-1111-1111-111111111111',
            full_name: 'Sarah Chen',
            age: 25,
            gender: 'Female',
            email: 'sarah.chen@example.com',
            phone_number: '+1-555-0101',
            nationality: 'Chinese',
            language: 'Mandarin',
            ethnicity: 'Asian',
            religion: 'Buddhist',
            occupation: 'Software Engineer',
            preferred_location: ['Downtown', 'Tech District', 'University Area'],
            budget_range: [1200, 1800],
            move_in_date_start: '2024-03-01',
            housing_type: 'apartment',
            living_space: 'privateRoom',
            smoking: false,
            has_pets: false,
            work_schedule: 'dayShift',
            hobbies: ['coding', 'yoga', 'cooking', 'reading'],
            diet: 'vegetarian',
            pet_preference_enum: 'noPets',
            smoking_preference: 'noSmoking',
            age_range_preference: [22, 30],
            gender_preference: ['Female', 'Non-binary'],
            nationality_preference: 'custom',
            nationality_custom: 'Chinese, Korean, Japanese',
            language_preference: 'specific',
            language_specific: 'Mandarin, English'
        },
        {
            user_id: '22222222-2222-2222-2222-222222222222',
            full_name: 'Marcus Johnson',
            age: 28,
            gender: 'Male',
            email: 'marcus.johnson@example.com',
            phone_number: '+1-555-0102',
            nationality: 'American',
            language: 'English',
            ethnicity: 'African American',
            religion: 'Christian',
            occupation: 'Graphic Designer',
            preferred_location: ['Creative Hub', 'Arts District', 'Downtown'],
            budget_range: [1000, 1500],
            move_in_date_start: '2024-02-15',
            housing_type: 'house',
            living_space: 'privateRoom',
            smoking: false,
            has_pets: true,
            pet_type: 'Cat',
            work_schedule: 'afternoonShift',
            hobbies: ['photography', 'music', 'art galleries', 'basketball'],
            diet: 'noPreference',
            pet_preference_enum: 'catOk',
            smoking_preference: 'noSmoking',
            age_range_preference: [25, 35],
            gender_preference: ['Male', 'Female']
        },
        {
            user_id: '33333333-3333-3333-3333-333333333333',
            full_name: 'Priya Patel',
            age: 23,
            gender: 'Female',
            email: 'priya.patel@example.com',
            phone_number: '+1-555-0103',
            nationality: 'Indian',
            language: 'Hindi',
            ethnicity: 'South Asian',
            religion: 'Hindu',
            occupation: 'Medical Student',
            preferred_location: ['University Area', 'Medical District', 'Suburbs'],
            budget_range: [800, 1200],
            move_in_date_start: '2024-01-15',
            housing_type: 'apartment',
            living_space: 'privateRoom',
            smoking: false,
            has_pets: false,
            work_schedule: 'overnightShift',
            hobbies: ['studying', 'meditation', 'bollywood dancing', 'volunteering'],
            diet: 'vegetarian',
            pet_preference_enum: 'noPets',
            smoking_preference: 'noSmoking',
            age_range_preference: [20, 28],
            gender_preference: ['Female'],
            nationality_preference: 'sameCountry',
            language_preference: 'sameLanguage'
        }
    ];

    console.log("Seeding mock roommates...");

    for (const user of mockUsers) {
        // Check if user exists
        const { data } = await supabase.from('roommate').select('id').eq('email', user.email).single();

        if (!data) {
            const { error } = await supabase.from('roommate').insert(user);
            if (error) console.error('Error seeding user:', user.full_name, error);
            else console.log('Seeded user:', user.full_name);
        } else {
            console.log('User already exists:', user.full_name);
        }
    }

    return true;
};
