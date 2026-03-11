import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Name", accessor: "fertilizer_name" },
  { header: "Type", accessor: "type" },
  { header: "Brand", accessor: "brand" },
  {
    header: "Available",
    accessor: (item: any) => `${item.quantity_available} ${item.unit}`,
  },
  { header: "Supplier", accessor: "supplier" },
];

const formFields: FormField[] = [
  {
    name: "fertilizer_name",
    label: "Fertilizer Name",
    type: "text",
    required: true,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: ["Organic", "Inorganic"],
    required: true,
  },
  { name: "brand", label: "Brand", type: "text" },
  { name: "supplier", label: "Supplier", type: "text" },
  { name: "date_received", label: "Date Received", type: "date" },
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
    options: ["kg", "bags", "liters", "bottles"],
    required: true,
  },
  { name: "storage_location", label: "Storage Location", type: "text" },
  { name: "remarks", label: "Remarks", type: "text" },
];

export default function FertilizersInventory() {
  return (
    <GenericPage
      title="Fertilizers Inventory"
      tableName="fertilizers_inventory"
      primaryKey="fertilizer_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
