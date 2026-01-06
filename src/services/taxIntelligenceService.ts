import { supabase } from "@/integrations/supabase/client";

// Types
export interface TaxEntry {
    id: string;
    user_id: string;
    entry_date: string;
    role: 'operator' | 'renovator';
    province: string;
    rent: number;
    other_income: number;
    renovation: number;
    other_expense: number;
    total_income?: number;
    total_expense?: number;
    net_amount?: number;
    income_notes?: string;
    expense_notes?: string;
    renovation_classification?: 'repair' | 'capital_improvement' | 'unknown';
    created_at?: string;
    updated_at?: string;
}

export interface CreateTaxEntryData {
    entry_date: string;
    role: 'operator' | 'renovator';
    province: string;
    rent: number;
    other_income: number;
    renovation: number;
    other_expense: number;
    income_notes?: string;
    expense_notes?: string;
    renovation_classification?: 'repair' | 'capital_improvement' | 'unknown';
}

export interface UpdateTaxEntryData {
    rent?: number;
    other_income?: number;
    renovation?: number;
    other_expense?: number;
    income_notes?: string;
    expense_notes?: string;
    renovation_classification?: 'repair' | 'capital_improvement' | 'unknown';
}

/**
 * Tax Intelligence Service
 * Handles all Supabase operations for tax entries
 */
export const taxIntelligenceService = {
    /**
     * Get all tax entries for the current user
     */
    async getEntries(): Promise<TaxEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('tax_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get tax entry for a specific date
     */
    async getEntryByDate(date: string): Promise<TaxEntry | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('tax_entries')
            .select('*')
            .eq('user_id', user.id)
            .eq('entry_date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data || null;
    },

    /**
     * Create or update a tax entry (upsert)
     */
    async upsertEntry(entryData: CreateTaxEntryData): Promise<TaxEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check if entry exists for this date
        const existing = await this.getEntryByDate(entryData.entry_date);

        if (existing) {
            // Update existing entry
            const { data, error } = await supabase
                .from('tax_entries')
                .update({
                    rent: entryData.rent,
                    other_income: entryData.other_income,
                    renovation: entryData.renovation,
                    other_expense: entryData.other_expense,
                    role: entryData.role,
                    province: entryData.province,
                    income_notes: entryData.income_notes,
                    expense_notes: entryData.expense_notes,
                    renovation_classification: entryData.renovation_classification
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } else {
            // Create new entry
            const { data, error } = await supabase
                .from('tax_entries')
                .insert({
                    user_id: user.id,
                    ...entryData
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }
    },

    /**
     * Save income data for a specific date
     */
    async saveIncome(date: string, rent: number, otherIncome: number, role: 'operator' | 'renovator', province: string): Promise<TaxEntry> {
        const existing = await this.getEntryByDate(date);

        return this.upsertEntry({
            entry_date: date,
            role,
            province,
            rent,
            other_income: otherIncome,
            renovation: existing?.renovation || 0,
            other_expense: existing?.other_expense || 0
        });
    },

    /**
     * Save expense data for a specific date
     */
    async saveExpense(date: string, renovation: number, otherExpense: number, role: 'operator' | 'renovator', province: string): Promise<TaxEntry> {
        const existing = await this.getEntryByDate(date);

        return this.upsertEntry({
            entry_date: date,
            role,
            province,
            rent: existing?.rent || 0,
            other_income: existing?.other_income || 0,
            renovation,
            other_expense: otherExpense
        });
    },

    /**
     * Update an existing entry
     */
    async updateEntry(entryId: string, updates: UpdateTaxEntryData): Promise<TaxEntry> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('tax_entries')
            .update(updates)
            .eq('id', entryId)
            .eq('user_id', user.id) // Extra security check
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a tax entry
     */
    async deleteEntry(entryId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('tax_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', user.id); // Extra security check

        if (error) throw error;
    },

    /**
     * Delete all entries for the current user (clear history)
     */
    async clearAllEntries(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('tax_entries')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;
    },

    /**
     * Get entries for a date range (for reporting)
     */
    async getEntriesInRange(startDate: string, endDate: string): Promise<TaxEntry[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('tax_entries')
            .select('*')
            .eq('user_id', user.id)
            .gte('entry_date', startDate)
            .lte('entry_date', endDate)
            .order('entry_date', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Get summary statistics for a date range
     */
    async getSummary(startDate?: string, endDate?: string): Promise<{
        totalIncome: number;
        totalExpense: number;
        netAmount: number;
        entryCount: number;
    }> {
        const entries = startDate && endDate
            ? await this.getEntriesInRange(startDate, endDate)
            : await this.getEntries();

        const totalIncome = entries.reduce((sum, e) => sum + (e.rent || 0) + (e.other_income || 0), 0);
        const totalExpense = entries.reduce((sum, e) => sum + (e.renovation || 0) + (e.other_expense || 0), 0);

        return {
            totalIncome,
            totalExpense,
            netAmount: totalIncome - totalExpense,
            entryCount: entries.length
        };
    }
};

export default taxIntelligenceService;
