import React, { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, Users2, Users, ShieldCheck } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

const Dashboard = () => {
  const { currentSession } = useContext(SessionContext);
  const sid = currentSession?._id;

  // Each role is fetched from GET /api/users/:role/:sessionId
  const { data: rawStudents } = useFetch(sid ? `/users/student/${sid}` : null);
  const { data: rawTeachers } = useFetch(sid ? `/users/teacher/${sid}` : null);
  const { data: rawParents }  = useFetch(sid ? `/users/parent/${sid}` : null);
  const { data: rawAdmins }   = useFetch(sid ? `/users/admin/${sid}` : null);

  // Notices from the real noticeboard API
  const { data: rawNotices } = useFetch(sid ? `/get-all-notices/${sid}` : null);
  const notices = useMemo(() => Array.isArray(rawNotices) ? rawNotices : [], [rawNotices]);

  const count = (d: unknown) =>
    Array.isArray(d) ? d.length : typeof d === "number" ? d : 0;

  const statCardsData = [
    { title: "Total Students", value: count(rawStudents), icon: User },
    { title: "Total Teachers", value: count(rawTeachers), icon: Users2 },
    { title: "Total Parents",  value: count(rawParents),  icon: Users },
    { title: "Number of Admins", value: count(rawAdmins), icon: ShieldCheck },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {statCardsData.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Event Calendar</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Calendar />
          </CardContent>
        </Card>

        {/* <Card className="lg:col-span-1">
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
        </Card> */}

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#004aaa]">Notice Board</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notices.length > 0 ? (
                notices.slice(0, 6).map((notice: any) => (
                  <div key={notice._id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-[#004aaa]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-bold text-[#004aaa] truncate line-clamp-1">{notice.notice || notice.title || "—"}</p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {notice.date ? new Date(notice.date).toLocaleDateString() : notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <p className="text-[10px] font-medium text-blue-600 mt-1">
                        By: {notice.posted_by || notice.postedBy || "Admin"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-6">No notices available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
