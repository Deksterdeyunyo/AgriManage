import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Pesticide Name", accessor: "pesticide_name" },
  { header: "Type", accessor: "type" },
  { header: "Brand", accessor: "brand" },
  {
    header: "Available",
    accessor: (item: any) => `${item.quantity_available} ${item.unit}`,
  },
  { header: "Expiration", accessor: "expiration_date" },
];

const formFields: FormField[] = [
  {
    name: "pesticide_name",
    label: "Pesticide Name",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["Insecticide", "Fungicide", "Herbicide", "Rodenticide", "Other"],
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
    options: ["bottles", "liters", "kg", "sachets"],
    required: true,
  },
  { name: "storage_location", label: "Storage Location", type: "text" },
  { name: "remarks", label: "Remarks", type: "text" },
];

export default function PesticidesInventory() {
  return (
    <GenericPage
      title="Pesticides Inventory"
      tableName="pesticides_inventory"
      primaryKey="pesticide_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
