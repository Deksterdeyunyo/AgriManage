import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Name", accessor: "seed_name" },
  { header: "Variety", accessor: "seed_variety" },
  { header: "Category", accessor: "category" },
  {
    header: "Available",
    accessor: (item: any) => `${item.quantity_available} ${item.unit}`,
  },
  { header: "Expiration", accessor: "expiration_date" },
];

const formFields: FormField[] = [
  { name: "seed_name", label: "Seed Name", type: "text", required: true },
  { name: "seed_variety", label: "Variety", type: "text" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Vegetable", "Rice", "Corn", "Fruit", "Other"],
    required: true,
  },
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
    options: ["packets", "kg", "grams", "sacks"],
    required: true,
  },
  { name: "storage_location", label: "Storage Location", type: "text" },
  { name: "remarks", label: "Remarks", type: "text" },
];

export default function SeedsInventory() {
  return (
    <GenericPage
      title="Seeds Inventory"
      tableName="seeds_inventory"
      primaryKey="seed_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
