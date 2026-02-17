import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ExamAnalytics() {


 


  const students = [
    {
      name: "Rahul",
      email: "rahul@gmail.com",
      score: 80,
      percentage: 80,
      time: "10 min",
    },
    {
      name: "Anjali",
      email: "anjali@gmail.com",
      score: 65,
      percentage: 65,
      time: "12 min",
    },
    {
      name: "Arjun",
      email: "arjun@gmail.com",
      score: 90,
      percentage: 90,
      time: "8 min",
    },
  ];

  const questionStats = [
    { question: "Q1", correct: 80 },
    { question: "Q2", correct: 60 },
    { question: "Q3", correct: 90 },
    { question: "Q4", correct: 50 },
  ];

     const [studentsData, setStudentsData] = useState(students);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const totalstudents = students.length;

  const AveregeScore =
    students.reduce((acc, curr) => acc + curr.score, 0) / totalstudents;

  const HighestScore = Math.max(...students.map((mark, index) => mark.score));

  let lowestscore = Math.min(...students.map((s) => s.score));


  function sortTable(key) {

    let direction = 'asc';

    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        
        direction = 'desc'
    }

    const sorted = [...studentsData.sort((a,b)=>{
        if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
    })]

    setStudentsData(sorted)
    setSortConfig({ key, direction });
  }

  return (
    <>
      <div className="flex flex-col flex-1 px-4">
        <div className=" grid grid-cols-4 gap-4 mb-8 mt-4">
          <div className="bg-white shadow p-4 rounded">
            <h4>Total Students</h4>
            <p className="text-xl font-bold">{totalstudents}</p>
          </div>
          <div className="bg-white shadow p-4 rounded">
            <h4>Average Score</h4>
            <p className="text-xl font-bold">{AveregeScore.toFixed(0)}</p>
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
