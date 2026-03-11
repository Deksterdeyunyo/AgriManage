import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Full Name", accessor: "full_name" },
  { header: "Barangay", accessor: "barangay" },
  { header: "Municipality", accessor: "municipality" },
  { header: "Contact Number", accessor: "contact_number" },
  { header: "Farmer Group", accessor: "farmer_group" },
];

const formFields: FormField[] = [
  { name: "full_name", label: "Full Name", type: "text", required: true },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female", "Other"],
  },
  { name: "barangay", label: "Barangay", type: "text", required: true },
  { name: "municipality", label: "Municipality", type: "text", required: true },
  { name: "contact_number", label: "Contact Number", type: "text" },
  { name: "farm_size", label: "Farm Size (Hectares)", type: "number" },
  { name: "farmer_group", label: "Farmer Group / Association", type: "text" },
  { name: "date_registered", label: "Date Registered", type: "date" },
  { name: "remarks", label: "Remarks", type: "text" },
];

export default function Recipients() {
  return (
    <GenericPage
      title="Recipients (Farmers / Beneficiaries)"
      tableName="recipients"
      primaryKey="recipient_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
