import { useState } from "react";
import type { DoctorForm } from "./doctor.types";

interface Props {
  onSubmit: (data: DoctorForm) => void;
}

export default function AddDoctorForm({ onSubmit }: Props) {
  const [form, setForm] = useState<Omit<DoctorForm, "id">>({
    fullName: "",
    specialty: "",
    yearsOfExperience: 0,
    licenseNumber: "",
    phone: "",
    email: "",
    status: "pending",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, id: crypto.randomUUID() });
      }}
    >
      <input name="name" placeholder="Full Name" onChange={handleChange} className="input" />
      <input name="email" placeholder="Email" onChange={handleChange} className="input" />
      <input name="phone" placeholder="Phone" onChange={handleChange} className="input" />
      <input name="licenseNumber" placeholder="Medical License No." onChange={handleChange} className="input" />

      <select name="specialty" onChange={handleChange} className="input">
        <option value="">Select Specialty</option>
        <option value="Cardiology">Cardiology</option>
        <option value="Neurology">Neurology</option>
      </select>

      <input
        type="number"
        name="experience"
        placeholder="Years of Experience"
        onChange={handleChange}
        className="input"
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
        Save Doctor
      </button>
    </form>
  );
}
