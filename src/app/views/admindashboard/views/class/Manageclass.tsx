import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormShell } from "@/components/ActionForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function ManageClasses() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const classUrl = currentSession?._id
    ? `/class/${currentSession._id}`
    : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(classUrl);
  const classes = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data],
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [form, setForm] = useState({ name: "", teacher: "" });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (item: any) => {
    setSelectedClass(item);
    setForm({ name: String(item.name || ""), teacher: String(item.teacher || item.classTeacher || "") });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/class`, {
          name: form.name,
          teacher: form.teacher,
          session: currentSession._id,
        });
        toast.success("Class created successfully");
      } else if (view === "edit" && selectedClass?._id) {
        await axios.put(`${apiUrl}/api/class/${selectedClass._id}`, {
          name: form.name,
          teacher: form.teacher,
        });
        toast.success("Class updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedClass(null);
      setForm({ name: "", teacher: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/class/${selectedClass._id}`);
      toast.success("Class deleted successfully");
      await reFetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedClass(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Class"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedClass(null);
          }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. JS1 or S.S.3.A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class Teacher
            </Label>
            <Input
              value={form.teacher}
              onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
              placeholder="e.g. Mr Praise"
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Manage Classes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create, edit, and organize school class sections and assign their
            respective class teachers.
          </p>
        </div>
        <Button
          onClick={() => { setForm({ name: "", teacher: "" }); setSelectedClass(null); setView("add"); }}
          className="w-fit gap-2 bg-[#004aaa] hover:bg-[#004aaa]/90">
          <Plus className="h-4 w-4" />
          Add new Class
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Class Name
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Class Teacher
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Capacity
                </TableHead>
                <TableHead className="text-right text-[#004aaa] font-bold pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    Loading classes…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                    Failed to load classes.
                  </TableCell>
                </TableRow>
              ) : classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    No classes found for this session.
                  </TableCell>
                </TableRow>
              ) : null}
              {!listLoading &&
                !error &&
                currentClasses.map((item, index) => (
                <TableRow
                  key={(item._id as string) || (item.id as string) || index}
                  className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 font-medium text-slate-500">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {(item.name as string) || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {(item.teacher as string) ||
                      (item.classTeacher as string) ||
                      "—"}
                  </TableCell>
                  <TableCell className="text-center text-slate-500 font-medium">
                    {(item.capacity as string) ||
                      String(item.studentCount ?? "—")}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                        title="Edit Class">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClass(item);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-destructive hover:bg-red-50"
                        title="Delete Class">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={classes.length}
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
        itemName={selectedClass?.name}
      />
    </div>
  );
}
