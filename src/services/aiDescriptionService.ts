
import { supabase } from "@/integrations/supabase/client";
import { DetailedAmenitiesInfo } from "@/types/detailedAmenities";

export interface PropertyDescriptionInput {
    address: string;
    propertyType: string;
    monthlyRent: string;
    bedrooms: string;
    bathrooms: string;
    amenities: string[];
    nearbyAmenities: string[]; // From detailed detection or manual
    detailedDetection?: DetailedAmenitiesInfo; // For more context
    images: string[];
}

export class AiDescriptionService {

    /**
     * Generates a property description using AI (via Supabase Edge Function).
     * It analyzes the property details, location data, and images (if supported by the backend model).
     */
    async generateDescription(input: PropertyDescriptionInput): Promise<string> {
        try {
            console.log('🤖 Generating AI description for:', input.address);

            // Call the Supabase Edge Function 'generate-description'
            // This assumes the backend has the OpenAI/Gemini API key configured.
            const { data, error } = await supabase.functions.invoke('generate-property-description', {
                body: {
                    address: input.address,
                    propertyType: input.propertyType,
                    monthlyRent: input.monthlyRent,
                    bedrooms: input.bedrooms,
                    bathrooms: input.bathrooms,
                    amenities: input.amenities,
                    nearbyAmenities: input.nearbyAmenities,
                    detailedDetection: input.detailedDetection,
                    imageUrls: input.images // Pass image URLs for analysis
                }
            });

            if (error) {
                console.warn('⚠️ AI Edge Function failed, falling back to local generation:', error);
                return this.generateLocalDescription(input);
            }

            if (data?.description) {
                return data.description;
            }

            return this.generateLocalDescription(input);

        } catch (error) {
            console.error('❌ Error generating description:', error);
            return this.generateLocalDescription(input);
        }
    }

    /**
     * Generates a sales voice audio for the property description.
     * Calls a Supabase Edge Function 'generate-audio-description' which interfaces with TTS providers (OpenAI/ElevenLabs).
     * Returns the public URL of the generated audio file.
     */
    async generateAudioDescription(description: string, propertyId: string): Promise<string> {
        try {
            console.log('🎙️ Generating AI sales voice for property:', propertyId);

            // Call the Supabase Edge Function 'generate-audio-description'
            const { data, error } = await supabase.functions.invoke('generate-audio-description', {
                body: {
                    description: description,
                    propertyId: propertyId,
                    voiceId: 'alloy' // Default voice, can be parameterized
                }
            });

            if (error) {
                // console.error('❌ AI Audio Edge Function failed:', error);
                throw new Error('Failed to generate audio description');
            }

            if (data?.audioUrl) {
                console.log('✅ Audio generated successfully:', data.audioUrl);
                return data.audioUrl;
            }

            throw new Error('No audio URL returned from service');

        } catch (error) {
            // console.error('❌ Error generating audio description:', error);

            // Fallback to local browser TTS for demo/preview purposes
            if ('speechSynthesis' in window) {
                console.log('⚠️ Falling back to local browser TTS');
                const utterance = new SpeechSynthesisUtterance(description);
                // Try to find a good voice
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
                if (preferredVoice) utterance.voice = preferredVoice;

                window.speechSynthesis.speak(utterance);
                return 'local-tts-preview';
            }

            throw error;
        }
    }

    /**
     * Generates a conversational "Podcast Style" script for the sales agent.
     * This is used when real AI audio generation is not available.
     */
    generatePodcastScript(input: PropertyDescriptionInput): string {
        const { address, propertyType, monthlyRent, bedrooms, bathrooms, amenities, detailedDetection } = input;

        // Extract street name for a more natural flow
        const streetName = address.split(',')[0];
        const bedText = bedrooms === '0' ? 'studio' : `${bedrooms}-bedroom`;
        const bathText = bathrooms === '1' ? 'one bath' : `${bathrooms} baths`;

        let script = `Hey there! Welcome to what could be your next dream home. Today we're checking out a fantastic ${propertyType} right at ${streetName}. `;

        script += `If you're looking for value, this is it. It's a gorgeous ${bedText} unit with ${bathText}, going for just ${monthlyRent} a month. `;

        if (amenities.length > 0) {
            const topAmenities = amenities.slice(0, 3).join(', ');
            script += `Life here is super convenient. You've got access to great amenities like ${topAmenities}, which really elevates the lifestyle. `;
        }

        // Neighborhood / Facilities
        if (detailedDetection) {
            const transit = [...detailedDetection.metro, ...detailedDetection.buses].map(t => t.name).slice(0, 2);
            const shops = [...detailedDetection.shoppingMalls, ...detailedDetection.plazas].map(s => s.name).slice(0, 2);

            if (transit.length > 0) {
                script += `Commuting? No problem. The ${transit.join(' and ')} are super close. `;
            }
            if (shops.length > 0) {
                script += `Plus, weekend errands are a breeze with ${shops.join(' and ')} right around the corner. `;
            }
        } else if (input.nearbyAmenities && input.nearbyAmenities.length > 0) {
            script += `The neighborhood is vibrant, with ${input.nearbyAmenities.slice(0, 3).join(', ')} just moments away. `;
        }

        script += `Honestly, places like this don't stay on the market long. It's properly managed, fully equipped, and ready for you to move in. Come check it out before it's gone!`;

        return script;
    }

    /**
     * Fallback local generator if AI service is unavailable.
     * Uses template-based generation with the rich data available.
     */
    private generateLocalDescription(input: PropertyDescriptionInput): string {
        const { address, propertyType, monthlyRent, bedrooms, bathrooms, amenities, detailedDetection } = input;

        // 1. Hook / Intro
        let description = `Discover your new home at this stunning ${propertyType} located at ${address}. `;

        // 2. Key Features
        const bedText = bedrooms === '0' ? 'studio' : `${bedrooms}-bedroom`;
        const bathText = `${bathrooms}-bathroom`;
        description += `This ${bedText}, ${bathText} unit offers a comfortable living space for $${monthlyRent}/month. `;

        // 3. Amenities Highlight
        if (amenities.length > 0) {
            description += `Key features include ${amenities.slice(0, 3).join(', ')}${amenities.length > 3 ? `, and more` : ''}. `;
        }

        // 4. Location & Nearby Facilities (using detailed detection if available)
        if (detailedDetection) {
            const metroNames = detailedDetection.metro.map(m => m.name);
            const busNames = detailedDetection.buses.map(b => b.name);
            const transitNames = [...metroNames, ...busNames].slice(0, 2);

            const shopNames = detailedDetection.shoppingMalls.concat(detailedDetection.plazas).map(s => s.name).slice(0, 2);

            if (transitNames.length > 0) {
                description += `Commuting is a breeze with ${transitNames.join(' and ')} just steps away. `;
            }

            if (shopNames.length > 0) {
                description += ` Enjoy convenient shopping at nearby ${shopNames.join(' and ')}.`;
            }
        } else if (input.nearbyAmenities && input.nearbyAmenities.length > 0) {
            description += `Conveniently located near ${input.nearbyAmenities.slice(0, 3).join(', ')}.`;
        }

        // 5. Outro
        description += ` Don't miss out on this fantastic opportunity!`;

        return description;
    }
}

export const aiDescriptionService = new AiDescriptionService();
