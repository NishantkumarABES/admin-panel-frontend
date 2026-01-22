import { X, Pill, Tag, Calendar, AlertCircle, BookOpen, FlaskConical } from "lucide-react";
import type { IDI } from "../IDI.types";
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

  const getStatusBadge = (status: string) => {
    const colors = {
      published: "bg-emerald-100 text-emerald-800",
      draft: "bg-gray-100 text-gray-800",
      archived: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Drug Information Details">
      <div className="space-y-6">
        {/* Header with Drug Name and Status */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {IDI.drugNameGeneric}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(IDI.status)}`}
            >
              {IDI.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{IDI.drugClass} | {IDI.therapeuticCategory}</p>
        </div>

        {/* Basic Drug Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4" />
            Basic Information
          </h4>
          <div className="space-y-3">
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
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Clinical Role
          </h4>
          <div className="space-y-3">
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
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Dosing Information
          </h4>
          <div className="space-y-3">
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
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Safety Information
          </h4>
          <div className="space-y-3">
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
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Interactions</h4>
            <div className="space-y-3">
              {IDI.keyInteractions.map((interaction, index) => (
                <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {interaction.interactionTitle}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
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
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Practical Prescribing Pearls</h4>
            <div className="space-y-3">
              {IDI.practicalPrescribingPearls.map((pearl, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {pearl.pearlTitle}
                  </div>
                  <div className="text-xs text-gray-600">
                    {pearl.pearlContent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Base */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Evidence Base
          </h4>
          <div className="space-y-3">
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

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(IDI.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {new Date(IDI.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
