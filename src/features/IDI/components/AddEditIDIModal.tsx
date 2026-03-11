import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Sparkles, Loader2, Copy, Check, X, AlertCircle, ChevronDown, Search } from "lucide-react";
import type { IDI, CreateIDIDTO, KeyInteraction, PracticalPearl } from "../idi.types";
import Modal from "../../../components/common/Modal";
import { DRUG_CLASSES, THERAPEUTIC_CATEGORIES, DRUG_TEMPLATE } from "../idi.types";
import * as IDIService from "../../../services/idi.service";

type AddMode = "manual" | "extract";

interface AddEditIDIModalProps {
  IDI: IDI | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIDIDTO) => Promise<void>;
}

const initialFormData: CreateIDIDTO = {
  drugNameGeneric: "",
  drugClass: "",
  therapeuticCategory: "",
  brandsInIndia: "",
  strengthsAvailable: "",
  formulationsRoutes: "",
  coreClinicalRole: "",
  preferredClinicalScenarios: "",
  whereBenefitLimited: "",
  usualAdultDose: "",
  timingRelativeToMeals: "",
  reviewDurationPlan: "",
  commonAdverseEffects: "",
  seriousButUncommonRisks: "",
  longTermTherapyCautions: "",
  keyInteractions: [],
  practicalPrescribingPearls: [],
  guidelines: "",
  landmarkTrials: "",
  status: "draft",
};

const MAX_CHARS_500 = 500;
const MAX_CHARS_255 = 255;

const inputStyle = (hasError = false) => ({
  background: "#ffffff",
  border: hasError ? "1px solid #ef4444" : "1px solid #e5e7eb",
  boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
});

const sectionStyle = {
  background: "#f8f9fb",
  boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
};

