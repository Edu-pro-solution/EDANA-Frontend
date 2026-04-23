import React, { useState, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormShell } from "@/components/ActionForm";
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
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  FileQuestion,
  Plus,
  ArrowLeft,
  Printer,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import ManageQuestions from "./ManageQuestions";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

type ViewState = "list" | "add" | "edit" | "questions" | "results";

export default function ManageOnlineExams() {
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Data States
  const { data: examsData, loading: examsLoading, reFetch } = useFetch(
    currentSession ? `/get-exam/${currentSession._id}` : null
  );
  
  const exams = Array.isArray(examsData) ? examsData : [];
  const [view, setView] = useState<ViewState>("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);

  const fetchResults = async (exam: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get(`${apiUrl}/api/exams/all-scores/${exam._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExamResults(res.data);
      setView("results");
    } catch (err) {
      console.error("Error fetching results:", err);
      toast({ title: "Error", description: "Failed to fetch exam results.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(`${apiUrl}/api/edit-exam/${selectedExam._id}`, selectedExam, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Exam updated successfully!" });
      setView("list");
      reFetch();
    } catch (err) {
      console.error("Error updating exam:", err);
      toast({ title: "Error", description: "Failed to update exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExam) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`${apiUrl}/api/exam/${selectedExam._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Exam deleted successfully!" });
      setIsDeleteOpen(false);
      reFetch();
    } catch (err) {
      console.error("Error deleting exam:", err);
      toast({ title: "Error", description: "Failed to delete exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const handleSaveQuestions = (examId: string, questions: any[]) => {
    console.log("Saving questions for exam:", examId, questions);
    toast({ title: "Note", description: "Question saving is currently handled via ManageQuestions internal logic or API." });
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setView("list");
            setSelectedExam(null);
          }}
          className="text-slate-500 hover:text-[#004aaa] gap-2">
          <ArrowLeft size={16} /> Back to Manage Online Exams
        </Button>

        <FormShell
          title="Online Exam"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Exam Title
            </Label>
            <Input
              defaultValue={selectedExam?.name}
              placeholder="e.g. Mid-Term Coding"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class Name
            </Label>
            <Select defaultValue={selectedExam?.class}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JS2">JS2</SelectItem>
                <SelectItem value="S.S.3.A">S.S.3.A</SelectItem>
                <SelectItem value="JS1">JS1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Subject
            </Label>
            <Select defaultValue={selectedExam?.subject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coding">Coding</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Exam Date
            </Label>
            <Input type="date" defaultValue={selectedExam?.date} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Start Time
            </Label>
            <Input type="time" defaultValue={selectedExam?.fromTime} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              End Time
            </Label>
            <Input type="time" defaultValue={selectedExam?.toTime} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Pass Percentage
            </Label>
            <Input
              type="number"
              defaultValue={selectedExam?.passMark}
              placeholder="e.g. 40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Total Mark
            </Label>
            <Input
              type="number"
              defaultValue={selectedExam?.totalMark}
              placeholder="e.g. 100"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Instructions
            </Label>
            <Textarea
              defaultValue={selectedExam?.instruction}
              placeholder="Enter exam rules or guidelines here..."
              className="min-h-[120px] resize-none"
            />
          </div>
        </FormShell>
      </div>
    );
  }

  if (view === "questions" && selectedExam) {
    return (
      <ManageQuestions
        exam={selectedExam}
        onBack={() => {
          setView("list");
          setSelectedExam(null);
        }}
        onSaveQuestions={handleSaveQuestions}
      />
    );
  }

  if (view === "results" && selectedExam) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setSelectedExam(null);
            }}
            className="text-slate-500 hover:text-[#004aaa] gap-2">
            <ArrowLeft size={16} /> Back to Manage Online Exams
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 border-slate-300">
            <Printer size={16} /> Print Result
          </Button>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-[#004aaa] text-lg font-bold">
              View Result
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Exam Title
                </p>
                <p className="text-[#004aaa] font-semibold">
                  {selectedExam.examTitle || selectedExam.name}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Date
                </p>
                <p className="text-[#004aaa] font-semibold">
                  {selectedExam.examDate || selectedExam.date}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Class
                </p>
                <p className="text-[#004aaa] font-semibold">
                  {selectedExam.className || selectedExam.class}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Time
                </p>
                <p className="text-[#004aaa] font-semibold">
                  {selectedExam.startTime || selectedExam.fromTime} - {selectedExam.endTime || selectedExam.toTime}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Instruction
                </p>
                <p className="text-slate-600">{selectedExam.instruction}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Pass Mark
                </p>
                <p className="text-[#004aaa] font-semibold">
                  {selectedExam.passPercentage || selectedExam.passMark || 40}%
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#E8EBF3]">
                  <TableRow>
                    <TableHead className="text-[#004aaa] font-bold pl-6">
                      Student Name
                    </TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-center">
                      Mark Obtained
                    </TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-right pr-6">
                      Result
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                        No results available for this exam.
                      </TableCell>
                    </TableRow>
                  ) : (
                    examResults.map((result: any) => (
                      <TableRow key={result._id}>
                        <TableCell className="pl-6 font-medium text-[#004aaa]">
                          {result.studentName}
                        </TableCell>
                        <TableCell className="text-center text-slate-600 font-semibold">
                          {result.score}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                              result.score >= (selectedExam.passPercentage || selectedExam.passMark || 40)
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}>
                            {result.score >= (selectedExam.passPercentage || selectedExam.passMark || 40) ? "PASSED" : "FAILED"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold text-[#004aaa]">
          Manage Online Exams
        </h2>
        <Button
          onClick={() => setView("add")}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2">
          <Plus size={16} /> Add New Exam
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[50px] pl-6">
                  <Checkbox />
                </TableHead>
                <TableHead className="w-[60px] font-bold text-[#004aaa]">
                  S/N
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">
                  Exam Name
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">
                  Class Name
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">
                  Subject
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">
                  Exam Date
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">Time</TableHead>
                <TableHead className="text-right font-bold text-[#004aaa] pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#004aaa]" />
                      Loading exams...
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                    No online exams found.
                  </TableCell>
                </TableRow>
              ) : (
                currentExams.map((exam, index) => (
                  <TableRow
                    key={exam._id}
                    className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {exam.title || exam.examTitle || exam.name || "—"}
                    </TableCell>
                    <TableCell className="text-slate-600">{exam.className || exam.class}</TableCell>
                    <TableCell className="text-slate-600">
                      {exam.subjectName || exam.subject}
                    </TableCell>
                    <TableCell className="text-slate-600">{exam.date}</TableCell>
                    <TableCell className="text-slate-600 text-sm">
                      {exam.startTime || exam.fromTime} - {exam.endTime || exam.toTime}
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setSelectedExam(exam);
                              setView("questions");
                            }}>
                            <FileQuestion size={16} className="text-blue-500" />
                            Manage Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setSelectedExam(exam);
                              fetchResults(exam);
                            }}>
                            <Eye size={16} className="text-slate-500" />
                            View Result
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => {
                              setSelectedExam(exam);
                              setView("edit");
                            }}>
                            <Edit3 size={16} className="text-amber-500" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600"
                            onClick={() => {
                              setSelectedExam(exam);
                              setIsDeleteOpen(true);
                            }}>
                            <Trash2 size={16} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4 bg-white">
            <DataTablePagination
              totalItems={exams.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        itemName={selectedExam?.name}
      />
    </div>
  );
}
