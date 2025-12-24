import { useState, useEffect } from "react";
// import { Plus, Trash2 } from "lucide-react";
import type { DoctorForm, CreateDoctorDTO } from "../doctor.types";
import Modal from "../../../components/common/Modal";

interface AddEditDoctorModalProps {
  doctor: DoctorForm | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDoctorDTO) => void;
}

const initialFormData: CreateDoctorDTO = {
  fullName: "",
  email: "",
  phone: "",
  specialty: "",
  licenseNumber: "",
  yearsOfExperience: 0,
};

export default function AddEditDoctorModal({
  doctor,
  isOpen,
  onClose,
  onSubmit,
}: AddEditDoctorModalProps) {
  const [formData, setFormData] = useState<CreateDoctorDTO>(initialFormData);

  useEffect(() => {
    if (doctor) {
      setFormData({
        fullName: doctor.fullName,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty,
        licenseNumber: doctor.licenseNumber,
        yearsOfExperience: doctor.yearsOfExperience,
        // dateOfBirth: doctor.dateOfBirth,
        // gender: doctor.gender,
        // address: doctor.address,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [doctor, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  // const addQualification = () => {
  //   setFormData({
  //     ...formData,
  //     qualifications: [
  //       ...formData.qualifications,
  //       { degree: "", institution: "", year: new Date().getFullYear() },
  //     ],
  //   });
  // };

  // const removeQualification = (index: number) => {
  //   setFormData({
  //     ...formData,
  //     qualifications: formData.qualifications.filter((_, i) => i !== index),
  //   });
  // };

  // const updateQualification = (
  //   index: number,
  //   field: keyof DoctorQualification,
  //   value: string | number
  // ) => {
  //   const updated = [...formData.qualifications];
  //   updated[index] = { ...updated[index], [field]: value };
  //   setFormData({ ...formData, qualifications: updated });
  // };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={doctor ? "Edit Doctor" : "Add New Doctor"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Professional Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty *
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience *
              </label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearsOfExperience: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Authority
              </label>
              <input
                type="text"
                value={formData.licenseAuthority || ""}
                onChange={(e) =>
                  setFormData({ ...formData, licenseAuthority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry
              </label>
              <input
                type="date"
                value={formData.licenseExpiry || ""}
                onChange={(e) =>
                  setFormData({ ...formData, licenseExpiry: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultation Fee ($)
              </label>
              <input
                type="number"
                value={formData.consultationFee || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consultationFee: parseFloat(e.target.value) || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        {/* <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Qualifications
            </h3>
            <button
              type="button"
              onClick={addQualification}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="space-y-3">
            {formData.qualifications.map((qual, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="col-span-4">
                  <input
                    type="text"
                    value={qual.degree}
                    onChange={(e) =>
                      updateQualification(index, "degree", e.target.value)
                    }
                    placeholder="Degree"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={qual.institution}
                    onChange={(e) =>
                      updateQualification(index, "institution", e.target.value)
                    }
                    placeholder="Institution"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={qual.year}
                    onChange={(e) =>
                      updateQualification(
                        index,
                        "year",
                        parseInt(e.target.value) || new Date().getFullYear()
                      )
                    }
                    placeholder="Year"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="col-span-1 flex items-center">
                  <button
                    type="button"
                    onClick={() => removeQualification(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biography
          </label>
          <textarea
            value={formData.bio || ""}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            placeholder="Brief professional biography..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {doctor ? "Update Doctor" : "Add Doctor"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
