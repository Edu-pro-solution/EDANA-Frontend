import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Briefcase, CalendarDays, Wallet, Building2, UserCheck, Clock, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from "recharts";
import { staffDistributionData, recruitmentPipelineData, activityFeed } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const statCards = [
  { title: "Total Employees", value: "124", icon: Users, trend: "+3 this month" },
  { title: "New This Month", value: "5", icon: UserPlus, trend: "+2 vs last month" },
  { title: "Open Positions", value: "4", icon: Briefcase, trend: "2 urgent" },
  { title: "Pending Leave", value: "3", icon: CalendarDays, trend: "Needs review" },
  { title: "Payroll Due", value: "₦14.2M", icon: Wallet, trend: "March 2026" },
  { title: "Departments", value: "7", icon: Building2, trend: "All active" },
];

const activityIcons: Record<string, any> = {
  hire: UserCheck,
  leave: CalendarDays,
  job: Briefcase,
  payroll: Wallet,
};

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of human resources operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="h-5 w-5 text-primary" />
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
              <p className="text-[10px] text-primary mt-1">{card.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Staff Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={staffDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recruitmentPipelineData.map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-muted-foreground">{item.stage}</div>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(item.count / 129) * 100}%` }}
                    >
                      <span className="text-[10px] text-primary-foreground font-medium">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityFeed.map((item) => {
                const Icon = activityIcons[item.type] || FileText;
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-snug">{item.message}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" /> {item.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
