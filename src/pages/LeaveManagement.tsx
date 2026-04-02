import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, HelpCircle, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface LeaveRequest {
  id: string; staffName: string; department: string; leaveType: string;
  startDate: string; endDate: string; status: string; reason: string;
}

const initialLeaves: LeaveRequest[] = [
  { id: "1", staffName: "Aisha Mohammed", department: "Laboratory", leaveType: "Annual Leave", startDate: "2026-03-20", endDate: "2026-03-27", status: "Pending", reason: "Family vacation" },
  { id: "2", staffName: "Grace Eze", department: "IT", leaveType: "Sick Leave", startDate: "2026-03-10", endDate: "2026-03-12", status: "Approved", reason: "Medical appointment" },
  { id: "3", staffName: "Ngozi Nwankwo", department: "Sales", leaveType: "Annual Leave", startDate: "2026-04-01", endDate: "2026-04-05", status: "Pending", reason: "Personal matters" },
  { id: "4", staffName: "Chinedu Okoro", department: "Laboratory", leaveType: "Maternity Leave", startDate: "2026-05-01", endDate: "2026-08-01", status: "Approved", reason: "Maternity" },
  { id: "5", staffName: "Ibrahim Suleiman", department: "Finance", leaveType: "Sick Leave", startDate: "2026-03-08", endDate: "2026-03-09", status: "Rejected", reason: "Insufficient documentation" },
];

const statusVariant = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "Approved") return "default";
  if (s === "Rejected") return "destructive";
  return "secondary";
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = leaves.filter((l) => {
    const matchSearch = l.staffName.toLowerCase().includes(search.toLowerCase()) || l.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchType = typeFilter === "all" || l.leaveType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleAction = (action: "Approved" | "Rejected") => {
    if (!selected) return;
    setLeaves((prev) => prev.map((l) => l.id === selected.id ? { ...l, status: action } : l));
    toast.success(`Leave request ${action.toLowerCase()}`);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <p className="text-sm text-muted-foreground">Review and manage employee leave requests</p>
      </div>

      <Card>
        <div className="p-4 pb-3 flex flex-wrap items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or department..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Annual Leave">Annual Leave</SelectItem>
              <SelectItem value="Sick Leave">Sick Leave</SelectItem>
              <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.staffName}</TableCell>
                  <TableCell>{l.department}</TableCell>
                  <TableCell>{l.leaveType}</TableCell>
                  <TableCell>{l.startDate}</TableCell>
                  <TableCell>{l.endDate}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{l.reason}</TableCell>
                  <TableCell><Badge variant={statusVariant(l.status)}>{l.status}</Badge></TableCell>
                  <TableCell>
                    {l.status === "Pending" && (
                      <Button variant="outline" size="sm" onClick={() => setSelected(l)}>Review</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No leave requests found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Review</DialogTitle>
            <DialogDescription>Review and approve or reject this leave request</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Employee</p><p className="font-medium">{selected.staffName}</p></div>
                <div><p className="text-muted-foreground text-xs">Department</p><p>{selected.department}</p></div>
                <div><p className="text-muted-foreground text-xs">Leave Type</p><p>{selected.leaveType}</p></div>
                <div><p className="text-muted-foreground text-xs">Duration</p><p>{selected.startDate} to {selected.endDate}</p></div>
              </div>
              <div><p className="text-muted-foreground text-xs">Reason</p><p className="text-sm">{selected.reason}</p></div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}><HelpCircle className="h-4 w-4 mr-1" />Request Clarification</Button>
            <Button variant="destructive" onClick={() => handleAction("Rejected")}><XCircle className="h-4 w-4 mr-1" />Reject</Button>
            <Button onClick={() => handleAction("Approved")}><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;
