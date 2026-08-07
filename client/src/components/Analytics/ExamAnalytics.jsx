import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dashboardService from "../../services/dashboardService";
import { CardSkeleton, TableRowsSkeleton, Skeleton, FadeIn } from "../common/Loaders";

export default function ExamAnalytics() {
  const [studentsData, setStudentsData] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const examId = localStorage.getItem('selectedExamId');
        const data = await dashboardService.getStats(examId);

        const students = Array.isArray(data?.students) ? data.students : [];
        setStudentsData(students.map((s) => ({
          ...s,
          time: s.timeTaken ? `${Math.ceil(s.timeTaken / 60)} min` : '0 min'
        })));

        const questionData = Array.isArray(data?.questionStats) ? data.questionStats : [];
        setQuestionStats(questionData.map((q) => ({
          question: q.question,
          correct: q.successRate ?? 0
        })));

        setSummary({
          totalStudents: data?.totalStudents || 0,
          averageScore: data?.averageScore ?? data?.average ?? 0,
          highestScore: data?.highestScore ?? data?.highest ?? 0,
          lowestScore: data?.lowestScore ?? data?.lowest ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalstudents = summary.totalStudents;
  const AveregeScore = summary.averageScore;
  const HighestScore = summary.highestScore;
  let lowestscore = summary.lowestScore;

  function sortTable(key) {
    let direction = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [
      ...studentsData.sort((a, b) => {
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
        if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
        return 0;
      }),
    ];

    setStudentsData(sorted);
    setSortConfig({ key, direction });
  }

if (loading) {
    return (
      <div className="flex flex-col flex-1 min-w-0 px-4">
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 mt-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        {/* Skeleton table */}
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border min-w-[640px]">
                <thead>
                  <tr>
                    {['Name', 'Email', 'Score', 'Percentage', 'Time Taken'].map((h) => (
                      <th key={h} className="border p-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRowsSkeleton rows={5} cols={5} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Skeleton chart */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="flex flex-col flex-1 min-w-0 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 mt-4">
          <div className="bg-white shadow p-4 rounded">
            <h4 className="text-sm text-gray-500">Total Students</h4>
            <p className="text-xl font-bold">{totalstudents}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h4 className="text-sm text-gray-500">Average Score</h4>
            <p className="text-xl font-bold">{Number(AveregeScore || 0).toFixed(0)}</p>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h4 className="text-sm text-gray-500">Highest Score</h4>
            <p className="text-xl font-bold">{HighestScore}</p>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h4 className="text-sm text-gray-500">Lowest Score</h4>
            <p className="text-xl font-bold"> {lowestscore}</p>
          </div>
        </div>

        {/* table */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Student List</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border min-w-[640px]">
                <thead>
                  <tr>
                    <th className="border p-2 text-left whitespace-nowrap" onClick={() => sortTable("name")}>Name</th>
                    <th className="border p-2 text-left whitespace-nowrap" onClick={() => sortTable("email")}>Email</th>
                    <th className="border p-2 text-left whitespace-nowrap" onClick={() => sortTable("score")}>Score</th>
                    <th className="border p-2 text-left whitespace-nowrap" onClick={() => sortTable("percentage")}>Percentage</th>
                    <th className="border p-2 text-left whitespace-nowrap" onClick={() => sortTable("time")}>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student, index) => (
                    <tr key={index}>
                      <td className="border p-2 table-cell-wrap">{student.name}</td>
                      <td className="border p-2">{student.email}</td>
                      <td className="border p-2">{student.score}</td>
                      <td className="border p-2">{student.percentage}%</td>
                      <td className="border p-2 whitespace-nowrap">{student.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* chart */}
        <div>
          <h3 className="text-xl font-semibold mb-4">question perfomance</h3>
        </div>

        <div className="w-full min-w-0">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionStats}>
              <CartesianGrid strokeDasharray={" 3 3"} />
              <XAxis dataKey={"question"} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={"correct"} fill=" #3949AB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </FadeIn>
  );
}
