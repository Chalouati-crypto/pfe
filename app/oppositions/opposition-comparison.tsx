"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { reviewOpposition } from "@/server/actions/oppositions";
import { ArrowRight, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/types/articles-schema";
import type { Opposition } from "@/types/oppositions-schema";

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
  console.log("this is the article", article);
  article = article[0];
  const { execute, status } = useAction(reviewOpposition, {
    onSuccess({ data }) {
      if (data?.success) {
        toast.success(data.message || "Opposition reviewed successfully");
        onClose();
      } else if (data?.error) {
        toast.error(data.error);
      }
    },
    onError(error) {
      toast.error("Failed to review opposition");
      console.error(error);
    },
  });

  const handleApprove = () => {
    execute({
      oppositionId: opposition.id,
      approved: true,
      reviewNotes,
    });
  };

  const handleReject = () => {
    execute({
      oppositionId: opposition.id,
      approved: false,
      reviewNotes,
    });
  };

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

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Opposition Review</h2>
        <p className="text-sm text-muted-foreground">
          Compare current values with proposed changes for Article #{article.id}
        </p>
      </div>

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
          <CardContent className="pt-6 space-y-4">
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
          <CardContent className="pt-6 space-y-4">
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
                  {opposition.proposedSurfaceCouverte
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
        <Button
          variant="outline"
          onClick={onClose}
          disabled={status === "executing"}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleReject}
          disabled={status === "executing"}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Reject Changes
        </Button>
        <Button
          variant="default"
          onClick={handleApprove}
          disabled={status === "executing"}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          Approve Changes
        </Button>
      </div>
    </div>
  );
}
