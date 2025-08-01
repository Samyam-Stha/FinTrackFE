import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import TransactionsPage from "./pages/TransactionPage";
import BudgetPage from "./pages/BudgetPage";
import { Sidebar } from "@/components/Sidebar"
// import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import SavingPage from "./pages/SavingPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time for app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Clear any cached data
    localStorage.removeItem("dashboardCache");

    // Force a hard redirect to clear any cached state
    window.location.replace("/");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "transactions":
        return <TransactionsPage />;
      case "budget":
        return <BudgetPage />;
      case "savings":
        return <SavingPage />;
      // case "reports":
      //   return <ReportPage />;
      case "analytics":
        return <AnalyticsPage setCurrentPage={setCurrentPage} />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <div>
            <h2 className="text-xl font-semibold">Welcome!</h2>
            <p>Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  // Show loading screen while app is initializing
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Loading Fintrack...
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please wait while we prepare your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar in normal flow */}
      <div className="w-64 border-r bg-white dark:bg-gray-900 dark:border-gray-800">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
      {/* Main content takes remaining width */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="flex justify-end mb-4">

        </div>
        {renderPage()}
      </div>
    </div>
  );
}
