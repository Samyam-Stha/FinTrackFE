import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Plus,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import { getCurrentUser } from "../../utils/useAuth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import AddTransactionModal from "@/components/dashboard/AddTransactionModal";
import Overview from "@/components/dashboard/Overview";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import ExpensePieChart from "@/components/dashboard/ExpensePieChart";
import { format } from "date-fns";

const Dashboard = () => {
  const user = getCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [savingRate, setSavingRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // Cache management
  const getCachedData = () => {
    const cached = localStorage.getItem('dashboardCache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache is valid for 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
    return null;
  };

  const setCachedData = (data) => {
    localStorage.setItem('dashboardCache', JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const updateDashboardStats = (txs) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter transactions for current month
    const currentMonthTransactions = txs.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyExpense = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyBalance = monthlyIncome - monthlyExpense;
    const savingsRate =
      monthlyIncome === 0
        ? 0
        : ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;

    const processedData = {
      income: monthlyIncome.toFixed(2),
      expense: monthlyExpense.toFixed(2),
      balance: monthlyBalance.toFixed(2),
      savingRate: savingsRate.toFixed(2)
    };

    setIncome(processedData.income);
    setExpense(processedData.expense);
    setBalance(processedData.balance);
    setSavingRate(processedData.savingRate);

    return processedData;
  };

  const fetchTransactions = async () => {
    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !isInitialLoad) {
      setTransactions(cachedData.transactions);
      setIncome(cachedData.income);
      setExpense(cachedData.expense);
      setBalance(cachedData.balance);
      setSavingRate(cachedData.savingRate);
      return;
    }

    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      const res = await api.get("transactions");
      const txs = res.data;
      setTransactions(txs);
      const processedData = updateDashboardStats(txs);

      // Cache the processed data
      const cacheData = {
        transactions: txs,
        ...processedData
      };
      setCachedData(cacheData);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const refreshData = () => {
    // Clear cache and refetch
    localStorage.removeItem('dashboardCache');
    setIsLoading(true);
    fetchTransactions();
  };

  // Comprehensive refresh function for when transaction is added
  const handleTransactionAdded = async () => {
    // Clear cache
    localStorage.removeItem('dashboardCache');

    // Refetch all data
    await fetchTransactions();

    // Force refresh of child components by updating their keys
    setShowModal(false);
  };

  const getSavingRateColor = (rate) => {
    rate = parseFloat(rate);
    if (rate >= 50) return "text-green-600";
    if (rate >= 20) return "text-yellow-500";
    return "text-red-500";
  };

  // Skeleton loading component for cards
  const SkeletonCard = () => (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
      </CardContent>
    </Card>
  );

  // Show initial loading screen only on first load
  if (isInitialLoad && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Dashboard...
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fetching your financial data
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {capitalizeFirst(user?.name || user?.email)}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rs. {balance}</div>
                <p className="text-xs text-muted-foreground">
                  This month's net balance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  Rs. {income}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's total income
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium ">Expenses</CardTitle>
                <CreditCard className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">Rs. {expense}</div>
                <p className="text-xs text-muted-foreground">
                  This month's total expense
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
                <PieChart className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getSavingRateColor(savingRate)}`}
                >
                  {savingRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Savings rate this month
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions
              key={`recent-transactions-${transactions.length}`}
              transactions={transactions}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart
              key={`expense-chart-${transactions.length}`}
              isDark={document.documentElement.classList.contains("dark")}
              interval="monthly"
            />
          </CardContent>
        </Card>
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>
            Your monthly category-wise breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetProgress />
        </CardContent>
      </Card> */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Income vs Expense (Monthly)</CardDescription>
        </CardHeader>
        <CardContent>
          <Overview
            key={`overview-chart-${transactions.length}`}
            isDark={document.documentElement.classList.contains("dark")}
            interval="monthly"
            chartType="Bar Chart"
          />
        </CardContent>
      </Card>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={handleTransactionAdded}
        />
      )}
    </div>
  );
};

export default Dashboard;
