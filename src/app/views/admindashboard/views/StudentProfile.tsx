import useFetch from "@/hooks/useFetch";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";

export default function StudentProfile() {
  useFetch("/sessions");

  const { id } = useParams();
  const navigate = useNavigate();

  // Mock student lookup - this would eventually be an API call
  const student = {
    name: "Akinola Al-ameen",
    admNo: "Hlhs12345",
    email: "akinola@gmail.com",
    class: "JS1",
    address: "14, Babs Ladipo Street, Lagos",
    dob: "12/05/2012",
    parent: "Mr. Akinola",
  };

  const info = [
    { label: "Admission Number", value: student.admNo },
    { label: "Current Class", value: student.class },
    { label: "Email Address", value: student.email },
    { label: "Home Address", value: student.address },
    { label: "Parent/Guardian", value: student.parent },
    { label: "Date of Birth", value: student.dob },
  ];

  return (
    <div className="p-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="gap-2 text-slate-500 hover:text-[#004aaa]">
        <ArrowLeft size={18} /> Back to Students
      </Button>

      <div className="flex justify-between items-center max-w-4xl">
        <h2 className="text-[#004aaa] text-2xl font-bold">Student Profile</h2>
      </div>

      <Card className="max-w-4xl border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-[#004aaa] text-lg font-bold">
            {student.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {info.map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[220px_1fr] items-center border-b border-slate-50 pb-4">
              <span className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-[#004aaa] font-bold">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
