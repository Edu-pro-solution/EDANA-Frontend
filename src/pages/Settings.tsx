import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HRSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HR Settings</h1>
        <p className="text-sm text-muted-foreground">Configure HR module settings</p>
      </div>

      <Tabs defaultValue="leave">
        <TabsList>
          <TabsTrigger value="leave">Leave Types</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <Card>
            <CardHeader><CardTitle className="text-base">Leave Type Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Annual Leave", days: "21", enabled: true },
                { name: "Sick Leave", days: "10", enabled: true },
                { name: "Maternity Leave", days: "90", enabled: true },
                { name: "Paternity Leave", days: "14", enabled: false },
                { name: "Compassionate Leave", days: "5", enabled: true },
              ].map((leave) => (
                <div key={leave.name} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium text-sm">{leave.name}</p>
                    <p className="text-xs text-muted-foreground">{leave.days} days per year</p>
                  </div>
                  <Switch defaultChecked={leave.enabled} />
                </div>
              ))}
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader><CardTitle className="text-base">Payroll Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Salary Cycle</Label>
                  <Select defaultValue="monthly"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select defaultValue="bank"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Payment Day</Label><Input type="number" defaultValue="25" min="1" max="31" /></div>
                <div className="space-y-2"><Label>Tax Rate (%)</Label><Input type="number" defaultValue="7.5" /></div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruitment">
          <Card>
            <CardHeader><CardTitle className="text-base">Recruitment Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Careers Page URL</Label><Input defaultValue="https://targetpathology.com/careers" /></div>
              <div className="space-y-2">
                <Label>Default Application Form Fields</Label>
                <div className="space-y-2 border rounded-md p-3">
                  {["Full Name", "Email", "Phone Number", "CV Upload", "Cover Letter", "Years of Experience"].map((field) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-sm">{field}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRSettings;
