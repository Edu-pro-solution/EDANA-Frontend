import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { onboardingPipeline, departments } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const stages = ["Offer Accepted", "Contract Signing", "Employee Record Created", "Induction Completed", "System Access Granted"];

const stageIndex = (stage: string) => stages.indexOf(stage);

const Onboarding = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Track new hire onboarding and create employee records</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Onboarding Pipeline</h2>
        {onboardingPipeline.map((person) => (
          <Card key={person.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{person.candidateName}</p>
                  <p className="text-sm text-muted-foreground">{person.position} · Start: {person.startDate}</p>
                </div>
                <Badge>{person.stage}</Badge>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                {stages.map((s, idx) => (
                  <div key={s} className="flex items-center">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${idx <= stageIndex(person.stage) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {idx <= stageIndex(person.stage) ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {s}
                    </div>
                    {idx < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground mx-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Create New Employee Record</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Staff Name</Label><Input placeholder="Full name" /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="email@targetpath.com" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input placeholder="080XXXXXXXX" /></div>
            <div className="space-y-2">
              <Label>Lab Location</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lagos">Lagos Main</SelectItem>
                  <SelectItem value="abuja">Abuja Branch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Position</Label><Input placeholder="Job title" /></div>
            <div className="space-y-2"><Label>Start Date</Label><Input type="date" /></div>
            <div className="space-y-2"><Label>Salary (₦)</Label><Input type="number" placeholder="0" /></div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full-time</SelectItem>
                  <SelectItem value="part">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Linked Doctors (optional)</Label><Input placeholder="Dr. Name" /></div>
            <div className="space-y-2"><Label>Temporary Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button>Create Employee</Button>
            <Button variant="outline">Save Draft</Button>
            <Button variant="ghost">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
