import { Link, Users, Tag, Calendar } from "lucide-react";
import type { GeneralAdvertisement } from "../advertisement.types";
import Modal from "../../../components/common/Modal";

interface AdvertisementDetailsModalProps {
    advertisement: GeneralAdvertisement | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function AdvertisementDetailsModal({
    advertisement,
    isOpen,
    onClose,
}: AdvertisementDetailsModalProps) {
    if (!advertisement) return null;

    const InfoRow = ({
        icon: Icon,
        label,
        value,
        isLink,
    }: {
        icon: React.ElementType;
        label: string;
        value: string | undefined;
        isLink?: boolean;
    }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                    {isLink ? (
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline break-all"
                        >
                            {value}
                        </a>
                    ) : (
                        <div className="text-sm text-gray-900">{value}</div>
                    )}
                </div>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const statusStyle =
        advertisement.status === "enabled"
            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
            : "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Advertisement Details" size="lg">
            <div className="space-y-4">
                {/* Header with Image & Title */}
                <div className="flex items-start gap-3">
                    <img
                        src={advertisement.image}
                        alt={advertisement.title}
                        className="w-24 h-16 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/96x64?text=Ad";
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-gray-900 break-words">
                                {advertisement.title}
                            </h3>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${statusStyle}`}
                            >
                                {advertisement.status.charAt(0).toUpperCase() +
                                    advertisement.status.slice(1)}
                            </span>
                        </div>
                        <span
                            className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${advertisement.target_user === "doctor"
                                ? "bg-purple-100 text-purple-700 border border-purple-200"
                                : "bg-cyan-100 text-cyan-700 border border-cyan-200"
                                }`}
                        >
                            {advertisement.target_user === "doctor" ? "Doctor" : "Patient"}
                        </span>
                    </div>
                </div>

                {/* Information */}
                <div className="border-t border-gray-200 pt-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Information</h4>
                    <div className="space-y-1">
                        <InfoRow icon={Link} label="URL" value={advertisement.url} isLink />
                        <InfoRow
                            icon={Users}
                            label="Target User"
                            value={
                                advertisement.target_user === "doctor" ? "Doctor" : "Patient"
                            }
                        />
                    </div>
                </div>

                {/* Specializations */}
                {advertisement.specializations && advertisement.specializations.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1.5">
                            {advertisement.specializations.map((specialty) => (
                                <span
                                    key={specialty}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                                >
                                    <Tag className="w-3 h-3" />
                                    {specialty}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                {(advertisement.createdAt || advertisement.updatedAt) && (
                    <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Timeline</h4>
                        <div className="space-y-1">
                            {advertisement.createdAt && (
                                <InfoRow
                                    icon={Calendar}
                                    label="Created"
                                    value={formatDate(advertisement.createdAt)}
                                />
                            )}
                            {advertisement.updatedAt && (
                                <InfoRow
                                    icon={Calendar}
                                    label="Last Updated"
                                    value={formatDate(advertisement.updatedAt)}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}
