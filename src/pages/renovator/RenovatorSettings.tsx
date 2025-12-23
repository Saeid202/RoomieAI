
import { Settings } from "lucide-react";

export default function RenovatorSettings() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-slate-600" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <p>Notification preferences and account settings.</p>
            </div>
        </div>
    );
}
