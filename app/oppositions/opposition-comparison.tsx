"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { reviewOpposition } from "@/server/actions/oppositions";
import { ArrowRight, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/types/articles-schema";
import type { Opposition } from "@/types/oppositions-schema";
import { useSession } from "next-auth/react";

interface OppositionComparisonProps {
  article: Article;
  opposition: Opposition;
  onClose: () => void;
}

export function OppositionComparison({
  article,
  opposition,
  onClose,
}: OppositionComparisonProps) {
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("this is the article", article);
  article = article[0];

  const { data: session } = useSession();

  // Helper function to determine if a value has changed
  const hasChanged = (current: any, proposed: any) => {
    if (proposed === undefined || proposed === null) return false;
    return JSON.stringify(current) !== JSON.stringify(proposed);
  };

  // Format services for display
  const formatServices = (
    services: Array<{ id: string; label?: string }> | null | undefined
  ) => {
    if (!services || services.length === 0) return "None";
    return services.map((service) => service.label || service.id).join(", ");
  };
  console.log("opposition stattus", opposition.status);
  const handleDecision = async (decision: "approve" | "reject") => {
    if (isSubmitting) return; // Prevent double-clicks

    setIsSubmitting(true);

    try {
      // Debug: Log the opposition data
      console.log("Opposition data:", opposition);
      console.log(
        "Opposition ID:",
        opposition.id,
        "Type:",
        typeof opposition.id
      );

      // Debug: Get opposition info from database

      // Ensure opposition ID is a number
      const oppositionId = Number(opposition.id);

      if (isNaN(oppositionId)) {
        throw new Error("Invalid opposition ID");
      }

      console.log(
        `Submitting decision for opposition ${oppositionId}: ${decision}`
      );

      // Call the server action directly with explicit opposition ID
      const result = await reviewOpposition(
        oppositionId,
        decision,
        reviewNotes.trim()
      );

      console.log("Server action result:", result);

      if (result.success) {
        toast.success(result.message);
        onClose(); // Close the modal/component
      } else {
        toast.error(result.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Operation failed");
      console.error("Server action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug: Show opposition status
  useEffect(() => {
    console.log("Current opposition:", opposition);
    console.log("Opposition status:", opposition.status);
  }, [opposition]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Opposition Review</h2>
        <p className="text-sm text-muted-foreground">
          Compare current values with proposed changes for Article #{article.id}
        </p>
        <div className="mt-2">
          <Badge variant="secondary">Opposition ID: {opposition.id}</Badge>
          <Badge variant="outline" className="ml-2">
            Status: {opposition.status}
          </Badge>
        </div>
      </div>

      {/* Show warning if opposition is not pending */}
      {opposition.status !== "opposition_pending" && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            ⚠️ This opposition is already {opposition.status}. You cannot modify
            it.
          </p>
        </div>
      )}

      {/* Article ID and Opposition ID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium">Article ID:</span>
          <Badge variant="outline" className="ml-2">
            {article.id}
          </Badge>
        </div>
        <div>
          <span className="text-sm font-medium">Opposition ID:</span>
          <Badge variant="outline" className="ml-2">
            {opposition.id}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Values */}
        <Card className="border-muted">
          <CardContent className="pt-3 space-y-2">
            <div className="text-center mb-2">
              <h3 className="font-semibold text-lg">Current Values</h3>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Surface Couverte:</h4>
                <p className="text-base">
                  {article.surfaceCouverte == 0
                    ? "<<Non Bati>>"
                    : article.surfaceCouverte
                      ? `${article.surfaceCouverte} m²`
                      : "Not specified"}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Services:</h4>
                <p className="text-base">{formatServices(article.services)}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Autre Service:</h4>
                <p className="text-base">{article.autreService || "None"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposed Values */}
        <Card className="border-primary">
          <CardContent className="pt-3 space-y-2">
            <div className="text-center mb-2">
              <h3 className="font-semibold text-lg">Proposed Values</h3>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium">Surface Couverte:</h4>
                <p
                  className={`text-base ${
                    hasChanged(
                      article.surfaceCouverte,
                      opposition.proposedSurfaceCouverte
                    )
                      ? "text-primary font-medium"
                      : ""
                  }`}
                >
                  {opposition.proposedSurfaceCouverte == 0
                    ? "<<Non Bati>>"
                    : opposition.proposedSurfaceCouverte
                      ? `${opposition.proposedSurfaceCouverte} m²`
                      : "No change"}
                  {hasChanged(
                    article.surfaceCouverte,
                    opposition.proposedSurfaceCouverte
                  ) && (
                    <span className="inline-flex items-center ml-2 text-xs">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Changed
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Services:</h4>
                <p
                  className={`text-base ${
                    hasChanged(article.services, opposition.proposedServices)
                      ? "text-primary font-medium"
                      : ""
                  }`}
                >
                  {formatServices(opposition.proposedServices) || "No change"}
                  {hasChanged(
                    article.services,
                    opposition.proposedServices
                  ) && (
                    <span className="inline-flex items-center ml-2 text-xs">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Changed
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Autre Service:</h4>
                <p
                  className={`text-base ${
                    hasChanged(
                      article.autreService,
                      opposition.proposedAutreService
                    )
                      ? "text-primary font-medium"
                      : ""
                  }`}
                >
                  {opposition.proposedAutreService || "No change"}
                  {hasChanged(
                    article.autreService,
                    opposition.proposedAutreService
                  ) && (
                    <span className="inline-flex items-center ml-2 text-xs">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Changed
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reason for Opposition */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Reason for Opposition:</h3>
        <div className="p-3 bg-muted rounded-md text-sm">
          {opposition.reason}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex items-center gap-1"
          onClick={() => handleDecision("reject")}
          disabled={opposition.status != "opposition_pending" || isSubmitting}
        >
          <X className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "Reject Changes"}
        </Button>
        <Button
          variant="default"
          className="flex items-center gap-1"
          onClick={() => handleDecision("approve")}
          disabled={opposition.status != "opposition_pending" || isSubmitting}
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? "Processing..." : "Approve Changes"}
        </Button>
      </div>
    </div>
  );
}
