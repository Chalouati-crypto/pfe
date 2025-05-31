"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAction } from "next-safe-action/hooks";
import { getPaymentStatus } from "@/server/actions/payments";
import { createPayment } from "@/server/actions/payments";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Loader2, Receipt } from "lucide-react";
import type { YearPaymentStatus } from "@/types/payments-schema";
import type { Article } from "@/types/articles-schema";

interface PaymentManagerProps {
  article: Article;
  onClose: () => void;
}

export function PaymentManager({ article, onClose }: PaymentManagerProps) {
  const [yearlyStatus, setYearlyStatus] = useState<YearPaymentStatus[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [receiptInfo, setReceiptInfo] = useState<{
    number: string;
    amount: number;
    years: number[];
  } | null>(null);

  // Get payment status
  const { execute: fetchStatus } = useAction(getPaymentStatus, {
    onExecute() {
      setIsLoading(true);
    },
    onSuccess({ data }) {
      if (data?.success && data.yearlyPaymentStatus) {
        setYearlyStatus(data.yearlyPaymentStatus);
      } else if (data?.error) {
        toast.error(data.error);
      }
      setIsLoading(false);
    },
    onError(error) {
      toast.error("Failed to load payment status");
      console.error(error);
      setIsLoading(false);
    },
  });

  // Create payment
  const { execute: submitPayment, status: paymentStatus } = useAction(
    createPayment,
    {
      onSuccess({ data }) {
        if (data?.success) {
          toast.success("Payment processed successfully");
          // Show receipt info
          setReceiptInfo({
            number: data.receiptNumber!,
            amount: data.totalAmount!,
            years: data.yearsPaid!,
          });
          // Refresh payment status
          fetchStatus({ articleId: article.id });
          // Clear selection
          setSelectedYears([]);
        } else if (data?.error) {
          toast.error(data.error);
        }
      },
      onError(error) {
        toast.error("Failed to process payment");
        console.error(error);
      },
    }
  );

  // Load payment status on mount
  useEffect(() => {
    fetchStatus({ articleId: article.id });
  }, [article.id]);

  // Calculate total amount due for selected years
  const calculateTotal = () => {
    if (!yearlyStatus.length) return 0;
    const taxAmount = yearlyStatus[0].amount;
    return selectedYears.length * taxAmount;
  };

  // Handle year selection
  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // Select all unpaid years
  const selectAllUnpaid = () => {
    const unpaidYears = yearlyStatus
      .filter((y) => !y.isPaid)
      .map((y) => y.year);
    setSelectedYears(unpaidYears);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedYears([]);
  };

  // Process payment
  const handlePayment = () => {
    if (selectedYears.length === 0) {
      toast.error("Please select at least one year to pay");
      return;
    }

    submitPayment({
      articleId: article.id,
      years: selectedYears,
      paymentMethod: paymentMethod as any,
      notes,
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          Loading payment information...
        </p>
      </div>
    );
  }

  // If we're showing a receipt
  if (receiptInfo) {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-6 rounded-lg text-center space-y-4">
          <div className="flex justify-center">
            <Receipt className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Payment Successful</h2>
          <p className="text-muted-foreground">Receipt #{receiptInfo.number}</p>
          <div className="text-2xl font-bold">
            {formatCurrency(receiptInfo.amount)}
          </div>
          <p className="text-sm text-muted-foreground">
            Paid for years: {receiptInfo.years.sort().join(", ")}
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => setReceiptInfo(null)}>
            Make Another Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Payment History</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Property tax payments for Article #{article.id}
        </p>

        <div className="flex justify-between mb-4">
          <Button variant="outline" size="sm" onClick={selectAllUnpaid}>
            Select All Unpaid
          </Button>
          <Button variant="ghost" size="sm" onClick={clearSelection}>
            Clear Selection
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
          {yearlyStatus.map((yearStatus) => (
            <Card
              small={"true"}
              key={yearStatus.year}
              className={yearStatus.isPaid ? "bg-muted/50" : ""}
            >
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {yearStatus.isPaid ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Checkbox
                      checked={selectedYears.includes(yearStatus.year)}
                      onCheckedChange={() => toggleYear(yearStatus.year)}
                      disabled={yearStatus.isPaid}
                    />
                  )}
                  <div>
                    <div className="font-medium">{yearStatus.year}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(yearStatus.amount)}
                    </div>
                  </div>
                </div>
                {yearStatus.isPaid ? (
                  <Badge variant="outline" className="bg-green-50">
                    Paid{" "}
                    {yearStatus.paymentDate &&
                      format(new Date(yearStatus.paymentDate), "dd MMM yyyy", {
                        locale: fr,
                      })}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50">
                    Unpaid
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {selectedYears.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Payment Details</h3>
            <div className="bg-muted p-3 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Selected Years:</span>
                <span>{selectedYears.sort().join(", ")}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Due:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={paymentStatus === "executing"}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={
                selectedYears.length === 0 || paymentStatus === "executing"
              }
              className={paymentStatus === "executing" ? "animate-pulse" : ""}
            >
              {paymentStatus === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(calculateTotal())}`
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
