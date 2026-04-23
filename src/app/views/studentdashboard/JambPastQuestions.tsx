import { useState, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import useFetch from "@/hooks/useFetch";
import { BookOpen, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";

type Question = {
  Question: string;
  Options?: { Key: string; Value: string }[]; // array format (new)
  Option?: Record<string, string>;            // dict format (fallback)
  Answer: string;
  Topic: string;
  Year: number | string;
  Explanation?: string;
};

export default function JambPastQuestions() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: subjectsRaw, loading: loadingSubjects } = useFetch("/jamb/subject");
  const subjects: string[] = useMemo(
    () => (Array.isArray(subjectsRaw) ? subjectsRaw : []),
    [subjectsRaw]
  );

  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubjectChange = async (subject: string) => {
    setSelectedSubject(subject);
    setTopics([]);
    setSelectedTopics([]);
    setQuestions([]);
    setStarted(false);
    setSubmitted(false);
    setAnswers({});
    setLoadingTopics(true);
    try {
      const { data } = await axios.get(`${apiUrl}/api/jamb/subject/${encodeURIComponent(subject)}/topics`, { headers: authHeaders() });
      setTopics(Array.isArray(data) ? data : []);
    } catch {
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleStart = async () => {
    if (!selectedSubject) return;
    setLoadingQ(true);
    setSubmitted(false);
    setAnswers({});
    try {
      const params = new URLSearchParams();
      selectedTopics.forEach((t) => params.append("topics[]", t));
      params.set("limit", "20");
      const { data } = await axios.get(
        `${apiUrl}/api/jamb/subject/${encodeURIComponent(selectedSubject)}/questions?${params}`,
        { headers: authHeaders() }
      );
      setQuestions(Array.isArray(data) ? data : []);
      setStarted(true);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQ(false);
    }
  };

  const handleReset = () => {
    setStarted(false);
    setSubmitted(false);
    setAnswers({});
    setQuestions([]);
    setSelectedTopics([]);
  };

  // Answer field is HTML like "<p><span>C</span></p>" — strip to get just the letter
  const stripHtml = (html: string) =>
    html.replace(/<[^>]*>/g, "").replace(/\s+/g, "").trim();

  const score = useMemo(
    () => questions.filter((q, i) => answers[i] === stripHtml(q.Answer)).length,
    [answers, questions]
  );

  const stripStyleTags = (html: string) =>
    html.replace(/<style[\s\S]*?<\/style>/gi, "").trim();

  if (started && questions.length > 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#004aaa]">{selectedSubject} — Past Questions</h2>
            <p className="text-xs text-slate-500">{questions.length} questions</p>
          </div>
          <div className="flex gap-2">
            {!submitted && (
              <Button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length === 0}
                className="bg-green-600 hover:bg-green-700 gap-2">
                Submit
              </Button>
            )}
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw size={14} /> New Quiz
            </Button>
          </div>
        </div>

        {submitted && (
          <Card className="border-none bg-[#004aaa] text-white">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-black">{score}/{questions.length}</p>
              <p className="text-sm mt-1 opacity-80">
                {Math.round((score / questions.length) * 100)}% — {score >= questions.length * 0.7 ? "Well done!" : "Keep practising!"}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const correct = stripHtml(q.Answer);
            // Options is an array [{Key, Value}] — fall back to Option dict for compatibility
            const opts: {Key: string; Value: string}[] = Array.isArray((q as any).Options)
              ? (q as any).Options
              : Object.entries((q as any).Option || {}).map(([Key, Value]) => ({ Key, Value: String(Value) }));
            return (
              <Card key={i} className={`border ${submitted && chosen === correct ? "border-green-300 bg-green-50/30" : submitted && chosen && chosen !== correct ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex gap-2 items-start">
                    <span className="shrink-0 text-[10px] font-black bg-[#004aaa] text-white rounded-full h-5 w-5 flex items-center justify-center mt-0.5">{i + 1}</span>
                    <div
                      className="text-sm font-semibold text-[#004aaa] prose prose-sm max-w-none [&_table]:w-full [&_th]:bg-slate-100 [&_td,&_th]:p-2"
                      dangerouslySetInnerHTML={{ __html: stripStyleTags(q.Question) }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {opts.map(({ Key, Value }) => {
                      const isCorrect = submitted && Key === correct;
                      const isWrong = submitted && chosen === Key && Key !== correct;
                      return (
                        <button
                          key={Key}
                          disabled={submitted}
                          onClick={() => !submitted && setAnswers((a) => ({ ...a, [i]: Key }))}
                          className={`flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                            chosen === Key && !submitted ? "border-[#004aaa] bg-[#004aaa]/10 font-semibold" :
                            isCorrect ? "border-green-500 bg-green-100 font-bold text-green-800" :
                            isWrong ? "border-red-400 bg-red-100 text-red-700 line-through" :
                            "border-slate-200 hover:border-slate-400"
                          }`}>
                          <span className="font-bold shrink-0">{Key}.</span>
                          <span dangerouslySetInnerHTML={{ __html: stripStyleTags(Value) }} />
                          {isCorrect && <CheckCircle2 size={12} className="ml-auto text-green-600 shrink-0" />}
                          {isWrong && <XCircle size={12} className="ml-auto text-red-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.Explanation && (
                    <p className="pl-7 text-[11px] text-slate-500 italic" dangerouslySetInnerHTML={{ __html: stripStyleTags(q.Explanation) }} />
                  )}
                  {submitted && (
                    <p className="pl-7 text-[10px] font-bold text-slate-400">
                      Topic: {q.Topic} · Year: {q.Year}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">JAMB Past Questions</h2>
        <p className="text-sm text-slate-500">Practice with real JAMB past questions by subject and topic</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-[#004aaa] flex items-center gap-2">
            <BookOpen size={16} /> Select Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400">Subject</label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger className="h-11 border-slate-200">
                <SelectValue placeholder={loadingSubjects ? "Loading subjects…" : "Choose a subject"} />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400">
                Topics (optional — leave blank for all)
              </label>
              {loadingTopics ? (
                <p className="text-xs text-slate-400">Loading topics…</p>
              ) : topics.length === 0 ? (
                <p className="text-xs text-slate-400">No topics available for this subject.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        selectedTopics.includes(t)
                          ? "bg-[#004aaa] text-white border-[#004aaa]"
                          : "border-slate-200 text-slate-600 hover:border-[#004aaa]"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={!selectedSubject || loadingQ}
            className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 w-full h-11">
            {loadingQ ? "Loading questions…" : "Start Practice"} <ChevronRight size={16} />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
