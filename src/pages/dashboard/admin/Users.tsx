import { useMemo, useState, useEffect } from "react";
import { Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Dummy data for demonstration
const dummyUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "seeker", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "landlord", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "developer", status: "inactive" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", role: "admin", status: "active" },
];

type Role = "seeker" | "landlord" | "developer" | "admin";
type Status = "active" | "inactive";

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: Role; status: Status }>({
    name: "",
    email: "",
    role: "seeker",
    status: "active",
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');

      if (error) throw error;

      // Transform data if needed, assuming user_profiles has role
      // If role is missing, default to 'seeker'
      const mappedUsers = data.map((u: any) => ({
        id: u.id,
        name: u.full_name || "Unknown",
        email: u.email || "No Email",
        role: u.role || "seeker",
        status: "active" // user_profiles might not have status, default active
      }));

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      // 1. Update local state immediately for responsiveness
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

      // 2. Update in Database (user_profiles)
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // 3. Also update App Metadata via RPC (if we had one) or Edge Function
      // For now, updating the profile column is what we display.

      toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
      fetchUsers(); // Revert on error
    }
  };

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const openEdit = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    setEditingId(id);
    setForm({ name: user.name, email: user.email, role: user.role as Role, status: user.status as Status });
    setIsDialogOpen(true);
  };

  // ... handleSave ... is strictly for the Dialog, which duplicates functionality.
  // We can keep it but update it to use supabase.

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: form.name,
          role: form.role
          // Email usually can't be updated this way in Supabase Auth, only profile display
        })
        .eq('id', editingId);

      if (error) throw error;

      setUsers(prev => prev.map(u => (u.id === editingId ? { ...u, ...form } : u)));
      setIsDialogOpen(false);
      toast({ title: "User updated", description: `${form.name} has been saved.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and roles</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <Input
            placeholder="Search users…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="md:w-64"
            aria-label="Search users"
          />
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Filter role" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="seeker">Seeker</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="renovator">Renovator</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-2" onClick={() => fetchUsers()}>
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[220px]">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center p-4">Loading users...</TableCell></TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select value={user.role} onValueChange={(v) => updateUserRole(user.id, v as Role)}>
                        <SelectTrigger className="w-full h-8">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <SelectItem value="seeker">Seeker</SelectItem>
                            <SelectItem value="landlord">Landlord</SelectItem>
                            <SelectItem value="renovator">Renovator</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(user.id)}>Edit</Button>
                        <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v as Role }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seeker">Seeker</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="gap-2">
              <Save size={16} />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
