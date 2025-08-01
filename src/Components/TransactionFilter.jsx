import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import api from "@/api/axios";

export function TransactionFilters({ onFilterChange }) {
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [account, setAccount] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    setIsLoading(true);
    try {
      // Fetch categories from API
      const categoriesRes = await api.get("categories");
      const userCategories = categoriesRes.data || [];

      // Fetch all transactions to get unique categories and accounts
      const transactionsRes = await api.get("transactions");
      const transactions = transactionsRes.data || [];

      // Extract unique categories from transactions
      const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(Boolean))];

      // Combine user categories with transaction categories
      const allCategories = [...new Set([...userCategories, ...uniqueCategories])];

      // Extract unique accounts from transactions
      const uniqueAccounts = [...new Set(transactions.map(t => t.account).filter(Boolean))];

      setCategories(allCategories);
      setAccounts(uniqueAccounts);
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
      // Fallback to default categories
      setCategories([
        "Food & Dining",
        "Transportation",
        "Entertainment",
        "Healthcare",
        "Shopping",
        "Education",
        "Utilities",
        "Groceries"
      ]);
      setAccounts(["Cash", "Card", "Bank Transfer"]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    onFilterChange({
      type,
      category,
      account,
      startDate,
      endDate,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-8"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Transactions</SheetTitle>
              <SheetDescription>
                Narrow down transactions by applying filters
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <Label>Date Range</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Account</Label>
              <Select value={account} onValueChange={setAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc} value={acc}>
                      {acc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="button" onClick={applyFilters}>
                  Apply Filters
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
