import { X, Lightbulb, Zap, Info } from "lucide-react";

export interface HelpContent {
    name: string;
    description: string;
    features: string[];
    actions: string[];
    tips: string[];
}

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: HelpContent;
}

export default function HelpModal({ isOpen, onClose, content }: HelpModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-lg transform bg-white rounded-xl shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Info className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold !text-white">{content.name} Help</h2>
                                <p className="text-sm text-gray-300">Quick guide for this page</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                        {/* Description */}
                        <div>
                            <p className="text-gray-700 leading-relaxed">{content.description}</p>
                        </div>

                        {/* Key Features */}
                        {content.features.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Key Features</h3>
                                </div>
                                <ul className="space-y-2">
                                    {content.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Available Actions */}
                        {content.actions.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-4 h-4 text-emerald-600" />
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Actions You Can Take</h3>
                                </div>
                                <ul className="space-y-2">
                                    {content.actions.map((action, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                            <span className="text-sm text-gray-700">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tips */}
                        {content.tips.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Tips</h3>
                                </div>
                                <ul className="space-y-1">
                                    {content.tips.map((tip, index) => (
                                        <li key={index} className="text-sm text-amber-800">• {tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