export default function AddEditIDIModal({
  IDI,
  isOpen,
  onClose,
  onSubmit,
}: AddEditIDIModalProps) {
  const [formData, setFormData] = useState<CreateIDIDTO>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // AI Extract state
  const [addMode, setAddMode] = useState<AddMode>("manual");
  const [paragraph, setParagraph] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Searchable dropdown state
  const [drugClassSearch, setDrugClassSearch] = useState("");
  const [isDrugClassDropdownOpen, setIsDrugClassDropdownOpen] = useState(false);
  const [therapeuticCategorySearch, setTherapeuticCategorySearch] = useState("");
  const [isTherapeuticCategoryDropdownOpen, setIsTherapeuticCategoryDropdownOpen] = useState(false);
  const drugClassDropdownRef = useRef<HTMLDivElement>(null);
  const therapeuticCategoryDropdownRef = useRef<HTMLDivElement>(null);

  // Add scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Click outside handlers for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugClassDropdownRef.current && !drugClassDropdownRef.current.contains(event.target as Node)) {
        setIsDrugClassDropdownOpen(false);
      }
      if (therapeuticCategoryDropdownRef.current && !therapeuticCategoryDropdownRef.current.contains(event.target as Node)) {
        setIsTherapeuticCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDrugClasses = DRUG_CLASSES.filter((cls) =>
    cls.toLowerCase().includes(drugClassSearch.toLowerCase())
  );

  const filteredTherapeuticCategories = THERAPEUTIC_CATEGORIES.filter((cat) =>
    cat.toLowerCase().includes(therapeuticCategorySearch.toLowerCase())
  );

  useEffect(() => {
    if (IDI) {
      setFormData({
        drugNameGeneric: IDI.drugNameGeneric,
        drugClass: IDI.drugClass,
        therapeuticCategory: IDI.therapeuticCategory,
        brandsInIndia: IDI.brandsInIndia,
        strengthsAvailable: IDI.strengthsAvailable,
        formulationsRoutes: IDI.formulationsRoutes,
        coreClinicalRole: IDI.coreClinicalRole,
        preferredClinicalScenarios: IDI.preferredClinicalScenarios,
        whereBenefitLimited: IDI.whereBenefitLimited,
        usualAdultDose: IDI.usualAdultDose,
        timingRelativeToMeals: IDI.timingRelativeToMeals,
        reviewDurationPlan: IDI.reviewDurationPlan,
        commonAdverseEffects: IDI.commonAdverseEffects,
        seriousButUncommonRisks: IDI.seriousButUncommonRisks,
        longTermTherapyCautions: IDI.longTermTherapyCautions,
        keyInteractions: IDI.keyInteractions || [],
        practicalPrescribingPearls: IDI.practicalPrescribingPearls || [],
        guidelines: IDI.guidelines,
        landmarkTrials: IDI.landmarkTrials,
        status: IDI.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [IDI, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate character limits
    const errors: Record<string, string> = {};
    if (formData.drugNameGeneric.length > 50) {
      errors.drugNameGeneric = "Drug Name (Generic) cannot exceed 50 characters";
    }
    if (formData.brandsInIndia.length > 100) {
      errors.brandsInIndia = "Brands in India cannot exceed 100 characters";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setTimeout(() => { handleClose(); }, 1500);
    } catch (error: any) {
      const detail = error?.response?.data?.detail || error?.message || "Failed to save drug. Please try again.";
      setSubmitError(detail);
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setAddMode("manual");
    setParagraph("");
    setExtractError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setDrugClassSearch("");
    setIsDrugClassDropdownOpen(false);
    setTherapeuticCategorySearch("");
    setIsTherapeuticCategoryDropdownOpen(false);
    onClose();
  };

  const handleDrugClassSelect = (cls: string) => {
    setFormData({ ...formData, drugClass: cls });
    setDrugClassSearch("");
    setIsDrugClassDropdownOpen(false);
  };

  const handleTherapeuticCategorySelect = (cat: string) => {
    setFormData({ ...formData, therapeuticCategory: cat });
    setTherapeuticCategorySearch("");
    setIsTherapeuticCategoryDropdownOpen(false);
  };

  const handleExtract = async () => {
    if (!paragraph.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const extractedData = await IDIService.extractIDIFromParagraph(paragraph.trim());
      setFormData(extractedData);
      setAddMode("manual"); // Switch to manual form so user can review
    } catch (error) {
      console.error("Error extracting IDI:", error);
      setExtractError("Failed to extract drug information. Please try again or use the manual form.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(DRUG_TEMPLATE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy template:", err);
    }
  };

  // Key Interactions handlers
  const addKeyInteraction = () => {
    setFormData({
      ...formData,
      keyInteractions: [
        ...formData.keyInteractions,
        { interactionTitle: "", clinicalImpact: "", whatToDo: "" },
      ],
    });
  };

  const removeKeyInteraction = (index: number) => {
    setFormData({
      ...formData,
      keyInteractions: formData.keyInteractions.filter((_, i) => i !== index),
    });
  };

  const updateKeyInteraction = (index: number, field: keyof KeyInteraction, value: string) => {
    const updated = [...formData.keyInteractions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, keyInteractions: updated });
  };

  // Practical Pearls handlers
  const addPracticalPearl = () => {
    setFormData({
      ...formData,
      practicalPrescribingPearls: [
        ...formData.practicalPrescribingPearls,
        { pearlTitle: "", pearlContent: "" },
      ],
    });
  };

  const removePracticalPearl = (index: number) => {
    setFormData({
      ...formData,
      practicalPrescribingPearls: formData.practicalPrescribingPearls.filter((_, i) => i !== index),
    });
  };

  const updatePracticalPearl = (index: number, field: keyof PracticalPearl, value: string) => {
    const updated = [...formData.practicalPrescribingPearls];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, practicalPrescribingPearls: updated });
  };

  const isAddMode = !IDI;

  const renderCharCounter = (text: string, max: number) => (
    <div className="text-xs text-right text-gray-500 mt-1">
      {text.length}/{max}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={IDI ? "Edit Drug Information" : "Add New Drug"}
      size="lg"
    >
      <div className="flex flex-col h-full">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 z-10 active:scale-95 active:shadow-inner"
          style={{
            background: "#f8f9fb",
            boxShadow: "2px 2px 4px rgba(0, 0, 0, 0.06), -2px -2px 4px rgba(255, 255, 255, 0.6)"
          }}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Success State */}
        {submitSuccess ? (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: "rgba(79, 207, 165, 0.08)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
              <p className="text-sm text-emerald-800">
                Drug <span className="font-semibold">{formData.drugNameGeneric}</span> has been successfully{" "}
                {IDI ? "updated" : "added"}.
              </p>
            </div>

            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
              borderTop: "1px solid rgba(0,0,0,0.06)",
              marginLeft: "-2px", marginRight: "-2px",
              paddingLeft: "2px", paddingRight: "2px"
            }}>
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
                style={{
                  background: "#1f2937",
                  boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Switcher — only in Add mode */}
            {isAddMode && (
              <div className="flex mb-5 rounded-xl p-1" style={{ background: "#f1f3f7", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setAddMode("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${addMode === "manual"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Manual Form
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("extract")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${addMode === "extract"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Extract
                </button>
              </div>
            )}

            {/* AI Extract Panel */}
            {isAddMode && addMode === "extract" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-5">
                  <div className="rounded-xl p-4" style={{ background: "rgba(107, 150, 255, 0.06)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)" }}>
                    <p className="text-sm text-blue-800">
                      Paste a paragraph containing drug information below.
                    </p>
                  </div>

                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <label className="text-sm font-semibold text-gray-900">
                        Drug Information Paragraph *
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyTemplate}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        title="Copy example template"
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {isCopied ? "Copied!" : "Copy Example"}
                      </button>
                    </div>
                    <textarea
                      value={paragraph}
                      onChange={(e) => setParagraph(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                      rows={12}
                      placeholder="Paste the drug information paragraph here..."
                      disabled={isExtracting}
                    />
                  </div>

                  {extractError && (
                    <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                      background: "#fee", border: "1px solid #fcc"
                    }}>
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{extractError}</p>
                    </div>
                  )}
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  marginLeft: "-2px", marginRight: "-2px",
                  paddingLeft: "2px", paddingRight: "2px"
                }}>
                  <button
                    type="button"
                    onClick={handleExtract}
                    disabled={isExtracting || !paragraph.trim()}
                    className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "#1f2937",
                      boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract & Fill Form
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Manual Form */}
            {(!isAddMode || addMode === "manual") && (
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5">
                  {/* Submit Error */}
                  {submitError && (
                    <div className="flex items-start gap-3 p-3 rounded-xl" style={{
                      background: "#fee", border: "1px solid #fcc"
                    }}>
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{submitError}</p>
                    </div>
                  )}

                  {/* Basic Drug Information */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Basic Drug Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Drug Name (Generic) *</label>
                        <input
                          type="text"
                          required
                          maxLength={50}
                          value={formData.drugNameGeneric}
                          onChange={(e) => {
                            setFormData({ ...formData, drugNameGeneric: e.target.value });
                            if (validationErrors.drugNameGeneric) setValidationErrors({ ...validationErrors, drugNameGeneric: "" });
                          }}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle(!!validationErrors.drugNameGeneric)}
                          placeholder="e.g., Metformin"
                        />
                        {validationErrors.drugNameGeneric && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <p className="text-xs text-red-600">{validationErrors.drugNameGeneric}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Drug Class Searchable Dropdown */}
                        <div className="relative" ref={drugClassDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Drug Class *</label>
                          <button
                            type="button"
                            className="w-full px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                            style={inputStyle()}
                            onClick={() => setIsDrugClassDropdownOpen(!isDrugClassDropdownOpen)}
                          >
                            <span className={formData.drugClass ? "text-gray-900" : "text-gray-500"}>
                              {formData.drugClass || "Select Drug Class"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDrugClassDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isDrugClassDropdownOpen && (
                            <div
                              className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                              style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
                            >
                              <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                    style={inputStyle()}
                                    placeholder="Search drug classes..."
                                    value={drugClassSearch}
                                    onChange={(e) => setDrugClassSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredDrugClasses.length > 0 ? (
                                  filteredDrugClasses.map((cls) => (
                                    <div
                                      key={cls}
                                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${formData.drugClass === cls ? "bg-gray-50 font-medium" : ""}`}
                                      onClick={() => handleDrugClassSelect(cls)}
                                    >
                                      {cls}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">No drug classes found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Therapeutic Category Searchable Dropdown */}
                        <div className="relative" ref={therapeuticCategoryDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Therapeutic Category *</label>
                          <button
                            type="button"
                            className="w-full px-4 py-2.5 text-sm rounded-xl flex items-center justify-between gap-2 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                            style={inputStyle()}
                            onClick={() => setIsTherapeuticCategoryDropdownOpen(!isTherapeuticCategoryDropdownOpen)}
                          >
                            <span className={formData.therapeuticCategory ? "text-gray-900" : "text-gray-500"}>
                              {formData.therapeuticCategory || "Select Therapeutic Category"}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTherapeuticCategoryDropdownOpen ? "rotate-180" : ""}`} />
                          </button>

                          {isTherapeuticCategoryDropdownOpen && (
                            <div
                              className="absolute z-50 w-full mt-1 bg-white rounded-xl overflow-hidden"
                              style={{ boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}
                            >
                              <div className="p-2 sticky top-0 bg-white" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                                <div className="relative">
                                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    className="w-full pl-8 pr-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:outline-none"
                                    style={inputStyle()}
                                    placeholder="Search categories..."
                                    value={therapeuticCategorySearch}
                                    onChange={(e) => setTherapeuticCategorySearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filteredTherapeuticCategories.length > 0 ? (
                                  filteredTherapeuticCategories.map((cat) => (
                                    <div
                                      key={cat}
                                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${formData.therapeuticCategory === cat ? "bg-gray-50 font-medium" : ""}`}
                                      onClick={() => handleTherapeuticCategorySelect(cat)}
                                    >
                                      {cat}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">No categories found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brands in India (Single Molecule) *</label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={formData.brandsInIndia}
                          onChange={(e) => {
                            setFormData({ ...formData, brandsInIndia: e.target.value });
                            if (validationErrors.brandsInIndia) setValidationErrors({ ...validationErrors, brandsInIndia: "" });
                          }}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle(!!validationErrors.brandsInIndia)}
                          placeholder="e.g., Glycomet, Glucophage, Obimet"
                        />
                        {validationErrors.brandsInIndia && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <p className="text-xs text-red-600">{validationErrors.brandsInIndia}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Strengths Available *</label>
                          <input
                            type="text"
                            required
                            maxLength={MAX_CHARS_255}
                            value={formData.strengthsAvailable}
                            onChange={(e) => setFormData({ ...formData, strengthsAvailable: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                            placeholder="e.g., 500 mg, 850 mg, 1000 mg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Formulations / Routes *</label>
                          <input
                            type="text"
                            required
                            maxLength={MAX_CHARS_255}
                            value={formData.formulationsRoutes}
                            onChange={(e) => setFormData({ ...formData, formulationsRoutes: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                            style={inputStyle()}
                            placeholder="e.g., Oral tablet, Extended-release"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Information */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Clinical Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Core Clinical Role *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.coreClinicalRole}
                          onChange={(e) => setFormData({ ...formData, coreClinicalRole: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                          placeholder="e.g., First-line oral agent for type 2 diabetes mellitus"
                        />
                        {renderCharCounter(formData.coreClinicalRole, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Clinical Scenarios *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.preferredClinicalScenarios}
                          onChange={(e) => setFormData({ ...formData, preferredClinicalScenarios: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                          placeholder="e.g., Newly diagnosed T2DM, Prediabetes, PCOS with insulin resistance"
                        />
                        {renderCharCounter(formData.preferredClinicalScenarios, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Where Benefit is Limited / Avoid Overuse *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.whereBenefitLimited}
                          onChange={(e) => setFormData({ ...formData, whereBenefitLimited: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                          placeholder="e.g., Type 1 diabetes, Severe renal impairment"
                        />
                        {renderCharCounter(formData.whereBenefitLimited, MAX_CHARS_500)}
                      </div>
                    </div>
                  </div>

                  {/* Dosing Information */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Dosing Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usual Adult Dose *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.usualAdultDose}
                          onChange={(e) => setFormData({ ...formData, usualAdultDose: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                        />
                        {renderCharCounter(formData.usualAdultDose, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timing Relative to Meals *</label>
                        <input
                          type="text"
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.timingRelativeToMeals}
                          onChange={(e) => setFormData({ ...formData, timingRelativeToMeals: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                        />
                        {renderCharCounter(formData.timingRelativeToMeals, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review / Duration Plan *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.reviewDurationPlan}
                          onChange={(e) => setFormData({ ...formData, reviewDurationPlan: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                        />
                        {renderCharCounter(formData.reviewDurationPlan, MAX_CHARS_500)}
                      </div>
                    </div>
                  </div>

                  {/* Safety Information */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Safety Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Common Adverse Effects *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.commonAdverseEffects}
                          onChange={(e) => setFormData({ ...formData, commonAdverseEffects: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                        />
                        {renderCharCounter(formData.commonAdverseEffects, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Serious But Uncommon Risks *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.seriousButUncommonRisks}
                          onChange={(e) => setFormData({ ...formData, seriousButUncommonRisks: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                        />
                        {renderCharCounter(formData.seriousButUncommonRisks, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Long-Term Therapy Cautions *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.longTermTherapyCautions}
                          onChange={(e) => setFormData({ ...formData, longTermTherapyCautions: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                        />
                        {renderCharCounter(formData.longTermTherapyCautions, MAX_CHARS_500)}
                      </div>
                    </div>
                  </div>

                  {/* Key Interactions */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <h3 className="text-sm font-semibold text-gray-900">Key Interactions</h3>
                      <button
                        type="button"
                        onClick={addKeyInteraction}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-xl hover:opacity-90 transition-all"
                        style={{
                          background: "#1f2937",
                          boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Interaction
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.keyInteractions.map((interaction, index) => (
                        <div key={index} className="p-4 rounded-xl" style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                        }}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-700">Interaction {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyInteraction(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              maxLength={MAX_CHARS_255}
                              value={interaction.interactionTitle}
                              onChange={(e) => updateKeyInteraction(index, "interactionTitle", e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle()}
                              placeholder="Interaction Title"
                            />
                            <textarea
                              maxLength={MAX_CHARS_500}
                              value={interaction.clinicalImpact}
                              onChange={(e) => updateKeyInteraction(index, "clinicalImpact", e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle()}
                              rows={2}
                              placeholder="Clinical Impact"
                            />
                            {renderCharCounter(interaction.clinicalImpact, MAX_CHARS_500)}
                            <textarea
                              maxLength={MAX_CHARS_500}
                              value={interaction.whatToDo}
                              onChange={(e) => updateKeyInteraction(index, "whatToDo", e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle()}
                              rows={2}
                              placeholder="What to Do"
                            />
                            {renderCharCounter(interaction.whatToDo, MAX_CHARS_500)}
                          </div>
                        </div>
                      ))}
                      {formData.keyInteractions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No interactions added yet. Click "Add Interaction" to add one.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Practical Prescribing Pearls */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <h3 className="text-sm font-semibold text-gray-900">Practical Prescribing Pearls</h3>
                      <button
                        type="button"
                        onClick={addPracticalPearl}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-xl hover:opacity-90 transition-all"
                        style={{
                          background: "#1f2937",
                          boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)",
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Pearl
                      </button>
                    </div>

                    <div className="space-y-4">
                      {formData.practicalPrescribingPearls.map((pearl, index) => (
                        <div key={index} className="p-4 rounded-xl" style={{
                          background: "#ffffff",
                          border: "1px solid #e5e7eb",
                          boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.05)",
                        }}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-700">Pearl {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removePracticalPearl(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              maxLength={MAX_CHARS_255}
                              value={pearl.pearlTitle}
                              onChange={(e) => updatePracticalPearl(index, "pearlTitle", e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle()}
                              placeholder="Pearl Title"
                            />
                            <textarea
                              maxLength={MAX_CHARS_500}
                              value={pearl.pearlContent}
                              onChange={(e) => updatePracticalPearl(index, "pearlContent", e.target.value)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                              style={inputStyle()}
                              rows={2}
                              placeholder="Pearl Content"
                            />
                            {renderCharCounter(pearl.pearlContent, MAX_CHARS_500)}
                          </div>
                        </div>
                      ))}
                      {formData.practicalPrescribingPearls.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No pearls added yet. Click "Add Pearl" to add one.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Evidence Base */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Evidence Base</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guidelines (Name + Year) *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.guidelines}
                          onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                          placeholder="e.g., ADA Standards of Care 2024, IDF Global Guideline 2022"
                        />
                        {renderCharCounter(formData.guidelines, MAX_CHARS_500)}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Landmark Trials (Name + Year) *</label>
                        <textarea
                          required
                          maxLength={MAX_CHARS_500}
                          value={formData.landmarkTrials}
                          onChange={(e) => setFormData({ ...formData, landmarkTrials: e.target.value })}
                          className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                          style={inputStyle()}
                          rows={2}
                          placeholder="e.g., UKPDS 34 (1998), DPP (2002)"
                        />
                        {renderCharCounter(formData.landmarkTrials, MAX_CHARS_500)}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="rounded-xl px-5 py-4" style={sectionStyle}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>Status</h3>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                      style={inputStyle()}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 mt-4" style={{
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  marginLeft: "-2px", marginRight: "-2px",
                  paddingLeft: "2px", paddingRight: "2px"
                }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: "#1f2937",
                      boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.12), -2px -2px 6px rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{IDI ? "Update Drug" : "Add Drug"}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
