import { Pill, Tag, Calendar, AlertCircle, BookOpen, FlaskConical } from "lucide-react";
import type { IDI } from "../idi.types";
import Modal from "../../../components/common/Modal";

interface IDIDetailsModalProps {
  IDI: IDI | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function IDIDetailsModal({
  IDI,
  isOpen,
  onClose,
}: IDIDetailsModalProps) {
  if (!isOpen || !IDI) return null;

  const insetSectionStyle = {
    background: "#f8f9fb",
    boxShadow: "inset 2px 2px 5px rgba(0, 0, 0, 0.04), inset -2px -2px 5px rgba(255, 255, 255, 0.6)",
    borderRadius: "12px",
    padding: "12px 14px",
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      published: { bg: "rgba(107, 150, 255, 0.1)", color: "#4b6fd4" },
      draft: { bg: "rgba(107, 114, 128, 0.1)", color: "#4b5563" },
      archived: { bg: "rgba(255, 112, 112, 0.1)", color: "#d94f4f" },
    };
    return styles[status] || styles.draft;
  };

  const s = getStatusStyle(IDI.status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Drug Information Details">
      <div className="space-y-4">
        {/* Header with Drug Name and Status */}
        <div className="pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-start justify-between gap-4 mb-1">
            <h3 className="text-xl font-bold text-gray-900">{IDI.drugNameGeneric}</h3>
            <span
              className="px-2.5 py-1 text-xs font-medium rounded-full capitalize shrink-0"
              style={{ background: s.bg, color: s.color }}
            >
              {IDI.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{IDI.drugClass} | {IDI.therapeuticCategory}</p>
        </div>

        {/* Basic Drug Information */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Basic Information
          </h4>
          <div style={insetSectionStyle} className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Brands in India</div>
              <div className="text-sm text-gray-900">{IDI.brandsInIndia}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Strengths Available</div>
              <div className="text-sm text-gray-900">{IDI.strengthsAvailable}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Formulations / Routes</div>
              <div className="text-sm text-gray-900">{IDI.formulationsRoutes}</div>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Clinical Role
          </h4>
          <div style={insetSectionStyle} className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Core Clinical Role</div>
              <div className="text-sm text-gray-900">{IDI.coreClinicalRole}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Preferred Clinical Scenarios</div>
              <div className="text-sm text-gray-900">{IDI.preferredClinicalScenarios}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Where Benefit is Limited / Avoid Overuse</div>
              <div className="text-sm text-gray-900">{IDI.whereBenefitLimited}</div>
            </div>
          </div>
        </div>

        {/* Dosing Information */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Dosing Information
          </h4>
          <div style={insetSectionStyle} className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Usual Adult Dose</div>
              <div className="text-sm text-gray-900">{IDI.usualAdultDose}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Timing Relative to Meals</div>
              <div className="text-sm text-gray-900">{IDI.timingRelativeToMeals}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Review / Duration Plan</div>
              <div className="text-sm text-gray-900">{IDI.reviewDurationPlan}</div>
            </div>
          </div>
        </div>

        {/* Safety Information */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Safety Information
          </h4>
          <div style={insetSectionStyle} className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Common Adverse Effects</div>
              <div className="text-sm text-gray-900">{IDI.commonAdverseEffects}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Serious But Uncommon Risks</div>
              <div className="text-sm text-gray-900">{IDI.seriousButUncommonRisks}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Long-Term Therapy Cautions</div>
              <div className="text-sm text-gray-900">{IDI.longTermTherapyCautions}</div>
            </div>
          </div>
        </div>

        {/* Key Interactions */}
        {IDI.keyInteractions && IDI.keyInteractions.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Key Interactions</h4>
            <div className="space-y-2">
              {IDI.keyInteractions.map((interaction, index) => (
                <div key={index} className="p-3 rounded-xl" style={{
                  background: "rgba(245, 158, 11, 0.05)",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}>
                  <div className="font-medium text-sm text-gray-900 mb-1">{interaction.interactionTitle}</div>
                  <div className="text-xs text-gray-600 mb-1.5">
                    <span className="font-medium">Clinical Impact:</span> {interaction.clinicalImpact}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">What to Do:</span> {interaction.whatToDo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practical Prescribing Pearls */}
        {IDI.practicalPrescribingPearls && IDI.practicalPrescribingPearls.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Practical Prescribing Pearls</h4>
            <div className="space-y-2">
              {IDI.practicalPrescribingPearls.map((pearl, index) => (
                <div key={index} className="p-3 rounded-xl" style={{
                  background: "rgba(107, 150, 255, 0.05)",
                  boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.04), inset -2px -2px 5px rgba(255,255,255,0.5)",
                  border: "1px solid rgba(107,150,255,0.15)",
                }}>
                  <div className="font-medium text-sm text-gray-900 mb-1">{pearl.pearlTitle}</div>
                  <div className="text-xs text-gray-600">{pearl.pearlContent}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Base */}
        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Evidence Base
          </h4>
          <div style={insetSectionStyle} className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Guidelines
              </div>
              <div className="text-sm text-gray-900">{IDI.guidelines}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" />
                Landmark Trials
              </div>
              <div className="text-sm text-gray-900">{IDI.landmarkTrials}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="text-xs text-gray-500 space-x-4">
          <span>Created: {new Date(IDI.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(IDI.updatedAt).toLocaleDateString()}</span>
        </div>
        <button onClick={onClose} className="clay-btn" style={{ fontSize: "13px", padding: "6px 16px" }}>
          Close
        </button>
      </div>
    </Modal>
  );
}
