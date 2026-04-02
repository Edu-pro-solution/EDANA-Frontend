import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Search, Eye, CalendarCheck, XCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface Candidate {
  id: string; name: string; email: string; phone: string;
  position: string; applicationDate: string; stage: string; status: string;
}

const initialCandidates: Candidate[] = [
  { id: "1", name: "Amara Obi", email: "amara@gmail.com", phone: "08111222333", position: "Lab Scientist", applicationDate: "2026-02-18", stage: "Final Interview", status: "Active" },
  { id: "2", name: "Kunle Adesanya", email: "kunle@gmail.com", phone: "08222333444", position: "Lab Scientist", applicationDate: "2026-02-19", stage: "Screening", status: "Active" },
  { id: "3", name: "Zainab Musa", email: "zainab@gmail.com", phone: "08333444555", position: "Phlebotomist", applicationDate: "2026-02-22", stage: "First Interview", status: "Active" },
  { id: "4", name: "Emmanuel Udo", email: "emmanuel@gmail.com", phone: "08444555666", position: "IT Support", applicationDate: "2026-03-02", stage: "Screening", status: "Active" },
  { id: "5", name: "Chioma Nwosu", email: "chioma@gmail.com", phone: "08555666777", position: "Front Desk Officer", applicationDate: "2026-01-12", stage: "Offer Sent", status: "Hired" },
  { id: "6", name: "Abdulrahman Garba", email: "abdul@gmail.com", phone: "08666777888", position: "Dispatch Rider", applicationDate: "2026-03-06", stage: "Screening", status: "Active" },
];

const stageBadge = (stage: string) => {
  const colors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Screening: "secondary", "First Interview": "outline", "Final Interview": "default", "Offer Sent": "default",
  };
  return <Badge variant={colors[stage] || "secondary"}>{stage}</Badge>;
};

const Candidates = () => {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const filtered = candidates.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.position.toLowerCase().includes(search.toLowerCase()));

  const handleSchedule = (c: Candidate) => {
    toast.success(`Interview scheduled for ${c.name}`);
  };

  const handleShortlist = (c: Candidate) => {
    const nextStage: Record<string, string> = { Screening: "First Interview", "First Interview": "Final Interview", "Final Interview": "Offer Sent" };
    const next = nextStage[c.stage];
    if (next) {
      setCandidates((prev) => prev.map((x) => x.id === c.id ? { ...x, stage: next } : x));
      toast.success(`${c.name} moved to ${next}`);
    } else {
      toast.info(`${c.name} is already at the final stage`);
    }
  };

  const handleReject = () => {
    setCandidates((prev) => prev.map((c) => c.id === rejectId ? { ...c, status: "Rejected", stage: "Rejected" } : c));
    toast.success("Candidate rejected");
    setRejectId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Candidates</h1>
        <p className="text-sm text-muted-foreground">Track and manage all job applicants</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Position Applied</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.position}</TableCell>
                  <TableCell>{c.applicationDate}</TableCell>
                  <TableCell>{stageBadge(c.stage)}</TableCell>
                  <TableCell><Badge variant={c.status === "Hired" ? "default" : c.status === "Rejected" ? "destructive" : "secondary"}>{c.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewCandidate(c)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSchedule(c)} title="Schedule Interview" disabled={c.status !== "Active"}><CalendarCheck className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShortlist(c)} title="Shortlist / Advance" disabled={c.status !== "Active"}><Star className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRejectId(c.id)} title="Reject" disabled={c.status !== "Active"}><XCircle className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No candidates found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View */}
      <Dialog open={!!viewCandidate} onOpenChange={() => setViewCandidate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Candidate Profile</DialogTitle><DialogDescription>View candidate details</DialogDescription></DialogHeader>
          {viewCandidate && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{viewCandidate.name}</p></div>
                <div><p className="text-muted-foreground text-xs">Email</p><p>{viewCandidate.email}</p></div>
                <div><p className="text-muted-foreground text-xs">Phone</p><p>{viewCandidate.phone}</p></div>
                <div><p className="text-muted-foreground text-xs">Position</p><p>{viewCandidate.position}</p></div>
                <div><p className="text-muted-foreground text-xs">Application Date</p><p>{viewCandidate.applicationDate}</p></div>
                <div><p className="text-muted-foreground text-xs">Stage</p>{stageBadge(viewCandidate.stage)}</div>
                <div><p className="text-muted-foreground text-xs">Status</p><Badge variant={viewCandidate.status === "Hired" ? "default" : "secondary"}>{viewCandidate.status}</Badge></div>
              </div>
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm">Download CV</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject confirmation */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Candidate</DialogTitle><DialogDescription>Are you sure you want to reject this candidate?</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Candidates;
