import React from "react";
import GenericPage, { FormField } from "../components/GenericPage";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Username", accessor: "username" },
  { header: "Role", accessor: "role" },
  {
    header: "Date Created",
    accessor: (item: any) => new Date(item.date_created).toLocaleDateString(),
  },
];

const formFields: FormField[] = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "username", label: "Username", type: "text", required: true },
  { name: "password", label: "Password", type: "text", required: true },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: ["Admin", "Staff"],
    required: true,
  },
];

export default function Users() {
  return (
    <GenericPage
      title="User Management"
      tableName="users"
      primaryKey="user_id"
      columns={columns}
      formFields={formFields}
    />
  );
}
