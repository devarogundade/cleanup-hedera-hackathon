import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpCircle, Filter, ChevronLeft, ChevronRight, TrendingUp, ChevronDown } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRecentTransactions } from "@/hooks/useTransactions";
import { TableLoadingState } from "./LoadingState";
const TransactionHistory = () => {
  const {
    playSound
  } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "donation" | "withdrawal">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const {
    data: allTransactions = [],
    isLoading
  } = useRecentTransactions(50);
  const filteredTransactions = allTransactions.filter(tx => filter === "all" || tx.type === filter);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  const handleFilterChange = (newFilter: "all" | "donation" | "withdrawal") => {
    playSound("click");
    setFilter(newFilter);
    setCurrentPage(1);
    toast({
      title: "Filter applied",
      description: `Showing ${newFilter === "all" ? "all transactions" : newFilter === "donation" ? "donations only" : "withdrawals only"}`
    });
  };
  const handlePageChange = (page: number) => {
    playSound("click");
    setCurrentPage(page);
  };
  return <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="transaction-history border-0 p-3 sm:p-4 md:p-6 transition-all">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 border border-primary/30 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
                Transaction History
              </h3>
            </div>
            <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex items-center gap-2 my-3 sm:my-4">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <div className="flex gap-1 flex-wrap">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("all")} className={`text-xs sm:text-sm ${filter === "all" ? "bg-primary" : "hover:bg-muted/50 transition-all"}`}>
                All
              </Button>
              <Button variant={filter === "donation" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("donation")} className={`text-xs sm:text-sm ${filter === "donation" ? "bg-primary" : "hover:bg-muted/50 transition-all"}`}>
                Donations
              </Button>
              <Button variant={filter === "withdrawal" ? "default" : "outline"} size="sm" onClick={() => handleFilterChange("withdrawal")} className={`text-xs sm:text-sm ${filter === "withdrawal" ? "bg-primary" : "hover:bg-muted/50 transition-all"}`}>
                Withdrawals
              </Button>
            </div>
          </div>

          {isLoading ? <TableLoadingState rows={itemsPerPage} /> : paginatedTransactions.length === 0 ? <div className="py-12 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  No transactions yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Transaction history will appear here once donations are made
                </p>
              </div>
            </div> : <>
              <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs sm:text-sm">User</TableHead>
                      <TableHead className="text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="hidden md:table-cell text-xs sm:text-sm">
                        Message
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="hidden lg:table-cell text-xs sm:text-sm">
                        Transaction
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map(tx => <TableRow key={tx.id} className="border-border hover:bg-muted/30 transition-colors cursor-pointer">
                        <TableCell className="py-2 sm:py-3">
                          <div className="flex items-center gap-2">
                            
                            <span className="text-xs sm:text-sm font-mono truncate max-w-[100px] sm:max-w-[150px]">
                              {tx.userId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            {tx.type === "donation" ? <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> : <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />}
                            <span className="font-medium text-xs sm:text-sm capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 sm:py-3">
                          <span className={`font-semibold text-xs sm:text-sm ${tx.type === "donation" ? "text-primary" : "text-accent"}`}>
                            {tx.type === "donation" ? "+" : "-"}
                            {tx.amount} {tx.currency}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs sm:text-sm py-2 sm:py-3">
                          {tx.message || "No message"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm py-2 sm:py-3">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-2 sm:py-3">
                          <a href={`https://hashscan.io/mainnet/transaction/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-glow transition-smooth underline text-xs sm:text-sm">
                            {tx.transactionHash.slice(0, 8)}...
                          </a>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!isLoading && paginatedTransactions.length > 0 && <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 border-t pt-3">
            <p className="text-xs text-muted-foreground">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}{" "}
              of {filteredTransactions.length}
            </p>
            <div className="flex flex-wrap gap-1">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="hover:bg-muted/50 transition-all h-8 w-8 p-0">
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              {Array.from({
                length: totalPages
              }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className={`h-8 w-8 p-0 text-xs sm:text-sm ${currentPage === page ? "bg-primary" : "hover:bg-muted/50 transition-all"}`}>
                    {page}
                  </Button>)}
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="hover:bg-muted/50 transition-all h-8 w-8 p-0">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
                </div>
              </div>}
            </>}
        </CollapsibleContent>
      </Card>
    </Collapsible>;
};
export default TransactionHistory;