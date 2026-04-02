import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { interviews, candidates } from "@/data/mockData";

const statusColor = (s: string): "default" | "secondary" | "outline" => {
  if (s === "Scheduled") return "default";
  if (s === "Completed") return "secondary";
  return "outline";
};

const Interviews = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const filtered = interviews.filter((i) => i.candidateName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Interview Management</h1>
          <p className="text-sm text-muted-foreground">Schedule and track candidate interviews</p>
        </div>
        <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-1" />Schedule Interview</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search interviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Interview Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.candidateName}</TableCell>
                  <TableCell>{i.position}</TableCell>
                  <TableCell>{i.type}</TableCell>
                  <TableCell>{i.date}</TableCell>
                  <TableCell>{i.time}</TableCell>
                  <TableCell className="text-xs">{i.interviewers}</TableCell>
                  <TableCell className="text-xs">{i.location}</TableCell>
                  <TableCell><Badge variant={statusColor(i.status)}>{i.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Interview</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>{candidates.filter((c) => c.status === "Active").map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.position}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interview Type</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR Interview</SelectItem>
                  <SelectItem value="dept">Department Interview</SelectItem>
                  <SelectItem value="final">Final Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
              <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
            </div>
            <div className="space-y-2"><Label>Location / Meeting Link</Label><Input placeholder="Office or virtual link" /></div>
            <div className="space-y-2">
              <Label>Interviewers</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select interviewer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">HR Team</SelectItem>
                  <SelectItem value="head">Department Head</SelectItem>
                  <SelectItem value="ceo">CEO</SelectItem>
                  <SelectItem value="richard">Mr Richard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={() => setShowModal(false)}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Interviews;
