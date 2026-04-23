import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Search } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";

type MarkRow = {
  studentId: string;
  studentName?: string;
  AdmNo?: string;
  testscore: number;
  examscore: number;
  marksObtained: number;
  comment: string;
};

type GradeRule = {
  markfrom?: number;
  markupto?: number;
  comment?: string;
};

export default function ManageMarks() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const sessionId = currentSession?._id;

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [fetched, setFetched] = useState(false);
  const itemsPerPage = 5;

  const { data: classData } = useFetch(sessionId ? `/class/${sessionId}` : null);
  const { data: examsData } = useFetch(sessionId ? `/getofflineexam/${sessionId}` : null);
  const { data: gradesData } = useFetch(sessionId ? `/grade/${sessionId}` : null);
  const { data: subjectData } = useFetch(
    selectedClass && sessionId ? `/get-subject/${encodeURIComponent(selectedClass)}/${sessionId}` : null
  );

  const classes = useMemo(() => (Array.isArray(classData) ? (classData as any[]) : []), [classData]);
  const exams = useMemo(() => (Array.isArray(examsData) ? (examsData as any[]) : []), [examsData]);
  const subjects = useMemo(() => (Array.isArray(subjectData) ? (subjectData as any[]) : []), [subjectData]);
  const gradeRules = useMemo(
    () =>
      (Array.isArray((gradesData as any)?.data) ? ((gradesData as any).data as GradeRule[]) : []).sort(
        (a, b) => Number(b.markfrom || 0) - Number(a.markfrom || 0)
      ),
    [gradesData]
  );

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getRemarkFromTotal = (total: number) => {
    const rule = gradeRules.find(
      (item) => total >= Number(item.markfrom || 0) && total <= Number(item.markupto || 0)
    );
    if (rule?.comment) return rule.comment;
    if (total >= 70) return "Excellent";
    if (total >= 60) return "Very Good";
    if (total >= 50) return "Good";
    if (total >= 40) return "Fair";
    return "Fail";
  };

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSelectedSubjectId("");
    setSelectedSubjectName("");
    setRows([]);
    setFetched(false);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const found = subjects.find((s: any) => s._id === subjectId);
    setSelectedSubjectName(found?.subjectName || found?.name || "");
  };

  const handleLoad = async () => {
    if (!sessionId || !selectedClass || !selectedSubjectId || !selectedExam) {
      toast.error("Please select an exam, class, and subject");
      return;
    }

    setLoading(true);
    try {
      const [stuRes, scoresRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/api/students/${sessionId}/${selectedClass}`, { headers: authHeaders() }),
        axios.get(`${apiUrl}/api/get-all-scores/${selectedExam}/${selectedSubjectId}/${sessionId}`, {
          headers: authHeaders(),
        }),
      ]);

      const students =
        stuRes.status === "fulfilled" && Array.isArray(stuRes.value.data) ? stuRes.value.data : [];
      const scores =
        scoresRes.status === "fulfilled" && Array.isArray(scoresRes.value.data?.scores)
          ? scoresRes.value.data.scores
          : [];

      const merged: MarkRow[] = students.map((student: any) => {
        const score = scores.find(
          (item: any) => String(item.studentId?._id || item.studentId) === String(student._id)
        );
        const testscore = Number(score?.testscore ?? 0);
        const examscore = Number(score?.examscore ?? 0);
        const marksObtained = Number(score?.marksObtained ?? testscore + examscore);
        return {
          studentId: String(student._id),
          studentName: student.studentName || student.username || student.name,
          AdmNo: student.AdmNo || student.admNo,
          testscore,
          examscore,
          marksObtained,
          comment: score?.comment || getRemarkFromTotal(marksObtained),
        };
      });

      setRows(merged);
      setFetched(true);
      setCurrentPage(1);
      if (merged.length === 0) toast.warning("No students found for this class.");
    } catch (error) {
      console.error("Failed to load marks:", error);
      toast.error("Failed to load marks");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRow = (globalIndex: number, field: "testscore" | "examscore", value: string) => {
    setRows((prev) =>
      prev.map((row, index) => {
        if (index !== globalIndex) return row;
        const next = { ...row };
        next[field] = Number(value) || 0;
        next.marksObtained = Number(next.testscore || 0) + Number(next.examscore || 0);
        next.comment = getRemarkFromTotal(next.marksObtained);
        return next;
      })
    );
  };

  const handleSave = async () => {
    if (!sessionId || !selectedExam || !selectedSubjectId) return;

    setSaving(true);
    try {
      await axios.post(
        `${apiUrl}/api/save-marks/${sessionId}`,
        {
          examId: selectedExam,
          subjectId: selectedSubjectId,
          updates: rows.map((row) => ({
            studentId: row.studentId,
            testscore: Number(row.testscore || 0),
            examscore: Number(row.examscore || 0),
            comment: row.comment || "",
          })),
        },
        { headers: authHeaders() }
      );
      toast.success("Marks saved successfully");
    } catch (error) {
      console.error("Failed to save marks:", error);
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-primary">Manage Exam Marks</h2>
        <p className="text-sm text-muted-foreground">Select parameters to record or update student scores.</p>
      </div>

      <Card className="border-black shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-11 border-black">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Class</label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="h-11 border-black">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem: any) => (
                    <SelectItem key={String(classItem._id || classItem.id)} value={String(classItem.name || "")}>
                      {String(classItem.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Subject</label>
              <Select value={selectedSubjectId} onValueChange={handleSubjectChange} disabled={!selectedClass}>
                <SelectTrigger className="h-11 border-black">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: any) => (
                    <SelectItem key={String(subject._id || subject.id)} value={String(subject._id || subject.id)}>
                      {String(subject.subjectName || subject.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="h-11 gap-2" disabled={!selectedExam || !selectedClass || !selectedSubjectId || loading} onClick={handleLoad}>
              <Search className="h-4 w-4" />
              {loading ? "Loading..." : "Load Marks"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <Card className="border-black shadow-sm overflow-hidden">
          <CardHeader className="border-b border-black bg-muted/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-primary">
                Marks For: {selectedSubjectName || "-"} ({selectedClass || "-"})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || rows.length === 0} className="gap-2 border-black text-primary hover:bg-accent">
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[60px] pl-6 text-center font-bold text-primary">#</TableHead>
                  <TableHead className="font-bold text-primary">Student Detail</TableHead>
                  <TableHead className="w-[140px] text-center font-bold text-primary">Test Score (40)</TableHead>
                  <TableHead className="w-[140px] text-center font-bold text-primary">Exam Score (60)</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-primary">Total</TableHead>
                  <TableHead className="pr-6 font-bold text-primary">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading marks...
                    </TableCell>
                  </TableRow>
                ) : currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((student, index) => (
                    <TableRow key={student.studentId} className="hover:bg-muted/30">
                      <TableCell className="pl-6 text-center font-medium text-muted-foreground">
                        {indexOfFirstItem + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{student.studentName || "-"}</span>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">{student.AdmNo || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={40}
                          value={student.testscore}
                          onChange={(event) => handleChangeRow(indexOfFirstItem + index, "testscore", event.target.value)}
                          className="h-9 border-black text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          value={student.examscore}
                          onChange={(event) => handleChangeRow(indexOfFirstItem + index, "examscore", event.target.value)}
                          className="h-9 border-black text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold text-primary">{student.marksObtained}</TableCell>
                      <TableCell className="pr-6">
                        <Input
                          value={student.comment}
                          readOnly
                          className="h-9 border-black bg-muted/30 font-medium text-black"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="border-t border-black px-4">
              <DataTablePagination
                totalItems={rows.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
