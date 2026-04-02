import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const modules = ["HR", "Finance", "LIMS", "Accounting", "Sales"];

interface Role {
  id: string; name: string; assignedUsers: number; permissionsCount: number;
  createdDate: string; description: string; permissions?: string[];
}

const initialRoles: Role[] = [
  { id: "1", name: "HR Admin", assignedUsers: 2, permissionsCount: 45, createdDate: "2020-01-01", description: "Full access to HR module", permissions: ["HR", "Finance", "LIMS", "Accounting", "Sales"] },
  { id: "2", name: "Department Head", assignedUsers: 7, permissionsCount: 20, createdDate: "2020-01-01", description: "Department-level access", permissions: ["HR", "LIMS"] },
  { id: "3", name: "Finance Officer", assignedUsers: 3, permissionsCount: 12, createdDate: "2020-06-15", description: "Payroll and finance access", permissions: ["Finance", "Accounting"] },
  { id: "4", name: "Lab Scientist", assignedUsers: 25, permissionsCount: 8, createdDate: "2020-01-01", description: "Laboratory operations", permissions: ["LIMS"] },
  { id: "5", name: "Receptionist", assignedUsers: 10, permissionsCount: 6, createdDate: "2021-03-01", description: "Front desk operations", permissions: [] },
];

const RolesPermissions = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [viewRole, setViewRole] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });

  const resetForm = () => setForm({ name: "", description: "", permissions: [] });

  const openEdit = (r: Role) => {
    setEditRole(r);
    setForm({ name: r.name, description: r.description, permissions: r.permissions || [] });
  };

  const togglePermission = (mod: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(mod)
        ? prev.permissions.filter((p) => p !== mod)
        : [...prev.permissions, mod],
    }));
  };

  const handleSave = () => {
    if (editRole) {
      setRoles((prev) => prev.map((r) => r.id === editRole.id ? { ...r, ...form, permissionsCount: form.permissions.length * 9 } : r));
      toast.success("Role updated");
      setEditRole(null);
    } else {
      setRoles((prev) => [...prev, { id: `R${Date.now()}`, ...form, assignedUsers: 0, permissionsCount: form.permissions.length * 9, createdDate: new Date().toISOString().slice(0, 10) }]);
      toast.success("Role created");
      setShowModal(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    setRoles((prev) => prev.filter((r) => r.id !== deleteId));
    toast.success("Role deleted");
    setDeleteId(null);
  };

  const isFormOpen = showModal || !!editRole;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">Manage user roles and access control</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="h-4 w-4 mr-1" />Add Role</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Assigned Users</TableHead>
                <TableHead>Permissions Count</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.assignedUsers}</TableCell>
                  <TableCell>{r.permissionsCount}</TableCell>
                  <TableCell>{r.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRole(r)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View */}
      <Dialog open={!!viewRole} onOpenChange={() => setViewRole(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Role Details</DialogTitle><DialogDescription>View role permissions</DialogDescription></DialogHeader>
          {viewRole && (
            <div className="space-y-3 text-sm">
              <div><p className="text-muted-foreground text-xs">Role Name</p><p className="font-medium">{viewRole.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Description</p><p>{viewRole.description}</p></div>
              <div><p className="text-muted-foreground text-xs">Assigned Users</p><p>{viewRole.assignedUsers}</p></div>
              <div><p className="text-muted-foreground text-xs">Module Permissions</p>
                <div className="flex flex-wrap gap-1.5 mt-1">{(viewRole.permissions || []).map((p) => <span key={p} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">{p}</span>)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit */}
      <Dialog open={isFormOpen} onOpenChange={() => { setShowModal(false); setEditRole(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editRole ? "Edit Role" : "Add Role"}</DialogTitle><DialogDescription>{editRole ? "Update role details" : "Create a new role"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Role Name</Label><Input placeholder="e.g. Lab Manager" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Role description..." rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Module Permissions</Label>
              <div className="space-y-2 border rounded-md p-3">
                {modules.map((mod) => (
                  <div key={mod} className="flex items-center gap-2">
                    <Checkbox id={mod} checked={form.permissions.includes(mod)} onCheckedChange={() => togglePermission(mod)} />
                    <Label htmlFor={mod} className="font-normal text-sm">{mod}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); setEditRole(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editRole ? "Update" : "Create Role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Role</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissions;
