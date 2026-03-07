import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchLawyerClients } from "@/services/lawyerService";
import { LawyerClientRelationship } from "@/types/lawyer";
import { User, Calendar, Search, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CaseDetailsModal } from "@/components/lawyer/CaseDetailsModal";
import { AddClientModal } from "@/components/lawyer/AddClientModal";

export default function LawyerClients() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<LawyerClientRelationship[]>([]);
  const [filteredClients, setFilteredClients] = useState<LawyerClientRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<LawyerClientRelationship | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [searchQuery, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to continue");
        return;
      }

      const clientData = await fetchLawyerClients(user.id);
      setClients(clientData);
      setFilteredClients(clientData);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchQuery.trim()) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(client => {
      const clientName = client.client?.user_metadata?.full_name?.toLowerCase() || "";
      const clientEmail = client.client?.email?.toLowerCase() || "";
      const caseType = client.case_type.toLowerCase();
      const status = client.status.toLowerCase();
      
      return clientName.includes(query) || 
             clientEmail.includes(query) || 
             caseType.includes(query) ||
             status.includes(query);
    });
    
    setFilteredClients(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'on_hold': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleClientClick = (client: LawyerClientRelationship) => {
    setSelectedClient(client);
    setShowCaseModal(true);
  };

  const handleModalClose = () => {
    setShowCaseModal(false);
    setSelectedClient(null);
    loadClients();
  };

  const handleAddModalClose = () => {
    setShowAddModal(false);
    loadClients();
  };

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
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          My Clients
        </h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search by name, email, case type, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Active Cases</p>
            <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold">{clients.filter(c => c.status === 'pending').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold">{clients.filter(c => c.status === 'completed').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No clients found matching your search" : "No clients yet"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300"
              onClick={() => handleClientClick(client)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {client.client?.user_metadata?.full_name || "Unknown Client"}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">📧</span>
                          <span className="text-gray-700">{client.client?.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-gray-600">
                            Added {new Date(client.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Case:</span>
                        <span className="text-sm font-bold text-purple-600">{client.case_type}</span>
                      </div>

                      {client.case_description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{client.case_description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <Badge className={`${getStatusColor(client.status)} font-semibold`}>
                      {client.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                    {client.retainer_paid && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        Retainer Paid
                      </Badge>
                    )}

                    {client.consultation_date && (
                      <div className="text-xs text-gray-500">
                        Consultation: {new Date(client.consultation_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCaseModal && selectedClient && (
        <CaseDetailsModal
          isOpen={showCaseModal}
          onClose={handleModalClose}
          client={selectedClient}
        />
      )}

      {showAddModal && (
        <AddClientModal
          isOpen={showAddModal}
          onClose={handleAddModalClose}
        />
      )}
    </div>
  );
}
