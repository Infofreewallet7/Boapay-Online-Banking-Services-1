import { CalendarClock, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { type Bill } from "@shared/schema";

interface BillPaymentListProps {
  bills: Bill[];
}

export default function BillPaymentList({ bills }: BillPaymentListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No bills found</p>
      </div>
    );
  }
  
  // Sort bills by due date (closest first)
  const sortedBills = [...bills].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Helper function to calculate days until due
  const getDaysUntilDue = (dueDate: Date | null | undefined) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <div className="divide-y">
      {sortedBills.map((bill) => {
        const daysUntilDue = bill.dueDate ? getDaysUntilDue(bill.dueDate) : null;
        const isPastDue = daysUntilDue !== null && daysUntilDue < 0;
        const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;
        
        return (
          <div key={bill.id} className="py-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{bill.billName}</h4>
                <p className="text-xs text-gray-500 mt-1 capitalize">{bill.billCategory}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatCurrency(bill.paymentAmount)}</p>
                {bill.dueDate && (
                  <div className="flex items-center mt-1 gap-1">
                    <CalendarClock className="h-3 w-3 text-gray-400" />
                    <p className={`text-xs ${
                      isPastDue ? 'text-red-600 font-medium' : 
                      isDueSoon ? 'text-amber-600 font-medium' : 
                      'text-gray-500'
                    }`}>
                      {isPastDue 
                        ? `Overdue by ${Math.abs(daysUntilDue)} days` 
                        : daysUntilDue === 0 
                          ? 'Due today'
                          : daysUntilDue === 1 
                            ? 'Due tomorrow'
                            : `Due in ${daysUntilDue} days`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="mt-2 flex items-center gap-1">
              {bill.status === 'paid' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Paid</span>
                </>
              ) : isPastDue ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">Overdue</span>
                </>
              ) : isDueSoon ? (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-600 font-medium">Due Soon</span>
                </>
              ) : (
                <>
                  <CalendarClock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Upcoming</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
