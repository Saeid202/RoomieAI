import { useMemo, useState } from "react";
import { Plus, Save } from "lucide-react";
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
  const [users, setUsers] = useState(dummyUsers);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: Role; status: Status }>({
    name: "",
    email: "",
    role: "seeker",
    status: "active",
  });

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const openEdit = (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    setEditingId(id);
    setForm({ name: user.name, email: user.email, role: user.role as Role, status: user.status as Status });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Missing fields", description: "Please enter name and email." });
      return;
    }
    setUsers(prev => prev.map(u => (u.id === editingId ? { ...u, ...form } : u)));
    setIsDialogOpen(false);
    toast({ title: "User updated", description: `${form.name} has been saved.` });
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
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all") }>
            <SelectTrigger className="w-36"><SelectValue placeholder="Filter role" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Role</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="seeker">Seeker</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Add New User
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select value={user.role} onValueChange={(v) => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: v as Role } : u))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <SelectItem value="seeker">Seeker</SelectItem>
                            <SelectItem value="landlord">Landlord</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === 'active' 
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
