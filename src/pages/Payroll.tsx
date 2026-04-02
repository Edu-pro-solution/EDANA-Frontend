import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Clock, CheckCircle2, Calendar, FileText, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

interface PayrollItem {
  id: string; staffName: string; department: string; salary: number;
  allowances: number; deductions: number; netSalary: number; status: string;
}

const initialPayroll: PayrollItem[] = [
  { id: "1", staffName: "Aisha Mohammed", department: "Laboratory", salary: 350000, allowances: 50000, deductions: 35000, netSalary: 365000, status: "Paid" },
  { id: "2", staffName: "Chinedu Okoro", department: "Laboratory", salary: 250000, allowances: 30000, deductions: 25000, netSalary: 255000, status: "Paid" },
  { id: "3", staffName: "Blessing Okafor", department: "Reception", salary: 180000, allowances: 20000, deductions: 18000, netSalary: 182000, status: "Pending" },
  { id: "4", staffName: "Ibrahim Suleiman", department: "Finance", salary: 400000, allowances: 60000, deductions: 40000, netSalary: 420000, status: "Paid" },
  { id: "5", staffName: "Grace Eze", department: "IT", salary: 450000, allowances: 70000, deductions: 45000, netSalary: 475000, status: "Pending" },
  { id: "6", staffName: "Yusuf Abdullahi", department: "Laboratory", salary: 200000, allowances: 25000, deductions: 20000, netSalary: 205000, status: "Paid" },
];

const summaryCards = [
  { title: "Total Salary Expense", value: "₦14,200,000", icon: Wallet },
  { title: "Pending Payroll", value: "₦657,000", icon: Clock },
  { title: "Paid Payroll", value: "₦13,543,000", icon: CheckCircle2 },
  { title: "Payroll Month", value: "March 2026", icon: Calendar },
];

const Payroll = () => {
  const [payroll, setPayroll] = useState<PayrollItem[]>(initialPayroll);
  const [viewItem, setViewItem] = useState<PayrollItem | null>(null);
  const [editItem, setEditItem] = useState<PayrollItem | null>(null);
  const [editForm, setEditForm] = useState({ salary: "", allowances: "", deductions: "" });

  const openEdit = (p: PayrollItem) => {
    setEditItem(p);
    setEditForm({ salary: String(p.salary), allowances: String(p.allowances), deductions: String(p.deductions) });
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    const salary = Number(editForm.salary);
    const allowances = Number(editForm.allowances);
    const deductions = Number(editForm.deductions);
    const netSalary = salary + allowances - deductions;
    setPayroll((prev) => prev.map((p) => p.id === editItem.id ? { ...p, salary, allowances, deductions, netSalary } : p));
    toast.success("Payroll updated");
    setEditItem(null);
  };

  const handleMarkPaid = (id: string) => {
    setPayroll((prev) => prev.map((p) => p.id === id ? { ...p, status: "Paid" } : p));
    toast.success("Marked as paid");
  };

  const handleGeneratePayslip = (p: PayrollItem) => {
    toast.success(`Payslip generated for ${p.staffName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payroll Management</h1>
        <p className="text-sm text-muted-foreground">Process and manage employee payroll</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              <card.icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary (₦)</TableHead>
                <TableHead>Allowances (₦)</TableHead>
                <TableHead>Deductions (₦)</TableHead>
                <TableHead>Net Salary (₦)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payroll.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.staffName}</TableCell>
                  <TableCell>{p.department}</TableCell>
                  <TableCell>{p.salary.toLocaleString()}</TableCell>
                  <TableCell>{p.allowances.toLocaleString()}</TableCell>
                  <TableCell>{p.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{p.netSalary.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={p.status === "Paid" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleGeneratePayslip(p)} title="Generate Payslip"><FileText className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)} title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkPaid(p.id)} title="Mark as Paid" disabled={p.status === "Paid"}><Check className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Payroll</DialogTitle><DialogDescription>Update payroll for {editItem?.staffName}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Salary (₦)</Label><Input type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} /></div>
            <div className="space-y-2"><Label>Allowances (₦)</Label><Input type="number" value={editForm.allowances} onChange={(e) => setEditForm({ ...editForm, allowances: e.target.value })} /></div>
            <div className="space-y-2"><Label>Deductions (₦)</Label><Input type="number" value={editForm.deductions} onChange={(e) => setEditForm({ ...editForm, deductions: e.target.value })} /></div>
            <div className="text-sm text-muted-foreground">Net Salary: ₦{(Number(editForm.salary) + Number(editForm.allowances) - Number(editForm.deductions)).toLocaleString()}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;
