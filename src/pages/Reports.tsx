import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { FileText, Download, Users, Wallet, CalendarDays, Briefcase, Send, PenLine } from "lucide-react";
import { toast } from "sonner";

const reportTypes = [
  { title: "Employee Report", description: "Complete staff directory and details", icon: Users },
  { title: "Payroll Report", description: "Salary payments and deductions summary", icon: Wallet },
  { title: "Leave Report", description: "Leave utilization and balances", icon: CalendarDays },
  { title: "Recruitment Report", description: "Hiring pipeline and status overview", icon: Briefcase },
];

const Reports = () => {
  const [showWriteReport, setShowWriteReport] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", type: "", recipient: "", body: "" });

  const handleSendReport = () => {
    if (!reportForm.title || !reportForm.body || !reportForm.recipient) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Report "${reportForm.title}" sent to ${reportForm.recipient}`);
    setReportForm({ title: "", type: "", recipient: "", body: "" });
    setShowWriteReport(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">HR Reports</h1>
          <p className="text-sm text-muted-foreground">Generate, write, and send HR reports</p>
        </div>
        <Button onClick={() => setShowWriteReport(true)}><PenLine className="h-4 w-4 mr-1" />Write Report</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select><SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="lab">Laboratory</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="reception">Reception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" /></div>
            <div className="space-y-2"><Label>End Date</Label><Input type="date" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${report.title} PDF generated`)}><FileText className="h-3.5 w-3.5 mr-1" />PDF</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${report.title} Excel exported`)}><Download className="h-3.5 w-3.5 mr-1" />Excel</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Write Report Dialog */}
      <Dialog open={showWriteReport} onOpenChange={setShowWriteReport}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Write Report</DialogTitle><DialogDescription>Compose and send a report to a manager</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Report Title</Label><Input placeholder="e.g. Monthly HR Summary" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportForm.type} onValueChange={(v) => setReportForm({ ...reportForm, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee Report</SelectItem>
                  <SelectItem value="payroll">Payroll Report</SelectItem>
                  <SelectItem value="leave">Leave Report</SelectItem>
                  <SelectItem value="recruitment">Recruitment Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={reportForm.recipient} onValueChange={(v) => setReportForm({ ...reportForm, recipient: v })}>
                <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="Dr. Funke Akindele">Dr. Funke Akindele (Lab Head)</SelectItem>
                  <SelectItem value="Mr. Chukwudi Obi">Mr. Chukwudi Obi (Finance)</SelectItem>
                  <SelectItem value="Mrs. Binta Hassan">Mrs. Binta Hassan (Sales)</SelectItem>
                  <SelectItem value="Mr. Tunde Bakare">Mr. Tunde Bakare (IT Head)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Report Content</Label><Textarea placeholder="Write your report here..." rows={8} value={reportForm.body} onChange={(e) => setReportForm({ ...reportForm, body: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWriteReport(false)}>Cancel</Button>
            <Button onClick={handleSendReport}><Send className="h-4 w-4 mr-1" />Send Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
