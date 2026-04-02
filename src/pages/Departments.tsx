import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Search, ArrowLeft, UserMinus } from "lucide-react";
import { departments as deptData, employees as empData } from "@/data/mockData";
import { toast } from "sonner";

interface Dept { id: string; name: string; head: string; staffCount: number; createdAt: string; description?: string; }

const Departments = () => {
  const [search, setSearch] = useState("");
  const [depts, setDepts] = useState<Dept[]>(deptData.map((d) => ({ ...d, description: "" })));
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState<Dept | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewDept, setViewDept] = useState<Dept | null>(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [removeStaff, setRemoveStaff] = useState<{ empId: string; deptName: string } | null>(null);
  const [form, setForm] = useState({ name: "", head: "", description: "" });

  const filtered = depts.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.head.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => setForm({ name: "", head: "", description: "" });

  const openEdit = (d: Dept) => {
    setEditDept(d);
    setForm({ name: d.name, head: d.head, description: d.description || "" });
  };

  const handleSave = () => {
    if (editDept) {
      setDepts((prev) => prev.map((d) => d.id === editDept.id ? { ...d, ...form } : d));
      toast.success("Department updated");
      setEditDept(null);
    } else {
      setDepts((prev) => [...prev, { id: `D${Date.now()}`, ...form, staffCount: 0, createdAt: new Date().toISOString().slice(0, 10) }]);
      toast.success("Department created");
      setShowModal(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    setDepts((prev) => prev.filter((d) => d.id !== deleteId));
    toast.success("Department deleted");
    setDeleteId(null);
  };

  const deptStaff = viewDept ? empData.filter((e) => e.department === viewDept.name && e.name.toLowerCase().includes(staffSearch.toLowerCase())) : [];

  const handleRemoveStaff = () => {
    toast.success("Staff member removed from department");
    setRemoveStaff(null);
  };

  if (viewDept) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => { setViewDept(null); setStaffSearch(""); }}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold">{viewDept.name} Department</h1>
            <p className="text-sm text-muted-foreground">Head: {viewDept.head}</p>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search staff..." value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} className="max-w-sm h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptStaff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.id}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell><Badge variant={s.status === "Active" ? "default" : "destructive"}>{s.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRemoveStaff({ empId: s.id, deptName: viewDept.name })} title="Remove from department">
                        <UserMinus className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {deptStaff.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No staff in this department</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!removeStaff} onOpenChange={() => setRemoveStaff(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Remove Staff</DialogTitle><DialogDescription>Remove this staff member from {removeStaff?.deptName}?</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveStaff(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRemoveStaff}>Remove</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const isFormOpen = showModal || !!editDept;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-sm text-muted-foreground">Manage organizational departments</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="h-4 w-4 mr-1" />Add Department</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department Name</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Number of Staff</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.head}</TableCell>
                  <TableCell>{d.staffCount}</TableCell>
                  <TableCell>{d.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(d)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewDept(d)} title="View Staff"><Users className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(d.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No departments found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={() => { setShowModal(false); setEditDept(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editDept ? "Edit Department" : "Add Department"}</DialogTitle><DialogDescription>{editDept ? "Update department details" : "Create a new department"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Department Name</Label><Input placeholder="e.g. Laboratory" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Department Head</Label><Input placeholder="e.g. Dr. Name" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Brief description..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); setEditDept(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editDept ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Department</DialogTitle><DialogDescription>This will permanently delete this department.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Departments;
