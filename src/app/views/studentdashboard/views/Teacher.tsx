import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function StudentTeacherView() {
  const { currentSession } = useContext(SessionContext);
  const { data, loading } = useFetch(
    currentSession?._id ? `/get-teachers/${currentSession._id}` : null
  );
  const teachers = useMemo(
    () => (Array.isArray(data) ? (data as any[]) : []),
    [data]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">Teachers</h2>
        <p className="text-sm text-slate-500">{teachers.length} teacher{teachers.length !== 1 ? "s" : ""} in this session</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Name</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Email</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">Loading teachers…</TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">No teachers found.</TableCell>
                </TableRow>
              ) : teachers.map((t, i) => (
                <TableRow key={t._id || i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">{i + 1}</TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {t.username || t.teacherName || t.name || "—"}
                  </TableCell>
                  <TableCell className="text-blue-600">{t.email || "—"}</TableCell>
                  <TableCell className="text-slate-600">{t.phone || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
