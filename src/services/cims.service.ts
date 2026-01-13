import { api } from "./api";
import type {
  CIMS,
  CreateCIMSDTO,
  UpdateCIMSDTO,
  KeyInteraction,
  PracticalPearl,
} from "../features/CIMS/cims.types";

// Backend response types (snake_case)
interface BackendKeyInteraction {
  id?: string;
  interaction_title: string;
  clinical_impact: string;
  what_to_do: string;
}

interface BackendPracticalPearl {
  id?: string;
  pearl_title: string;
  pearl_content: string;
}

interface BackendCIMS {
  id: string;
  drug_name_generic: string;
  drug_class: string;
  therapeutic_category: string;
  brands_in_india: string;
  strengths_available: string;
  formulations_routes: string;
  core_clinical_role: string;
  preferred_clinical_scenarios: string;
  where_benefit_limited: string;
  usual_adult_dose: string;
  timing_relative_to_meals: string;
  review_duration_plan: string;
  common_adverse_effects: string;
  serious_but_uncommon_risks: string;
  long_term_therapy_cautions: string;
  guidelines: string;
  landmark_trials: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  key_interactions: BackendKeyInteraction[];
  practical_prescribing_pearls: BackendPracticalPearl[];
}

interface BackendPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BackendCIMS[];
  success: boolean;
}

// Transform backend response to frontend format
const transformKeyInteraction = (data: BackendKeyInteraction): KeyInteraction => ({
  interactionTitle: data.interaction_title,
  clinicalImpact: data.clinical_impact,
  whatToDo: data.what_to_do,
});

const transformPracticalPearl = (data: BackendPracticalPearl): PracticalPearl => ({
  pearlTitle: data.pearl_title,
  pearlContent: data.pearl_content,
});

const transformCIMSFromBackend = (data: BackendCIMS): CIMS => ({
  id: data.id,
  drugNameGeneric: data.drug_name_generic,
  drugClass: data.drug_class,
  therapeuticCategory: data.therapeutic_category,
  brandsInIndia: data.brands_in_india,
  strengthsAvailable: data.strengths_available,
  formulationsRoutes: data.formulations_routes,
  coreClinicalRole: data.core_clinical_role,
  preferredClinicalScenarios: data.preferred_clinical_scenarios,
  whereBenefitLimited: data.where_benefit_limited,
  usualAdultDose: data.usual_adult_dose,
  timingRelativeToMeals: data.timing_relative_to_meals,
  reviewDurationPlan: data.review_duration_plan,
  commonAdverseEffects: data.common_adverse_effects,
  seriousButUncommonRisks: data.serious_but_uncommon_risks,
  longTermTherapyCautions: data.long_term_therapy_cautions,
  guidelines: data.guidelines,
  landmarkTrials: data.landmark_trials,
  status: data.status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  createdBy: "", // Backend doesn't provide this field
  keyInteractions: (data.key_interactions || []).map(transformKeyInteraction),
  practicalPrescribingPearls: (data.practical_prescribing_pearls || []).map(transformPracticalPearl),
});

// Transform frontend data to backend format
const transformKeyInteractionToBackend = (data: KeyInteraction): BackendKeyInteraction => ({
  interaction_title: data.interactionTitle,
  clinical_impact: data.clinicalImpact,
  what_to_do: data.whatToDo,
});

const transformPracticalPearlToBackend = (data: PracticalPearl): BackendPracticalPearl => ({
  pearl_title: data.pearlTitle,
  pearl_content: data.pearlContent,
});

const transformCIMSToBackend = (data: CreateCIMSDTO) => ({
  drug_name_generic: data.drugNameGeneric,
  drug_class: data.drugClass,
  therapeutic_category: data.therapeuticCategory,
  brands_in_india: data.brandsInIndia,
  strengths_available: data.strengthsAvailable,
  formulations_routes: data.formulationsRoutes,
  core_clinical_role: data.coreClinicalRole,
  preferred_clinical_scenarios: data.preferredClinicalScenarios,
  where_benefit_limited: data.whereBenefitLimited,
  usual_adult_dose: data.usualAdultDose,
  timing_relative_to_meals: data.timingRelativeToMeals,
  review_duration_plan: data.reviewDurationPlan,
  common_adverse_effects: data.commonAdverseEffects,
  serious_but_uncommon_risks: data.seriousButUncommonRisks,
  long_term_therapy_cautions: data.longTermTherapyCautions,
  guidelines: data.guidelines,
  landmark_trials: data.landmarkTrials,
  status: data.status || "draft",
  key_interactions: (data.keyInteractions || []).map(transformKeyInteractionToBackend),
  practical_prescribing_pearls: (data.practicalPrescribingPearls || []).map(transformPracticalPearlToBackend),
});

export const getCIMS = async (filters?: {
  drugClass?: string;
  therapeuticCategory?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}) => {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.append("page", filters.page.toString());
  }
  if (filters?.page_size) {
    params.append("page_size", filters.page_size.toString());
  }
  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.therapeuticCategory) {
    params.append("therapeutic_category", filters.therapeuticCategory);
  }
  if (filters?.drugClass) {
    params.append("drug_class", filters.drugClass);
  }

  const queryString = params.toString();
  const response = await api.get<BackendPaginatedResponse>(
    `/admin/cims/${queryString ? `?${queryString}` : ""}`
  );

  return {
    data: {
      results: response.data.results.map(transformCIMSFromBackend),
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
    },
  };
};

export const getCIMSById = async (id: string) => {
  const response = await api.get<{ data: BackendCIMS }>(`/admin/cims/${id}/`);
  return {
    data: transformCIMSFromBackend(response.data.data),
  };
};

export const createCIMS = async (data: CreateCIMSDTO) => {
  const backendData = transformCIMSToBackend(data);
  const response = await api.post<{ success: boolean; data: BackendCIMS }>(
    "/admin/cims/",
    backendData
  );
  return {
    data: transformCIMSFromBackend(response.data.data),
  };
};

export const updateCIMS = async (data: UpdateCIMSDTO) => {
  const { id, ...updateData } = data;
  const backendData = transformCIMSToBackend(updateData as CreateCIMSDTO);
  const response = await api.patch<{ success: boolean; data: BackendCIMS }>(
    `/admin/cims/${id}/`,
    backendData
  );
  return {
    data: transformCIMSFromBackend(response.data.data),
  };
};

export const deleteCIMS = async (id: string) => {
  return api.delete(`/admin/cims/${id}/`);
};

export const publishCIMS = async (id: string) => {
  const response = await api.patch<{ success: boolean; data: BackendCIMS }>(
    `/admin/cims/${id}/`,
    { status: "published" }
  );
  return {
    data: transformCIMSFromBackend(response.data.data),
  };
};

export const archiveCIMS = async (id: string) => {
  const response = await api.patch<{ success: boolean; data: BackendCIMS }>(
    `/admin/cims/${id}/`,
    { status: "archived" }
  );
  return {
    data: transformCIMSFromBackend(response.data.data),
  };
};

export const getCIMSAnalytics = async () => {
  return api.get<{
    total_drugs: number;
    published_drugs: number;
    draft_drugs: number;
    archived_drugs: number;
  }>("/admin/cims/analytics/");
};
