import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Product Name", accessor: "product_name" },
  { header: "Category", accessor: "category" },
  { header: "Brand", accessor: "brand" },
  {
    header: "Available",
    accessor: (item: any) => `${item.quantity_available} ${item.unit}`,
  },
  { header: "Expiration", accessor: "expiration_date" },
];

const formFields: FormField[] = [
  { name: "product_name", label: "Product Name", type: "text", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Deworming", "Anti-Rabies", "Vitamins", "Antibiotics", "Other"],
    required: true,
  },
  { name: "brand", label: "Brand", type: "text" },
  { name: "supplier", label: "Supplier", type: "text" },
  { name: "date_received", label: "Date Received", type: "date" },
  { name: "expiration_date", label: "Expiration Date", type: "date" },
  {
    name: "quantity_received",
    label: "Quantity Received",
    type: "number",
    required: true,
  },
  {
    name: "quantity_available",
    label: "Quantity Available",
    type: "number",
    required: true,
  },
  {
    name: "unit",
    label: "Unit",
    type: "select",
    options: ["bottles", "vials", "boxes", "pcs"],
    required: true,
  },
  { name: "storage_location", label: "Storage Location", type: "text" },
  { name: "remarks", label: "Remarks", type: "text" },
];

export default function VetChemicals() {
  return (
    <GenericPage
      title="Veterinary & Chemicals"
      tableName="vet_chemicals"
      primaryKey="vet_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
