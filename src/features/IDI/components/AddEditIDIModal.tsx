import { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Loader2, Copy, Check } from "lucide-react";
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

export default function AddEditIDIModal({
  IDI,
  isOpen,
  onClose,
  onSubmit,
}: AddEditIDIModalProps) {
  const [formData, setFormData] = useState<CreateIDIDTO>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Extract state
  const [addMode, setAddMode] = useState<AddMode>("manual");
  const [paragraph, setParagraph] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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
  }, [IDI, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(formData);
      handleClose();
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
    onClose();
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
      size="xl"
    >
      {/* Tab Switcher — only in Add mode */}
      {isAddMode && (
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setAddMode("manual")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${addMode === "manual"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Manual Form
          </button>
          <button
            type="button"
            onClick={() => setAddMode("extract")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${addMode === "extract"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <Sparkles className="w-4 h-4" />
            Extract
          </button>
        </div>
      )}

      {/* AI Extract Panel */}
      {isAddMode && addMode === "extract" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Paste a paragraph containing drug information below. The AI will extract and structure the data into the form fields for you to review.
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={8}
              placeholder="Paste the drug information paragraph here..."
              disabled={isExtracting}
            />
          </div>
          {extractError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{extractError}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isExtracting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting || !paragraph.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Manual Form — shown always in edit mode, or in add mode when "manual" tab is active */}
      {(!isAddMode || addMode === "manual") && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Drug Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Drug Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Name (Generic) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_CHARS_255}
                  value={formData.drugNameGeneric}
                  onChange={(e) => setFormData({ ...formData, drugNameGeneric: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Metformin"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drug Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.drugClass}
                    onChange={(e) => setFormData({ ...formData, drugClass: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Biguanide"
                    list="drugClasses"
                  />
                  <datalist id="drugClasses">
                    {DRUG_CLASSES.map((cls) => (
                      <option key={cls} value={cls} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Therapeutic Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.therapeuticCategory}
                    onChange={(e) => setFormData({ ...formData, therapeuticCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Antidiabetic"
                    list="therapeuticCategories"
                  />
                  <datalist id="therapeuticCategories">
                    {THERAPEUTIC_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brands in India (Single Molecule) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_CHARS_255}
                  value={formData.brandsInIndia}
                  onChange={(e) => setFormData({ ...formData, brandsInIndia: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Glycomet, Glucophage, Obimet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strengths Available *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={MAX_CHARS_255}
                    value={formData.strengthsAvailable}
                    onChange={(e) => setFormData({ ...formData, strengthsAvailable: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., 500 mg, 850 mg, 1000 mg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formulations / Routes *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={MAX_CHARS_255}
                    value={formData.formulationsRoutes}
                    onChange={(e) => setFormData({ ...formData, formulationsRoutes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="e.g., Oral tablet, Extended-release"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Clinical Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Core Clinical Role *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.coreClinicalRole}
                  onChange={(e) => setFormData({ ...formData, coreClinicalRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., First-line oral agent for type 2 diabetes mellitus"
                />
                {renderCharCounter(formData.coreClinicalRole, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Clinical Scenarios *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.preferredClinicalScenarios}
                  onChange={(e) => setFormData({ ...formData, preferredClinicalScenarios: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., Newly diagnosed T2DM, Prediabetes, PCOS with insulin resistance"
                />
                {renderCharCounter(formData.preferredClinicalScenarios, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Where Benefit is Limited / Avoid Overuse *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.whereBenefitLimited}
                  onChange={(e) => setFormData({ ...formData, whereBenefitLimited: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., Type 1 diabetes, Severe renal impairment"
                />
                {renderCharCounter(formData.whereBenefitLimited, MAX_CHARS_500)}
              </div>
            </div>
          </div>

          {/* Dosing Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Dosing Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usual Adult Dose *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.usualAdultDose}
                  onChange={(e) => setFormData({ ...formData, usualAdultDose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
                {renderCharCounter(formData.usualAdultDose, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timing Relative to Meals *
                </label>
                <input
                  type="text"
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.timingRelativeToMeals}
                  onChange={(e) => setFormData({ ...formData, timingRelativeToMeals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {renderCharCounter(formData.timingRelativeToMeals, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review / Duration Plan *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.reviewDurationPlan}
                  onChange={(e) => setFormData({ ...formData, reviewDurationPlan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
                {renderCharCounter(formData.reviewDurationPlan, MAX_CHARS_500)}
              </div>
            </div>
          </div>

          {/* Safety Information */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Safety Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Common Adverse Effects *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.commonAdverseEffects}
                  onChange={(e) => setFormData({ ...formData, commonAdverseEffects: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
                {renderCharCounter(formData.commonAdverseEffects, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serious But Uncommon Risks *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.seriousButUncommonRisks}
                  onChange={(e) => setFormData({ ...formData, seriousButUncommonRisks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
                {renderCharCounter(formData.seriousButUncommonRisks, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long-Term Therapy Cautions *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.longTermTherapyCautions}
                  onChange={(e) => setFormData({ ...formData, longTermTherapyCautions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                />
                {renderCharCounter(formData.longTermTherapyCautions, MAX_CHARS_500)}
              </div>
            </div>
          </div>

          {/* Key Interactions */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Key Interactions</h3>
              <button
                type="button"
                onClick={addKeyInteraction}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Interaction
              </button>
            </div>

            <div className="space-y-4">
              {formData.keyInteractions.map((interaction, index) => (
                <div key={index} className="p-3 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Interaction {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyInteraction(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="Interaction Title"
                    />
                    <textarea
                      maxLength={MAX_CHARS_500}
                      value={interaction.clinicalImpact}
                      onChange={(e) => updateKeyInteraction(index, "clinicalImpact", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      rows={2}
                      placeholder="Clinical Impact"
                    />
                    {renderCharCounter(interaction.clinicalImpact, MAX_CHARS_500)}
                    <textarea
                      maxLength={MAX_CHARS_500}
                      value={interaction.whatToDo}
                      onChange={(e) => updateKeyInteraction(index, "whatToDo", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Practical Prescribing Pearls</h3>
              <button
                type="button"
                onClick={addPracticalPearl}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Pearl
              </button>
            </div>

            <div className="space-y-4">
              {formData.practicalPrescribingPearls.map((pearl, index) => (
                <div key={index} className="p-3 bg-white border border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Pearl {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removePracticalPearl(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      placeholder="Pearl Title"
                    />
                    <textarea
                      maxLength={MAX_CHARS_500}
                      value={pearl.pearlContent}
                      onChange={(e) => updatePracticalPearl(index, "pearlContent", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
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
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Evidence Base</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guidelines (Name + Year) *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.guidelines}
                  onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., ADA Standards of Care 2024, IDF Global Guideline 2022"
                />
                {renderCharCounter(formData.guidelines, MAX_CHARS_500)}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark Trials (Name + Year) *
                </label>
                <textarea
                  required
                  maxLength={MAX_CHARS_500}
                  value={formData.landmarkTrials}
                  onChange={(e) => setFormData({ ...formData, landmarkTrials: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., UKPDS 34 (1998), DPP (2002)"
                />
                {renderCharCounter(formData.landmarkTrials, MAX_CHARS_500)}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Form Actions */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : IDI ? "Update Drug" : "Add Drug"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
