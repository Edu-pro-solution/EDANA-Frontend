import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { departments as deptData } from "@/data/mockData";
import { toast } from "sonner";

interface Job {
  id: string; title: string; department: string; location: string;
  applications: number; datePosted: string; status: string; type: string;
  description?: string; requirements?: string; deadline?: string;
}

const initialJobs: Job[] = [
  { id: "1", title: "Lab Scientist", department: "Laboratory", location: "Lagos Main", applications: 24, datePosted: "2026-02-15", status: "Open", type: "Full-time" },
  { id: "2", title: "Phlebotomist", department: "Laboratory", location: "Abuja Branch", applications: 18, datePosted: "2026-02-20", status: "Open", type: "Full-time" },
  { id: "3", title: "Front Desk Officer", department: "Reception", location: "Lagos Main", applications: 32, datePosted: "2026-01-10", status: "Closed", type: "Full-time" },
  { id: "4", title: "IT Support", department: "IT", location: "Lagos Main", applications: 15, datePosted: "2026-03-01", status: "Open", type: "Contract" },
  { id: "5", title: "Dispatch Rider", department: "Logistics", location: "Lagos Main", applications: 40, datePosted: "2026-03-05", status: "Open", type: "Full-time" },
];

const Recruitment = () => {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", department: "", location: "", type: "", description: "", requirements: "", deadline: "" });

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => setForm({ title: "", department: "", location: "", type: "", description: "", requirements: "", deadline: "" });

  const openEdit = (job: Job) => {
    setEditJob(job);
    setForm({ title: job.title, department: job.department, location: job.location, type: job.type, description: job.description || "", requirements: job.requirements || "", deadline: job.deadline || "" });
  };

  const handleSave = () => {
    if (editJob) {
      setJobs((prev) => prev.map((j) => j.id === editJob.id ? { ...j, ...form } : j));
      toast.success("Job updated successfully");
      setEditJob(null);
    } else {
      const newJob: Job = { id: `J${Date.now()}`, ...form, applications: 0, datePosted: new Date().toISOString().slice(0, 10), status: "Open" };
      setJobs((prev) => [newJob, ...prev]);
      toast.success("Job posted successfully");
      setShowModal(false);
    }
    resetForm();
  };

  const handleDelete = () => {
    setJobs((prev) => prev.filter((j) => j.id !== deleteId));
    toast.success("Job deleted");
    setDeleteId(null);
  };

  const isFormOpen = showModal || !!editJob;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recruitment Management</h1>
          <p className="text-sm text-muted-foreground">Manage job postings and recruitment workflow</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="h-4 w-4 mr-1" />Post New Job</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-1" />Export</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.applications}</TableCell>
                  <TableCell>{job.datePosted}</TableCell>
                  <TableCell><Badge variant={job.status === "Open" ? "default" : "secondary"}>{job.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewJob(job)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(job)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(job.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Job */}
      <Dialog open={!!viewJob} onOpenChange={() => setViewJob(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Job Details</DialogTitle><DialogDescription>View job posting details</DialogDescription></DialogHeader>
          {viewJob && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Title</p><p className="font-medium">{viewJob.title}</p></div>
                <div><p className="text-muted-foreground text-xs">Department</p><p>{viewJob.department}</p></div>
                <div><p className="text-muted-foreground text-xs">Location</p><p>{viewJob.location}</p></div>
                <div><p className="text-muted-foreground text-xs">Type</p><p>{viewJob.type}</p></div>
                <div><p className="text-muted-foreground text-xs">Applications</p><p>{viewJob.applications}</p></div>
                <div><p className="text-muted-foreground text-xs">Status</p><Badge variant={viewJob.status === "Open" ? "default" : "secondary"}>{viewJob.status}</Badge></div>
              </div>
              {viewJob.description && <div><p className="text-muted-foreground text-xs">Description</p><p className="text-sm">{viewJob.description}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Job */}
      <Dialog open={isFormOpen} onOpenChange={() => { setShowModal(false); setEditJob(null); resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editJob ? "Edit Job" : "Post New Job"}</DialogTitle><DialogDescription>{editJob ? "Update job posting" : "Create a new job posting"}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Job Title</Label><Input placeholder="e.g. Lab Scientist" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{deptData.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Location</Label><Input placeholder="Lagos Main" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Describe the role..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>Requirements</Label><Textarea placeholder="List requirements..." rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} /></div>
            <div className="space-y-2"><Label>Application Deadline</Label><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); setEditJob(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editJob ? "Update" : "Publish Job"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Job</DialogTitle><DialogDescription>Are you sure you want to delete this job posting? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Recruitment;
