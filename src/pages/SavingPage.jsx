import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { formatNPR } from '@/utils/formatCurrency';
import { DollarSign, TrendingUp, Calendar, AlertTriangle, CheckCircle2, ArrowDownRight, ArrowUpRight, Target, Plus } from 'lucide-react';
import { getCurrentUser } from "@/utils/useAuth";
import SetSavingsGoalModal from '@/components/SetSavingsGoalModal';

const SavingPage = () => {
    const user = getCurrentUser();
    const [monthlySavings, setMonthlySavings] = useState([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [averageSavings, setAverageSavings] = useState(0);
    const [savingsGoal, setSavingsGoal] = useState({
        hasGoal: false,
        initialGoal: 0,
        currentGoal: 0,
        currentSavings: 0,
        totalIncome: 0,
        totalExpenses: 0,
        progress: 0,
        status: "no_goal"
    });
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isGoalLoading, setIsGoalLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchInitialData();
        window.history.pushState(null, "", window.location.href);
        window.onpopstate = function () {
            window.history.go(1);
        };
        return () => {
            window.onpopstate = null;
        };
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchMonthlySavings(),
                fetchSavingsGoal()
            ]);
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMonthlySavings = async () => {
        setIsHistoryLoading(true);
        try {
            const res = await api.get("savings/monthly");
            setMonthlySavings(res.data);
            const total = res.data.reduce((sum, item) => sum + item.savedAmount, 0);
            setTotalSavings(total);
            setAverageSavings(res.data.length > 0 ? total / res.data.length : 0);
        } catch (err) {
            console.error("Failed to fetch monthly savings:", err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const fetchSavingsGoal = async () => {
        setIsGoalLoading(true);
        try {
            const res = await api.get("savings/goal");
            setSavingsGoal(res.data);
        } catch (err) {
            console.error("Failed to fetch savings goal:", err);
        } finally {
            setIsGoalLoading(false);
        }
    };

    const handleGoalSet = (newGoal) => {
        setSavingsGoal(prev => ({
            ...prev,
            hasGoal: true,
            initialGoal: newGoal.initialGoal,
            currentGoal: newGoal.initialGoal
        }));
        fetchSavingsGoal(); // Refresh the data
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return "bg-green-500";
        if (percentage >= 75) return "bg-green-400";
        if (percentage >= 50) return "bg-amber-500";
        if (percentage >= 25) return "bg-orange-500";
        return "bg-red-500";
    };

    const getProgressMessage = (percentage, status) => {
        if (status === "achieved" || percentage >= 100) {
            return {
                message: "Excellent! You've achieved your savings goal!",
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                color: "text-green-600"
            };
        } else if (status === "in_progress" || percentage >= 75) {
            return {
                message: "Great! You're making good progress toward your savings goal.",
                icon: <ArrowUpRight className="h-5 w-5 text-green-500" />,
                color: "text-green-600"
            };
        } else if (percentage >= 50) {
            return {
                message: "Good progress, but you're below your savings goal.",
                icon: <ArrowUpRight className="h-5 w-5 text-amber-500" />,
                color: "text-amber-500"
            };
        } else if (percentage >= 25) {
            return {
                message: "Warning: You're significantly below your savings goal.",
                icon: <ArrowDownRight className="h-5 w-5 text-orange-500" />,
                color: "text-orange-500"
            };
        } else {
            return {
                message: "Critical: You're far below your savings goal!",
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                color: "text-red-500"
            };
        }
    };

    const progress = savingsGoal.progress;
    const progressInfo = getProgressMessage(progress, savingsGoal.status);

    // Skeleton components for loading states
    const SkeletonCard = () => (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
            </CardContent>
        </Card>
    );

    const SkeletonTable = () => (
        <Card>
            <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    // Page-level loading
    if (isLoading) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Savings Overview</h1>
                </div>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Loading Savings Data...
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Fetching your savings information
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Savings Overview</h1>
                <Button
                    onClick={() => setIsGoalModalOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {savingsGoal.hasGoal ? 'Update Goal' : 'Set Goal'}
                </Button>
            </div>

            {/* Savings Goal Card */}
            {savingsGoal.hasGoal && (
                isGoalLoading ? (
                    <SkeletonCard />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Savings Goal Maintenance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Savings Goal</div>
                                        <div className="text-xl font-bold text-blue-600">
                                            {formatNPR(savingsGoal.initialGoal)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Current Savings</div>
                                        <div className="text-xl font-bold text-green-600">
                                            {formatNPR(savingsGoal.currentSavings)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500">Goal Status</div>
                                        <div className={`text-xl font-bold ${savingsGoal.status === "achieved" ? 'text-green-600' :
                                            savingsGoal.status === "in_progress" ? 'text-blue-600' :
                                                'text-orange-600'
                                            }`}>
                                            {savingsGoal.status === "achieved" ? 'Achieved' :
                                                savingsGoal.status === "in_progress" ? 'In Progress' :
                                                    'Below Goal'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Goal Maintenance</span>
                                        <span className="font-medium">
                                            {progress}% maintained
                                        </span>
                                    </div>
                                    <div className="h-2 w-full rounded bg-gray-200 mb-1">
                                        <div
                                            className={`h-2 rounded ${getProgressColor(progress)} transition-all duration-500`}
                                            style={{ width: `${Math.max(0, progress)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm mt-1">
                                        {progressInfo.icon}
                                        <span className={progressInfo.color}>
                                            {progressInfo.message}
                                        </span>
                                    </div>
                                </div>

                                {savingsGoal.status === "achieved" && (
                                    <div className="text-sm text-green-600 mt-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Excellent! You've achieved your savings goal of {formatNPR(savingsGoal.initialGoal)}
                                    </div>
                                )}

                                {savingsGoal.status === "in_progress" && (
                                    <div className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                                        <ArrowUpRight className="h-4 w-4" />
                                        Good progress! You've saved {formatNPR(savingsGoal.currentSavings)} out of your {formatNPR(savingsGoal.initialGoal)} goal
                                    </div>
                                )}

                                {savingsGoal.status === "below_goal" && savingsGoal.currentSavings > 0 && (
                                    <div className="text-sm text-orange-500 mt-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Your current savings of {formatNPR(savingsGoal.currentSavings)} is below your goal of {formatNPR(savingsGoal.initialGoal)}
                                    </div>
                                )}

                                {savingsGoal.status === "below_goal" && savingsGoal.currentSavings <= 0 && (
                                    <div className="text-sm text-red-500 mt-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Your current balance is negative. Consider reducing expenses to reach your savings goal.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            )}

            {/* Set Goal Card (if no goal is set) */}
            {!savingsGoal.hasGoal && (
                isGoalLoading ? (
                    <SkeletonCard />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Set Your Savings Goal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-4">
                                <p className="text-gray-600">
                                    Set a monthly savings goal. The progress bar will show 100% when your balance meets or exceeds the goal,
                                    and decrease as your balance drops below the goal due to expenses.
                                </p>
                                <Button
                                    onClick={() => setIsGoalModalOpen(true)}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="h-4 w-4" />
                                    Set Savings Goal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            )}

            {/* Monthly Savings History */}
            {isHistoryLoading ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Savings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-60">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Loading savings history...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Savings History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4">Month</th>
                                        <th className="text-right py-3 px-4">Amount</th>
                                        <th className="text-right py-3 px-4">Goal</th>
                                        <th className="text-center py-3 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlySavings.map((saving) => (
                                        <tr key={saving.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="py-3 px-4">
                                                {format(new Date(saving.month), 'MMMM yyyy')}
                                            </td>
                                            <td className="text-right py-3 px-4 font-medium text-green-600">
                                                {formatNPR(saving.savedAmount)}
                                            </td>
                                            <td className="text-right py-3 px-4 font-medium text-blue-600">
                                                {formatNPR(saving.savingGoal)}
                                            </td>
                                            <td className="text-center py-3 px-4">
                                                {saving.status === "achieved" && <span className="text-green-600 font-bold bg-green-100 rounded px-2 py-1">Achieved</span>}
                                                {saving.status === "in_progress" && <span className="text-green-600 font-bold bg-green-100 rounded px-2 py-1">In Progress</span>}
                                                {saving.status === "not_achieved" && <span className="text-red-500 font-bold bg-red-100 rounded px-2 py-1">Not Achieved</span>}
                                                {saving.status === "pending" && <span className="text-gray-500 font-bold bg-gray-100 rounded px-2 py-1">Pending</span>}
                                            </td>
                                        </tr>
                                    ))}
                                    {monthlySavings.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-gray-500">
                                                No savings history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Set Savings Goal Modal */}
            <SetSavingsGoalModal
                isOpen={isGoalModalOpen}
                onClose={() => setIsGoalModalOpen(false)}
                onGoalSet={handleGoalSet}
                currentGoal={savingsGoal.initialGoal}
            />
        </div>
    );
};

export default SavingPage;
