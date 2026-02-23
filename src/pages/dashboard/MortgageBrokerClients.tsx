import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllMortgageProfiles } from "@/services/mortgageBrokerService";
import { MortgageProfile } from "@/types/mortgage";
import { Users, Phone, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MortgageBrokerClients() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<MortgageProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const mortgageProfiles = await fetchAllMortgageProfiles();
      setClients(mortgageProfiles);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.full_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone_number?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 space-y-6 pb-10">
      {/* Page Header with Organizational Style */}
      <div className="relative bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-indigo-500/30 rounded-3xl p-4 border-2 border-white/50 shadow-2xl backdrop-blur-sm overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-yellow-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-purple-400/40 to-indigo-400/40 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        {/* Header Content - Left Aligned */}
        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Client Applications
            </h1>
            <p className="text-sm text-gray-700 font-medium">
              View and manage your client mortgage applications
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-10">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-600" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-purple-200 focus:border-purple-500 bg-white/90"
          />
        </div>
      </div>

      {/* Clients List */}
      <Card className="border-2 hover:border-white/60 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-pink-400/10 to-purple-400/10 opacity-50"></div>
        <CardContent className="p-6 relative z-10">
          <div className="mb-4">
            <h2 className="text-xl font-black text-gray-900 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
            </h2>
          </div>
          
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-gray-900 font-bold text-lg">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </p>
              <p className="text-sm text-gray-600 mt-1 font-medium">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Clients who fill out mortgage profiles will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-400 bg-white/90 hover:bg-white transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-gray-900">
                        {client.full_name || "Name not provided"}
                      </h3>
                      <div className="mt-2 space-y-1">
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <Mail className="h-4 w-4 text-purple-600" />
                            {client.email}
                          </div>
                        )}
                        {client.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <Phone className="h-4 w-4 text-purple-600" />
                            {client.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {client.credit_score_range && (
                        <div className="text-sm">
                          <span className="text-gray-600 font-medium">Credit Score: </span>
                          <span className="font-black text-purple-600">{client.credit_score_range}</span>
                        </div>
                      )}
                      {client.purchase_price_range && (
                        <div className="text-sm">
                          <span className="text-gray-600 font-medium">Budget: </span>
                          <span className="font-black text-purple-600">{client.purchase_price_range}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
