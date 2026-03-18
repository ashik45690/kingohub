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

export default function ExamAnalytics() {
  const [studentsData, setStudentsData] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
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

  return (
    <>
      <div className="flex flex-col  flex-1 px-4">
        <div className=" grid grid-cols-4 gap-4 mb-8 mt-4">
          <div className="bg-white shadow p-4 rounded">
            <h4>Total Students</h4>
            <p className="text-xl font-bold">{totalstudents}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h4>Average Score</h4>
            <p className="text-xl font-bold">{Number(AveregeScore || 0).toFixed(0)}</p>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h4>Highest Score</h4>
            <p className="text-xl font-bold">{HighestScore}</p>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h4>Lowest Score</h4>
            <p className="text-xl font-bold"> {lowestscore}</p>
          </div>
        </div>

        {/* table */}

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Student List</h3>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2" onClick={() => sortTable("name")}>Name</th>
                <th className="border p-2" onClick={() => sortTable("email")}>Email</th>
                <th className="border p-2" onClick={() => sortTable("score")}>Score</th>
                <th className="border p-2" onClick={() => sortTable("percentage")}>Percentage</th>
                <th className="border p-2" onClick={() => sortTable("time")}>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {studentsData.map((student, index) => (
                <tr key={index}>
                  <td className="border p-2">{student.name}</td>
                  <td className="border p-2">{student.email}</td>
                  <td className="border p-2">{student.score}</td>
                  <td className="border p-2">{student.percentage}%</td>
                  <td className="border p-2">{student.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* chart */}
        <div>
          <h3 className="text-xl font-semibold mb-4">question perfomance</h3>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={questionStats}>
            <CartesianGrid strokeDasharray={" 3 3"} />
            <XAxis dataKey={"question"} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={"correct"} fill=" #3949AB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
