      rental_payments: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          landlord_id: string | null
          lease_id: string | null
          note: string | null
          paid_at: string | null
          payment_intent_id: string | null
          payment_method: string | null
          payment_source: string | null
          payment_status: string | null
          payment_type: string | null
          processed_at: string | null
          processing_status: string | null
          property_id: string | null
          recipient_email: string | null
          rent_ledger_id: string | null
          tenant_id: string | null
          transaction_id: string
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          landlord_id?: string | null
          lease_id?: string | null
          note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_source?: string | null
          payment_status?: string | null
          payment_type?: string | null
          processed_at?: string | null
          processing_status?: string | null
          property_id?: string | null
          recipient_email?: string | null
          rent_ledger_id?: string | null
          tenant_id?: string | null
          transaction_id: string
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          landlord_id?: string | null
          lease_id?: string | null
          note?: string | null
          paid_at?: string | null
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_source?: string | null
          payment_status?: string | null
          payment_type?: string | null
          processed_at?: string | null
          processing_status?: string | null
          property_id?: string | null
          recipient_email?: string | null
          rent_ledger_id?: string | null
          tenant_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "rental_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "lease_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_payments_rent_ledger_id_fkey"
            columns: ["rent_ledger_id"]
            isOneToOne: false
            referencedRelation: "rent_ledgers"
