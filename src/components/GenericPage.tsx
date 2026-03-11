import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import DataTable from "./DataTable";
import Modal from "./Modal";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
  required?: boolean;
}

interface GenericPageProps {
  title: string;
  tableName: string;
  primaryKey: string;
  columns: {
    header: string;
    accessor: string | ((item: any) => React.ReactNode);
  }[];
  formFields: FormField[];
}

export default function GenericPage({
  title,
  tableName,
  primaryKey,
  columns,
  formFields,
}: GenericPageProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const fetchData = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: result, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tableName]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;

    setLoading(true);
    if (editingItem) {
      const { error } = await supabase
        .from(tableName)
        .update(formData)
        .eq(primaryKey, editingItem[primaryKey]);
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.from(tableName).insert([formData]);
      if (error) setError(error.message);
    }

    await fetchData();
    handleCloseModal();
  };

  const handleDelete = async (item: any) => {
    if (!configured) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      setLoading(true);
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(primaryKey, item[primaryKey]);
      if (error) setError(error.message);
      await fetchData();
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  if (!configured) {
    return (
      <div className="p-8 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
        <h2 className="text-xl font-bold mb-2">Supabase Not Configured</h2>
        <p>
          Please configure your Supabase URL and Anon Key in the environment
          variables to use this feature.
        </p>
        <p className="mt-2 text-sm">
          Check the <code>.env.example</code> file and the{" "}
          <code>supabase-schema.sql</code> file to set up your database.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center">
        <Search className="h-5 w-5 text-gray-400 mr-3" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      {loading && data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? `Edit ${title}` : `Add New ${title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>
          ))}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
