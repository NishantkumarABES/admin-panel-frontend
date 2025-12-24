import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
import type { DoctorForm, CreateDoctorDTO, DoctorStatus } from "./doctor.types";
import { mockDoctors } from "./doctor.types";
import DoctorTable from "./components/DoctorTable";
import DoctorDetailsModal from "./components/DoctorDetailsModal";
import AddEditDoctorModal from "./components/AddEditDoctorModal";
import VerifyDoctorModal from "./components/VerifyDoctorModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import * as doctorService from "../../services/doctor.service";

export default function DoctorsView() {
  const [doctors, setDoctors] = useState<DoctorForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | "all">("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");

  // Modal states
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorForm | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (specialtyFilter !== "all") filters.specialty = specialtyFilter;
      if (searchTerm) filters.search = searchTerm;

      const response = await doctorService.getDoctors(filters);
      setDoctors(response.data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setDoctors(mockDoctors);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchDoctors();
  // }, [statusFilter]);

useEffect(() => {
  setDoctors(mockDoctors);
  setLoading(false);
}, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchDoctors();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handlers
  const handleView = (doctor: DoctorForm) => {
    setSelectedDoctor(doctor);
    setIsDetailsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedDoctor(null);
    setIsAddEditModalOpen(true);
  };

  const handleEdit = (doctor: DoctorForm) => {
    setSelectedDoctor(doctor);
    setIsAddEditModalOpen(true);
  };

  const handleVerify = (doctor: DoctorForm) => {
    setSelectedDoctor(doctor);
    setIsVerifyModalOpen(true);
  };

  const handleSuspend = (doctor: DoctorForm) => {
    setSelectedDoctor(doctor);
    setIsSuspendDialogOpen(true);
  };

  const handleDelete = (doctor: DoctorForm) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers
  const handleAddEditSubmit = async (data: CreateDoctorDTO) => {
    try {
      if (selectedDoctor) {
        await doctorService.updateDoctor({ ...data, id: selectedDoctor.id });
      } else {
        await doctorService.createDoctor(data);
      }
      fetchDoctors();
    } catch (error) {
      console.error("Failed to save doctor:", error);
    }
  };

  const handleVerifySubmit = async (
    doctorId: string,
    action: "verified" | "rejected",
    notes?: string,
    rejectionReason?: string
  ) => {
    try {
      await doctorService.verifyDoctor({
        id: doctorId,
        status: action,
        notes,
        rejectionReason,
      });
      fetchDoctors();
    } catch (error) {
      console.error("Failed to verify doctor:", error);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedDoctor) return;
    try {
      const shouldSuspend = selectedDoctor.status !== "suspended";
      await doctorService.toggleDoctorSuspension(
        selectedDoctor.id,
        shouldSuspend
      );
      fetchDoctors();
    } catch (error) {
      console.error("Failed to suspend doctor:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoctor) return;
    try {
      await doctorService.deleteDoctor(selectedDoctor.id);
      fetchDoctors();
    } catch (error) {
      console.error("Failed to delete doctor:", error);
    }
  };

  // Get unique specialities for filter
  const uniqueSpecialities = Array.from(
    new Set(doctors.map((doctor) => doctor.specialty))
  ).sort();

  const filteredDoctors = doctors;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* Filters and Actions - All in one row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between min-w-0">
          {/* Left side: Search + Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 min-w-0 flex-1">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full sm:min-w-[280px] sm:max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or license number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Filters group */}
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              {/* Specialty Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All specialities</option>
                  {uniqueSpecialities.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[160px]">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DoctorStatus | "all")}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent min-w-0"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right side: Add Doctor Button */}
          <div className="flex justify-end lg:justify-normal flex-shrink-0">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Total Doctors</div>
          <div className="text-2xl font-bold text-gray-900">
            {doctors.length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Verified</div>
          <div className="text-2xl font-bold text-emerald-600">
            {doctors.filter((d) => d.status === "verified").length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-600">
            {doctors.filter((d) => d.status === "pending").length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-0">
          <div className="text-sm text-gray-600 mb-1">Suspended</div>
          <div className="text-2xl font-bold text-red-600">
            {doctors.filter((d) => d.status === "suspended").length}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading doctors...</p>
        </div>
      ) : (
        <DoctorTable
          doctors={filteredDoctors}
          onView={handleView}
          onEdit={handleEdit}
          onVerify={handleVerify}
          onSuspend={handleSuspend}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <DoctorDetailsModal
        doctor={selectedDoctor}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <AddEditDoctorModal
        doctor={selectedDoctor}
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      <VerifyDoctorModal
        doctor={selectedDoctor}
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSubmit={handleVerifySubmit}
      />

      <ConfirmDialog
        isOpen={isSuspendDialogOpen}
        onClose={() => setIsSuspendDialogOpen(false)}
        onConfirm={handleConfirmSuspend}
        title={
          selectedDoctor?.status === "suspended"
            ? "Unsuspend Doctor"
            : "Suspend Doctor"
        }
        message={
          selectedDoctor?.status === "suspended"
            ? `Are you sure you want to unsuspend Dr. ${selectedDoctor?.fullName} ? They will regain access to the platform.`
            : `Are you sure you want to suspend Dr. ${selectedDoctor?.fullName} ? They will lose access to the platform.`
        }
        confirmText={
          selectedDoctor?.status === "suspended"
            ? "Unsuspend"
            : "Suspend"
        }
        variant="warning"
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${selectedDoctor?.fullName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}