import { Video } from "lucide-react";

export default function VideosView() {
    return (
        <div className="space-y-6 min-w-0 max-w-full">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Videos</h1>
                <p className="text-gray-500">This section is under development.</p>
            </div>
        </div>
    );
}
