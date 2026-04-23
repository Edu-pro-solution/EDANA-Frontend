/**
 * Shared printable report card — used by all three term pages.
 * termLabel: "First Term" | "Second Term" | "Third Term"
 */
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";

interface Score {
  subjectName?: string;
  subject?: string;
  examName?: string;
  examId?: {
    name?: string;
  };
  testscore?: number;
  examscore?: number;
  marksObtained?: number;
  // legacy field names (kept for compatibility)
  firstTest?: number;
  secondTest?: number;
  examScore?: number;
  total?: number;
  grade?: string;
  comment?: string;
}

interface StudentInfo {
  studentName?: string;
  name?: string;
  classname?: string;
  AdmNo?: string;
  gender?: string;
}

interface SchoolSettings {
  name?: string;
  motto?: string;
  address?: string;
  phone?: string;
  schoolLogo?: string;
  email?: string;
}

interface ProfileSettings {
  principalName?: string;
  resumptionDate?: string;
  signature?: string;
}

interface PsyData {
  instruction: number;
  independently: number;
  punctuality: number;
  talking: number;
  eyecontact: number;
  remarks: string;
  premarks: string;
}

const psyRating = (n: number) => {
  const map: Record<number, string> = { 0: "N/A", 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
  return map[n] ?? String(n);
};

const gradeColor = (g: string) => {
  if (!g) return "";
  const upper = g.toUpperCase();
  if (upper === "A") return "text-green-600 font-bold";
  if (upper === "B") return "text-blue-600 font-bold";
  if (upper === "C") return "text-yellow-600 font-bold";
  return "text-red-500 font-bold";
};

function deriveGrade(total: number): { grade: string; comment: string } {
  if (total >= 70) return { grade: "A", comment: "Excellent" };
  if (total >= 60) return { grade: "B", comment: "Very Good" };
  if (total >= 50) return { grade: "C", comment: "Good" };
  if (total >= 45) return { grade: "D", comment: "Fairly Good" };
  if (total >= 40) return { grade: "E", comment: "Pass" };
  return { grade: "F", comment: "Fail" };
}

interface Props {
  termLabel: string;
}

export default function ReportCard({ termLabel }: Props) {
  const { id } = useParams<{ id: string }>();
  const { currentSession } = useContext(SessionContext);
  const printRef = useRef<HTMLDivElement>(null);

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [school, setSchool] = useState<SchoolSettings>({});
  const [profile, setProfile] = useState<ProfileSettings>({});
  const [psyData, setPsyData] = useState<PsyData | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("jwtToken");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!id || !currentSession?._id) return;
    setLoading(true);

    const termKeyword = termLabel.split(" ")[0].toLowerCase();
    const isCumulative = termLabel.toLowerCase() === "cumulative";

    // Fetch exams to find the ObjectId matching this term, then load everything in parallel
    axios.get(`${apiUrl}/api/getofflineexam/${currentSession._id}`, { headers })
      .then((examRes) => {
        const exams: any[] = Array.isArray(examRes.data) ? examRes.data : [];
        const matchedExam = exams.find((e: any) =>
          (e.name || "").toLowerCase().includes(termKeyword)
        );

        return Promise.allSettled([
          axios.get(`${apiUrl}/api/get-students/${id}/${currentSession._id}`, { headers }),
          axios.get(`${apiUrl}/api/get-scores-by-student/${id}/${currentSession._id}`, { headers }),
          axios.get(`${apiUrl}/api/account-setting`, { headers }),
          axios.get(`${apiUrl}/api/setting`, { headers }),
          // Use the exam ObjectId for psychomotor lookup (getScores endpoint)
          matchedExam
            ? axios.get(`${apiUrl}/api/get-all-psy/${matchedExam._id}`, { headers })
            : Promise.resolve({ data: { scores: [] } }),
        ]);
      })
      .then(([stuRes, scoresRes, schoolRes, profileRes, psyRes]) => {
        if (stuRes.status === "fulfilled") {
          const d = stuRes.value.data?.data || stuRes.value.data;
          setStudent(Array.isArray(d) ? d[0] : d);
        }
        if (scoresRes.status === "fulfilled") {
          const resData = scoresRes.value.data;
          // API returns { studentId, sessionId, scores: [...] }
          const raw = resData?.scores ?? resData?.data ?? resData;
          const list: Score[] = Array.isArray(raw) ? raw : [];
          const filtered = isCumulative
            ? list
            : list.filter((s) => {
                const examLabel = String(s.examName || s.examId?.name || "").toLowerCase();
                return !examLabel || examLabel.includes(termKeyword);
              });
          setScores(filtered);
        }
        if (schoolRes.status === "fulfilled") {
          const d = schoolRes.value.data?.data || schoolRes.value.data;
          const raw: any = Array.isArray(d) ? d[0] ?? {} : d ?? {};
          const logoRaw = raw.schoolLogo || raw.logo || raw.logoUrl || "";
          const logoFull = logoRaw && !logoRaw.startsWith("http")
            ? `${apiUrl}/${logoRaw.replace(/^\//, "")}`
            : logoRaw;
          setSchool({ ...raw, schoolLogo: logoFull });
        }
        if (profileRes.status === "fulfilled") {
          const d = profileRes.value.data?.data || profileRes.value.data;
          setProfile(Array.isArray(d) ? d[0] ?? {} : d ?? {});
        }
        if (psyRes.status === "fulfilled") {
          // getScores returns { examId, scores: [{ studentId: populated, instruction, ... }] }
          const psyScores: any[] = psyRes.value.data?.scores || [];
          const found = psyScores.find((m: any) =>
            String(m.studentId?._id || m.studentId) === String(id)
          );
          if (found) setPsyData(found);
        }
      })
      .catch(() => {/* silent — partial failure is OK */})
      .finally(() => setLoading(false));
  }, [apiUrl, currentSession, id, termLabel]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const totalAll = scores.reduce((s, r) => {
    const t = Number(r.marksObtained ?? r.total) || (Number(r.testscore ?? r.firstTest ?? 0) + Number(r.examscore ?? r.examScore ?? 0));
    return s + t;
  }, 0);
  const avg = scores.length ? Math.round(totalAll / scores.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      {/* Toolbar — hidden on print */}
      <div className="flex items-center justify-between dont-print">
        <Link to={-1 as any} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft size={18} /> Back
        </Link>
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer size={16} /> Print
        </Button>
      </div>

      {/* Printable area */}
      <div ref={printRef} className="printable-area bg-white border border-border rounded-lg p-6 print:p-4 print:border-none space-y-4">
        {/* School header */}
        <div className="text-center space-y-1 border-b pb-4">
          {school.schoolLogo && (
            <img src={school.schoolLogo} alt="School Logo" className="h-16 w-16 object-contain mx-auto mb-2" />
          )}
          <h1 className="text-xl font-black text-primary uppercase">{school.name || "School Name"}</h1>
          <p className="text-xs text-muted-foreground italic">{school.motto}</p>
          <p className="text-xs text-muted-foreground">{school.address}</p>
          {school.phone && <p className="text-xs text-muted-foreground">Tel: {school.phone}</p>}
          <div className="mt-2 inline-block bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
            {termLabel} Report Card
          </div>
        </div>

        {/* Student info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-b pb-4">
          {[
            ["Name", student?.studentName || student?.name || "—"],
            ["Class", student?.classname || "—"],
            ["Adm. No.", student?.AdmNo || "—"],
            ["Gender", student?.gender || "—"],
            ["Session", currentSession?.name || "—"],
            ["Term", termLabel],
          ].map(([label, value]) => (
            <div key={label} className="space-y-0.5">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{label}</p>
              <p className="font-semibold text-primary">{value}</p>
            </div>
          ))}
        </div>

        {/* Scores table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                {["Subject", "Test", "Exam", "Total", "Grade", "Remark"].map((h) => (
                  <th key={h} className="px-2 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No scores found for this term</td></tr>
              ) : (
                scores.map((s, i) => {
                  const test = Number(s.testscore ?? s.firstTest ?? 0);
                  const exam = Number(s.examscore ?? s.examScore ?? 0);
                  const total = Number(s.marksObtained ?? s.total) || (test + exam);
                  const { grade, comment } = deriveGrade(total);
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-muted/40" : "bg-white"}>
                      <td className="px-2 py-1.5 font-medium">{s.subjectName || s.subject || "—"}</td>
                      <td className="px-2 py-1.5 text-center">{test || "—"}</td>
                      <td className="px-2 py-1.5 text-center">{exam || "—"}</td>
                      <td className="px-2 py-1.5 text-center font-bold">{total || "—"}</td>
                      <td className={`px-2 py-1.5 text-center ${gradeColor(s.grade || grade)}`}>{s.grade || grade}</td>
                      <td className="px-2 py-1.5">{s.comment || comment}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {scores.length > 0 && (
              <tfoot>
                <tr className="bg-primary/10 font-bold">
                  <td className="px-2 py-2" colSpan={3}>Average</td>
                  <td className="px-2 py-2 text-center">{avg}</td>
                  <td className="px-2 py-2 text-center" colSpan={2}>{deriveGrade(avg).grade}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Psychomotor / Affective Report */}
        {psyData && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-xs font-bold text-primary uppercase mb-2">Affective &amp; Psychomotor Report</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="px-2 py-1.5 text-left">Trait</th>
                  <th className="px-2 py-1.5 text-center">Score (0–5)</th>
                  <th className="px-2 py-1.5 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {([
                  ["Following Instruction", psyData.instruction],
                  ["Working Independently", psyData.independently],
                  ["Punctuality", psyData.punctuality],
                  ["Talking", psyData.talking],
                  ["Eye Contact", psyData.eyecontact],
                ] as [string, number][]).map(([label, val], i) => (
                  <tr key={label} className={i % 2 === 0 ? "bg-muted/40" : "bg-white"}>
                    <td className="px-2 py-1.5 font-medium">{label}</td>
                    <td className="px-2 py-1.5 text-center">{val}</td>
                    <td className="px-2 py-1.5">{psyRating(val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(psyData.remarks || psyData.premarks) && (
              <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                {psyData.remarks && (
                  <div><span className="font-bold text-primary">Teacher's Remark: </span>{psyData.remarks}</div>
                )}
                {psyData.premarks && (
                  <div><span className="font-bold text-primary">Principal's Remark: </span>{psyData.premarks}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t text-xs text-center">
          <div className="space-y-8">
            <div className="border-b border-border" />
            <p className="text-muted-foreground">Class Teacher</p>
          </div>
          <div className="space-y-8">
            {profile.signature && (
              <img src={profile.signature} alt="Principal Signature" className="h-10 object-contain mx-auto" />
            )}
            <div className="border-b border-border" />
            <p className="text-muted-foreground">Principal: {profile.principalName || "—"}</p>
          </div>
          <div className="space-y-8">
            <div className="border-b border-border" />
            <p className="text-muted-foreground">Head Teacher</p>
          </div>
        </div>

        {profile.resumptionDate && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            Next Resumption: <span className="font-semibold">{new Date(profile.resumptionDate).toLocaleDateString()}</span>
          </p>
        )}
      </div>
    </div>
  );
}
