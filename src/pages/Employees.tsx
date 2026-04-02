import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Pencil, UserX, KeyRound, Filter } from "lucide-react";
import { employees as empData, departments } from "@/data/mockData";
import { toast } from "sonner";

interface Employee {
  id: string; name: string; email: string; department: string;
  location: string; role: string; status: string; createdAt: string;
  salary: number; phone: string;
}

const Employees = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employeeList, setEmployeeList] = useState<Employee[]>(empData);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [resetPwdId, setResetPwdId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", department: "", role: "", location: "", salary: "" });

  const filtered = employeeList.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const openEdit = (emp: Employee) => {
    setEditEmployee(emp);
    setEditForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, role: emp.role, location: emp.location, salary: String(emp.salary) });
  };

  const handleSaveEdit = () => {
    if (!editEmployee) return;
    setEmployeeList((prev) => prev.map((e) => e.id === editEmployee.id ? { ...e, ...editForm, salary: Number(editForm.salary) } : e));
    toast.success("Employee updated");
    setEditEmployee(null);
    if (selectedEmployee?.id === editEmployee.id) {
      setSelectedEmployee({ ...editEmployee, ...editForm, salary: Number(editForm.salary) });
    }
  };

  const handleDeactivate = () => {
    setEmployeeList((prev) => prev.map((e) => e.id === deactivateId ? { ...e, status: e.status === "Active" ? "Suspended" : "Active" } : e));
    toast.success("Employee status updated");
    setDeactivateId(null);
  };

  const handleResetPwd = () => {
    toast.success("Password reset link sent");
    setResetPwdId(null);
  };

  if (selectedEmployee) {
    const emp = employeeList.find((e) => e.id === selectedEmployee.id) || selectedEmployee;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedEmployee(null)}>← Back</Button>
          <h1 className="text-2xl font-bold">{emp.name}</h1>
          <Badge variant={emp.status === "Active" ? "default" : "destructive"}>{emp.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEdit(emp)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
          <Button size="sm" variant="outline" onClick={() => setDeactivateId(emp.id)}><UserX className="h-3.5 w-3.5 mr-1" />{emp.status === "Active" ? "Deactivate" : "Activate"}</Button>
          <Button size="sm" variant="outline" onClick={() => setResetPwdId(emp.id)}><KeyRound className="h-3.5 w-3.5 mr-1" />Reset Password</Button>
        </div>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employment">Employment Info</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card><CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><p className="text-xs text-muted-foreground">Employee ID</p><p className="font-medium">{emp.id}</p></div>
              <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{emp.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{emp.email}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{emp.phone}</p></div>
              <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium">{emp.department}</p></div>
              <div><p className="text-xs text-muted-foreground">Role</p><p className="font-medium">{emp.role}</p></div>
              <div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{emp.location}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge variant={emp.status === "Active" ? "default" : "destructive"}>{emp.status}</Badge></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="employment">
            <Card><CardContent className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Position</p><p className="font-medium">{emp.role}</p></div>
              <div><p className="text-xs text-muted-foreground">Start Date</p><p className="font-medium">{emp.createdAt}</p></div>
              <div><p className="text-xs text-muted-foreground">Salary</p><p className="font-medium">₦{emp.salary.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Contract Type</p><p className="font-medium">Full-time</p></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="documents">
            <Card><CardContent className="p-6">
              <p className="text-muted-foreground mb-4">Upload employee documents</p>
              <div className="grid grid-cols-2 gap-3">
                {["Contract Agreement", "ID Document", "Compliance Forms", "HR Forms"].map((doc) => (
                  <Button key={doc} variant="outline" className="h-20 flex flex-col gap-1">
                    <span className="text-xs">{doc}</span>
                    <span className="text-[10px] text-muted-foreground">Click to upload</span>
                  </Button>
                ))}
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        {/* Edit dialog also available from profile */}
        <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Employee</DialogTitle><DialogDescription>Update employee information</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Role</Label><Input value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} /></div>
                <div className="space-y-2"><Label>Location</Label><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></div>
                <div className="space-y-2"><Label>Salary</Label><Input type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={editForm.department} onValueChange={(v) => setEditForm({ ...editForm, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditEmployee(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Confirm Status Change</DialogTitle><DialogDescription>Are you sure you want to change this employee's status?</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeactivateId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeactivate}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!resetPwdId} onOpenChange={() => setResetPwdId(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Send a password reset link to this employee's email?</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPwdId(null)}>Cancel</Button>
              <Button onClick={handleResetPwd}>Send Reset Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <p className="text-sm text-muted-foreground">View and manage all staff records</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-40 h-9"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Staff Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.location}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell><Badge variant={emp.status === "Active" ? "default" : "destructive"}>{emp.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEmployee(emp)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(emp)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeactivateId(emp.id)} title={emp.status === "Active" ? "Deactivate" : "Activate"}><UserX className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setResetPwdId(emp.id)} title="Reset Password"><KeyRound className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No employees found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit dialog from list */}
      <Dialog open={!!editEmployee} onOpenChange={() => setEditEmployee(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Employee</DialogTitle><DialogDescription>Update employee information</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role</Label><Input value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} /></div>
              <div className="space-y-2"><Label>Location</Label><Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} /></div>
              <div className="space-y-2"><Label>Salary</Label><Input type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={editForm.department} onValueChange={(v) => setEditForm({ ...editForm, department: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmployee(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deactivateId} onOpenChange={() => setDeactivateId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Status Change</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetPwdId} onOpenChange={() => setResetPwdId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle><DialogDescription>Send password reset link?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPwdId(null)}>Cancel</Button>
            <Button onClick={handleResetPwd}>Send Reset Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
