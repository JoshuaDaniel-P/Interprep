import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account and interview preferences.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-brand-600" />
              Preferences & Account
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">
              Account settings and options placeholder.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
