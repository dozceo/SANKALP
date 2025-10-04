import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, appearance, and data preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="revision-reminders">Revision Reminders</Label>
                    <p className="text-xs text-muted-foreground">Daily prompts for your planner tasks.</p>
                </div>
              <Switch id="revision-reminders" defaultChecked />
            </div>
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="achievement-alerts">Achievement Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when you earn a badge.</p>
                </div>
              <Switch id="achievement-alerts" defaultChecked/>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Data &amp; Sync</CardTitle>
                <CardDescription>Manage offline access and data exports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="offline-mode">Offline-First Mode</Label>
                        <p className="text-xs text-muted-foreground">Cache the next 3-5 days of revision content for offline access.</p>
                    </div>
                    <Switch id="offline-mode" />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Analytics Export</Label>
                         <p className="text-xs text-muted-foreground">Download your progress reports in CSV format.</p>
                    </div>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export My Data
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
