import { Settings, Bell, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function RenovatorSettings() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl">
                    <Settings className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500">Manage your notification preferences and account settings</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4 text-violet-600" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Control how you receive alerts and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                            <Label className="font-medium text-slate-800">Emergency Job Alerts</Label>
                            <p className="text-xs text-slate-500 mt-0.5">Get notified instantly for urgent repair requests</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-violet-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div>
                            <Label className="font-medium text-slate-800">Job Status Updates</Label>
                            <p className="text-xs text-slate-500 mt-0.5">Notifications when job status changes</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-violet-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <Label className="font-medium text-slate-800">Message Notifications</Label>
                            <p className="text-xs text-slate-500 mt-0.5">Alerts for new messages from landlords</p>
                        </div>
                        <Switch className="data-[state=checked]:bg-violet-600" defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-violet-600" />
                        Account
                    </CardTitle>
                    <CardDescription>Security and account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-400 italic">More account settings coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
}
