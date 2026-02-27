import { useState, useEffect, useRef } from "react";
import { X, Search, ChevronDown, AlertCircle } from "lucide-react";
import type { Video as VideoType, CreateVideoDTO } from "../videos.types";
import { SPECIALTIES } from "../../../Advertisements/advertisement.types";
import * as doctorService from "../../../../services/doctor.service";
import type { DoctorUser } from "../../../doctors/doctor.types";
import Modal from "../../../../components/common/Modal";

interface AddEditVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateVideoDTO) => Promise<void>;
    video: VideoType | null;
}

interface VideoFormData {
    title: string; description: string; Institution: string;
    speciality: string; allow_download: boolean;
    video_file: File | null; thumbnail: File | null;
}

const initialFormData: VideoFormData = {
    title: "", description: "", Institution: "", speciality: "",
    allow_download: true, video_file: null, thumbnail: null,
};

export default function AddEditVideoModal({ isOpen, onClose, onSubmit, video }: AddEditVideoModalProps) {
    const isEditMode = !!video;
    const [formData, setFormData] = useState<VideoFormData>(initialFormData);
    const [selectedUser, setSelectedUser] = useState<DoctorUser | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userResults, setUserResults] = useState<DoctorUser[]>([]);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [userSearchLoading, setUserSearchLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const userDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `.custom-scrollbar::-webkit-scrollbar{width:6px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}`;
        document.head.appendChild(style);
        return () => { document.head.removeChild(style); };
    }, []);

    useEffect(() => {
        if (!userSearchTerm.trim()) { setUserResults([]); return; }
        const timer = setTimeout(async () => {
            try { setUserSearchLoading(true); const r = await doctorService.getDoctors({ search: userSearchTerm, page_size: 10 }); setUserResults(r.data.results); } catch (e) { console.error(e); } finally { setUserSearchLoading(false); }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearchTerm]);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) setIsUserDropdownOpen(false); };
        if (isUserDropdownOpen) { document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }
    }, [isUserDropdownOpen]);

    useEffect(() => {
        if (isOpen) {
            if (video) {
                setFormData({ title: video.title, description: video.description || "", Institution: video.Institution || "", speciality: video.speciality || "", allow_download: video.allow_download, video_file: null, thumbnail: null });
                setSelectedUser(null); setUserSearchTerm("");
            } else { setFormData(initialFormData); setSelectedUser(null); setUserSearchTerm(""); }
            setErrors({});
        }
    }, [isOpen, video]);

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        if (!isEditMode && !selectedUser) e.user_id = "Please select a doctor user";
        if (!formData.title.trim()) e.title = "Title is required";
        if (!formData.description.trim()) e.description = "Description is required";
        if (!formData.speciality) e.speciality = "Specialty is required";
        if (!isEditMode && !formData.video_file) e.video_file = "Video file is required";
        setErrors(e); return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!isEditMode && !selectedUser) return;
        try {
            setIsSubmitting(true);
            const submitData: CreateVideoDTO = { user_id: isEditMode ? video!.id : selectedUser!.id, title: formData.title, description: formData.description, Institution: formData.Institution, speciality: formData.speciality, video_file: formData.video_file!, allow_download: formData.allow_download };
            if (formData.thumbnail) submitData.thumbnail = formData.thumbnail;
            await onSubmit(submitData); onClose();
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    if (!isOpen) return null;

    const iS = (err?: boolean) => ({ background: "#fff", border: err ? "1px solid #ef4444" : "1px solid #e5e7eb", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.05)" });
    const secS = { background: "#f8f9fb", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.6)" };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Video" : "Add Video"}>
            <div className="flex flex-col h-full">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all z-10 active:scale-95" style={{ background: "#f8f9fb", boxShadow: "2px 2px 4px rgba(0,0,0,0.06), -2px -2px 4px rgba(255,255,255,0.6)" }}>
                    <X className="w-5 h-5 text-gray-600" />
                </button>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar" style={{ maxHeight: 'calc(80vh - 140px)', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                        <div className="rounded-xl px-5 py-4" style={secS}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Basic Information</h3>
                            {!isEditMode && (
                                <div ref={userDropdownRef} className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor User *</label>
                                    {selectedUser ? (
                                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ ...iS(), background: "#f8f9fb" }}>
                                            <div><div className="font-medium text-gray-900 text-sm">{selectedUser.full_name}</div><div className="text-xs text-gray-500">{selectedUser.email}</div></div>
                                            <button onClick={() => { setSelectedUser(null); setUserSearchTerm(""); }} className="p-1 rounded text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <button type="button" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="w-full px-4 py-2.5 text-sm rounded-xl text-left flex items-center justify-between" style={iS(!!errors.user_id)}>
                                                <span className="text-gray-400">Search and select a doctor...</span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>
                                            {isUserDropdownOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 10px 25px rgba(0,0,0,0.15)", border: "1px solid #e5e7eb" }}>
                                                    <div className="p-3 border-b border-gray-100"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" className="w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" style={{ background: "#f8f9fb", border: "1px solid #e5e7eb" }} placeholder="Search..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} autoFocus /></div></div>
                                                    <div className="max-h-44 overflow-y-auto">
                                                        {userSearchLoading ? <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div> : userResults.length > 0 ? userResults.map((d) => (
                                                            <div key={d.id} className="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50" onClick={() => { setSelectedUser(d); setIsUserDropdownOpen(false); setUserSearchTerm(""); }}>
                                                                <div className="font-medium text-gray-900">{d.full_name}</div><div className="text-xs text-gray-500">{d.email}</div>
                                                            </div>
                                                        )) : <div className="px-4 py-8 text-sm text-gray-400 text-center">Type to search</div>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {errors.user_id && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.user_id}</p>}
                                </div>
                            )}
                            {isEditMode && <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Uploaded By</label><div className="px-4 py-2.5 text-sm rounded-xl text-gray-700" style={{ ...iS(), background: "#f8f9fb" }}>{video!.uploaded_by}</div></div>}
                            <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none" style={iS(!!errors.title)} placeholder="Enter video title" />{errors.title && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.title}</p>}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Institution</label><input type="text" value={formData.Institution} onChange={(e) => setFormData({ ...formData, Institution: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none" style={iS()} placeholder="Institution" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label><select value={formData.speciality} onChange={(e) => setFormData({ ...formData, speciality: e.target.value })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none" style={iS(!!errors.speciality)}><option value="">Select specialty</option>{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}</select>{errors.speciality && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.speciality}</p>}</div>
                            </div>
                        </div>

                        <div className="rounded-xl px-5 py-4" style={secS}>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Content</h3>
                            <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Description *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none resize-none" style={iS(!!errors.description)} placeholder="Enter description" />{errors.description && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}</div>
                            {!isEditMode && (
                                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label><input type="file" accept="video/*" onChange={(e) => setFormData({ ...formData, video_file: e.target.files?.[0] || null })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none" style={iS(!!errors.video_file)} />{errors.video_file && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.video_file}</p>}</div>
                            )}
                            {isEditMode && (
                                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label><input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })} className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none" style={iS()} /></div>
                            )}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
                                <input type="checkbox" id="allow_download" checked={formData.allow_download} onChange={(e) => setFormData({ ...formData, allow_download: e.target.checked })} className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900" />
                                <label htmlFor="allow_download" className="text-sm font-medium text-gray-700">Allow Download</label>
                            </div>
                        </div>
                    </div>
                    <div className="sticky bottom-0 bg-white pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                        <button type="submit" disabled={isSubmitting || (isEditMode && video?.is_deleted)} className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" style={{ background: "#1f2937", boxShadow: "4px 4px 8px rgba(0,0,0,0.12)" }}>
                            {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>{isEditMode ? "Updating..." : "Adding..."}</span></> : <span>{isEditMode ? "Update Video" : "Add Video"}</span>}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
