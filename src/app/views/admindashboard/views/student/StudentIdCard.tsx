import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function StudentIdCard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentSession } = useContext(SessionContext);

  const { data: rawStudent, loading } = useFetch(
    id && currentSession?._id ? `/get-students/${id}/${currentSession._id}` : null
  );
  const { data: schoolSettings } = useFetch("/account-setting");
  const { data: profileSettings } = useFetch("/setting");

  const student = useMemo(() => {
    if (!rawStudent) return null;
    return Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
  }, [rawStudent]);

  const school = useMemo(() => {
    const data = Array.isArray(schoolSettings) ? schoolSettings[0] : schoolSettings;
    const profile = Array.isArray(profileSettings) ? profileSettings[0] : profileSettings;
    const logoRaw = data?.schoolLogo || data?.logo || data?.logoUrl || "";
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const schoolLogo = logoRaw && !String(logoRaw).startsWith("http") ? `${apiUrl}/${String(logoRaw).replace(/^\//, "")}` : logoRaw;
    return {
      name: data?.name || "School Name",
      address: data?.address || "",
      logo: schoolLogo,
      principalName: profile?.principalName || "",
    };
  }, [schoolSettings, profileSettings]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-black hover:text-primary">
          <ArrowLeft size={16} /> Back
        </Button>
        <Button onClick={() => window.print()} className="gap-2 bg-primary hover:bg-primary/90">
          <Printer size={16} /> Print ID Card
        </Button>
      </div>

      <div className="printable-area flex justify-center">
        <Card className="w-full max-w-md overflow-hidden border border-black shadow-sm">
          <CardContent className="space-y-5 p-0">
            <div className="bg-primary px-6 py-5 text-center text-white">
              {school.logo ? (
                <img src={school.logo} alt="School Logo" className="mx-auto mb-3 h-16 w-16 object-contain rounded-full bg-white p-1" />
              ) : null}
              <h2 className="text-xl font-black uppercase">{school.name}</h2>
              {school.address ? <p className="mt-1 text-xs text-white/90">{school.address}</p> : null}
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.22em]">Student Identity Card</p>
            </div>

            <div className="space-y-4 px-6 pb-6">
              {loading ? (
                <p className="text-sm text-black">Loading student...</p>
              ) : !student ? (
                <p className="text-sm text-black">Student record not found.</p>
              ) : (
                <>
                  <div className="rounded-2xl border border-black bg-white p-4 text-center">
                    <p className="text-xl font-black text-primary">{student.studentName || student.username || "Student"}</p>
                    <p className="mt-1 text-sm font-semibold text-black">{student.classname || "-"}</p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-black bg-white p-4">
                    <div className="border-b border-black pb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Admission Number</p>
                      <p className="font-bold text-primary">{student.AdmNo || "-"}</p>
                    </div>
                    <div className="border-b border-black pb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Email Address</p>
                      <p className="font-medium text-black">{student.email || "-"}</p>
                    </div>
                    <div className="border-b border-black pb-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Parent / Guardian</p>
                      <p className="font-medium text-black">{student.parentsName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Phone</p>
                      <p className="font-medium text-black">{student.phone || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between border-t border-black pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Session</p>
                      <p className="font-semibold text-primary">{currentSession?.name || "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black">Authorized By</p>
                      <p className="font-semibold text-black">{school.principalName || "School Admin"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
