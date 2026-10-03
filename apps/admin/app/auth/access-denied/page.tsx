"use client";

import { ShieldX } from "lucide-react";
import Link from "next/link";
import { AdminAuthCard, AdminAuthLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <AdminAuthLayout maxWidth="md">
      <AdminAuthCard
        showBrand
        title="Access denied"
        description="You do not have permission to access this page. If you believe this is an error, please contact support."
        headerMedia={
          <div className="flex size-14 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <ShieldX className="size-7 text-destructive" />
          </div>
        }
        footer={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              data-umami-event="auth:access-denied-go-back"
            >
              Go back
            </Button>
            <Button asChild variant="outline">
              <Link href="/" data-umami-event="auth:access-denied-dashboard">
                Back to dashboard
              </Link>
            </Button>
          </div>
        }
      />
    </AdminAuthLayout>
  );
}
