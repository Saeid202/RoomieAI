
import { MapPin } from "lucide-react";

export default function ServiceArea() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-slate-600" />
                <h1 className="text-3xl font-bold">Service Area</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <p>Define the cities and radius you cover.</p>
            </div>
        </div>
    );
}
