import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { employees } from "@/data/mockData";
import { toast } from "sonner";

interface Guarantor {
  id: string; staffName: string; guarantorName: string; phone: string; address: string; relationship: string;
}

const initialGuarantors: Guarantor[] = [
  { id: "1", staffName: "Aisha Mohammed", guarantorName: "Mr. Ahmed Mohammed", phone: "08011112222", address: "12 Broad Street, Lagos", relationship: "Father" },
  { id: "2", staffName: "Chinedu Okoro", guarantorName: "Mrs. Nkechi Okoro", phone: "08022223333", address: "5 Park Lane, Enugu", relationship: "Mother" },
  { id: "3", staffName: "Grace Eze", guarantorName: "Dr. Peter Eze", phone: "08033334444", address: "8 Ring Road, Benin", relationship: "Brother" },
  { id: "4", staffName: "Ibrahim Suleiman", guarantorName: "Alhaji Suleiman Baba", phone: "08044445555", address: "15 Sultan Road, Kaduna", relationship: "Father" },
];

const Guarantors = () => {
  const [guarantors, setGuarantors] = useState<Guarantor[]>(initialGuarantors);
  const [showModal, setShowModal] = useState(false);
  const [editG, setEditG] = useState<Guarantor | null>(null);
  const [viewG, setViewG] = useState<Guarantor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ staffName: "", guarantorName: "", phone: "", address: "", relationship: "" });

  const resetForm = () => setForm({ staffName: "", guarantorName: "", phone: "", address: "", relationship: "" });

  const openEdit = (g: Guarantor) => {
    setEditG(g);
    setForm({ staffName: g.staffName, guarantorName: g.guarantorName, phone: g.phone, address: g.address, relationship: g.relationship });
  };

  const handleSave = () => {
    if (editG) {
      setGuarantors((prev) => prev.map((g) => g.id === editG.id ? { ...g, ...form } : g));
      toast.success("Guarantor updated");
      setEditG(null);
    } else {
      setGuarantors((prev) => [...prev, { id: `G${Date.now()}`, ...form }]);
      toast.success("Guarantor added");
      setShowModal(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    setGuarantors((prev) => prev.filter((g) => g.id !== deleteId));
    toast.success("Guarantor deleted");
    setDeleteId(null);
  };

  const isFormOpen = showModal || !!editG;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Guarantor Management</h1>
          <p className="text-sm text-muted-foreground">Manage staff guarantor records</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="h-4 w-4 mr-1" />Add Guarantor</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Guarantor Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guarantors.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.staffName}</TableCell>
                  <TableCell>{g.guarantorName}</TableCell>
                  <TableCell>{g.phone}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{g.address}</TableCell>
                  <TableCell>{g.relationship}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewG(g)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(g)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(g.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View */}
      <Dialog open={!!viewG} onOpenChange={() => setViewG(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Guarantor Details</DialogTitle><DialogDescription>View guarantor information</DialogDescription></DialogHeader>
          {viewG && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-muted-foreground text-xs">Staff Name</p><p className="font-medium">{viewG.staffName}</p></div>
                <div><p className="text-muted-foreground text-xs">Guarantor Name</p><p className="font-medium">{viewG.guarantorName}</p></div>
                <div><p className="text-muted-foreground text-xs">Phone</p><p>{viewG.phone}</p></div>
                <div><p className="text-muted-foreground text-xs">Relationship</p><p>{viewG.relationship}</p></div>
              </div>
              <div><p className="text-muted-foreground text-xs">Address</p><p>{viewG.address}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit */}
      <Dialog open={isFormOpen} onOpenChange={() => { setShowModal(false); setEditG(null); resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editG ? "Edit Guarantor" : "Add Guarantor"}</DialogTitle><DialogDescription>{editG ? "Update guarantor details" : "Add a new guarantor"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Staff Name</Label>
              <Select value={form.staffName} onValueChange={(v) => setForm({ ...form, staffName: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Guarantor Name</Label><Input placeholder="Full name" value={form.guarantorName} onChange={(e) => setForm({ ...form, guarantorName: e.target.value })} /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="080XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Address</Label><Input placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Relationship</Label>
              <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Sibling">Sibling</SelectItem>
                  <SelectItem value="Spouse">Spouse</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); setEditG(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editG ? "Update" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Guarantor</DialogTitle><DialogDescription>This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Guarantors;
