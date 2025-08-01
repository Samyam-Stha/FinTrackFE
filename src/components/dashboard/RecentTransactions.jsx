import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export function RecentTransactions({ transactions = [] }) {
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort transactions for current month
  const currentMonthTransactions = transactions
    .filter((t) => {
      const txDate = new Date(t.date);
      const now = new Date();
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ); // sort by latest

  // Show loading state if no transactions provided
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading recent transactions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentMonthTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">
                {format(new Date(transaction.date), "d MMMM yyyy")}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell
                className={`text-right ${transaction.type === "expense"
                  ? "text-red-500"
                  : transaction.type === "income"
                    ? "text-green-500"
                    : ""
                  }`}
              >
                Rs. {Number(transaction.amount).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
