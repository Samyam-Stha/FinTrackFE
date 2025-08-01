// src/components/ExpensePieChart.jsx
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

const COLORS = [
  "#8884d8", // purple
  "#82ca9d", // green
  "#ffc658", // yellow
  "#ff8042", // orange
  "#8dd1e1", // light blue
  "#a4de6c", // light green
  "#d0ed57", // lime
  "#ffbb28", // gold
  "#e57373", // red
  "#ba68c8", // violet
  "#4fc3f7", // sky blue
  "#ffd54f", // light yellow
  "#81c784", // medium green
  "#f06292", // pink
  "#9575cd", // lavender
  "#4db6ac", // teal
  "#fbc02d", // deep yellow
  "#f44336", // deep red
  "#64b5f6", // blue
  "#aed581", // pale green
  "#ffb300", // amber
  "#ff7043", // deep orange
  "#b2dfdb", // turquoise
  "#cddc39", // chartreuse
];

export default function ExpensePieChart({ isDark, interval }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: log interval to verify updates
  console.log('ExpensePieChart interval:', interval);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`transactions/expenses/by-category?interval=${interval}`);

      const formatted = res.data.map((item) => ({
        ...item,
        total: Number(item.total),
      }));

      setData(formatted);
    } catch (err) {
      console.error("Error loading expense chart:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [interval]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading spending data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        No transactions
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ category, percent }) =>
            `${category} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `Rs. ${value}`}
          contentStyle={{ background: isDark ? "#222" : "#fff", color: isDark ? "#eee" : "#222" }}
        />
        {/* <Legend wrapperStyle={{ color: isDark ? "#eee" : "#222" }} /> */}
      </PieChart>
    </ResponsiveContainer>
  );
}
