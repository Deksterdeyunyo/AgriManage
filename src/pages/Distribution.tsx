import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

export default function Distribution() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [recipients, setRecipients] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [distributionDate, setDistributionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [distributedBy, setDistributedBy] = useState("");
  const [program, setProgram] = useState("");
  const [remarks, setRemarks] = useState("");

  // Items state
  const [items, setItems] = useState<any[]>([]);
  const [itemType, setItemType] = useState("seeds_inventory");
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);

  const configured = isSupabaseConfigured();

  const fetchData = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);

    // Fetch distribution records with recipient details
    const { data: distData, error: distError } = await supabase
      .from("distribution_records")
      .select(
        `
        *,
        recipients (full_name, barangay)
      `,
      )
      .order("created_at", { ascending: false });

    if (distError) {
      setError(distError.message);
    } else {
      setRecords(distData || []);
    }

    // Fetch recipients for the dropdown
    const { data: recData } = await supabase
      .from("recipients")
      .select("*")
      .order("full_name");
    if (recData) setRecipients(recData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch available items when itemType changes
  useEffect(() => {
    const fetchInventory = async () => {
      if (!configured || !itemType) return;
      const { data } = await supabase
        .from(itemType)
        .select("*")
        .gt("quantity_available", 0);

      setAvailableItems(data || []);
      setSelectedItem("");
    };
    fetchInventory();
  }, [itemType]);

  const handleAddItem = () => {
    if (!selectedItem || quantity <= 0) return;

    const itemDetails = availableItems.find((i) => {
      const idField =
        itemType === "seeds_inventory"
          ? "seed_id"
          : itemType === "fertilizers_inventory"
            ? "fertilizer_id"
            : itemType === "vet_chemicals"
              ? "vet_id"
              : "pesticide_id";
      return i[idField] === selectedItem;
    });

    if (!itemDetails) return;

    if (quantity > itemDetails.quantity_available) {
      alert(`Only ${itemDetails.quantity_available} available in stock.`);
      return;
    }

    const nameField =
      itemType === "seeds_inventory"
        ? "seed_name"
        : itemType === "fertilizers_inventory"
          ? "fertilizer_name"
          : itemType === "vet_chemicals"
            ? "product_name"
            : "pesticide_name";

    const idField =
      itemType === "seeds_inventory"
        ? "seed_id"
        : itemType === "fertilizers_inventory"
          ? "fertilizer_id"
          : itemType === "vet_chemicals"
            ? "vet_id"
            : "pesticide_id";

    const typeLabel =
      itemType === "seeds_inventory"
        ? "Seed"
        : itemType === "fertilizers_inventory"
          ? "Fertilizer"
          : itemType === "vet_chemicals"
            ? "Vet"
            : "Pesticide";

    setItems([
      ...items,
      {
        item_type: typeLabel,
        table_name: itemType,
        item_id: itemDetails[idField],
        item_name: itemDetails[nameField],
        quantity_given: quantity,
        unit: itemDetails.unit,
        available: itemDetails.quantity_available,
      },
    ]);

    setSelectedItem("");
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    if (!selectedRecipient) {
      alert("Please select a recipient");
      return;
    }
    if (items.length === 0) {
      alert("Please add at least one item to distribute");
      return;
    }

    setLoading(true);

    try {
      // 1. Create distribution record
      const { data: distRecord, error: distError } = await supabase
        .from("distribution_records")
        .insert([
          {
            recipient_id: selectedRecipient,
            distribution_date: distributionDate,
            distributed_by: distributedBy,
            program: program,
            remarks: remarks,
          },
        ])
        .select()
        .single();

      if (distError) throw distError;

      // 2. Create log entries and update inventory
      for (const item of items) {
        // Insert log
        const { error: logError } = await supabase
          .from("distribution_log")
          .insert([
            {
              distribution_id: distRecord.distribution_id,
              item_type: item.item_type,
              item_id: item.item_id,
              item_name: item.item_name,
              quantity_given: item.quantity_given,
              unit: item.unit,
            },
          ]);

        if (logError) throw logError;

        // Update inventory quantity
        const idField =
          item.table_name === "seeds_inventory"
            ? "seed_id"
            : item.table_name === "fertilizers_inventory"
              ? "fertilizer_id"
              : item.table_name === "vet_chemicals"
                ? "vet_id"
                : "pesticide_id";

        const { error: updateError } = await supabase
          .from(item.table_name)
          .update({ quantity_available: item.available - item.quantity_given })
          .eq(idField, item.item_id);

        if (updateError) throw updateError;
      }

      await fetchData();
      setIsModalOpen(false);
      // Reset form
      setSelectedRecipient("");
      setItems([]);
      setProgram("");
      setRemarks("");
      setDistributedBy("");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Date", accessor: "distribution_date" },
    {
      header: "Recipient",
      accessor: (item: any) => item.recipients?.full_name || "Unknown",
    },
    {
      header: "Barangay",
      accessor: (item: any) => item.recipients?.barangay || "Unknown",
    },
    { header: "Program", accessor: "program" },
    { header: "Distributed By", accessor: "distributed_by" },
  ];

  const filteredRecords = records.filter(
    (item) =>
      item.recipients?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.program?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!configured) {
    return (
      <div className="p-8 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
        <h2 className="text-xl font-bold mb-2">Supabase Not Configured</h2>
        <p>
          Please configure your Supabase URL and Anon Key to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Distribution Records
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Distribution
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
          placeholder="Search by recipient or program..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 outline-none text-gray-700"
        />
      </div>

      {loading && records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <DataTable data={filteredRecords} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Distribution"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Recipient *
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Recipient</option>
                {recipients.map((r) => (
                  <option key={r.recipient_id} value={r.recipient_id}>
                    {r.full_name} ({r.barangay})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Program
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. Seed Subsidy"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Distributed By
              </label>
              <input
                type="text"
                value={distributedBy}
                onChange={(e) => setDistributedBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">
              Add Items
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
              >
                <option value="seeds_inventory">Seeds</option>
                <option value="fertilizers_inventory">Fertilizers</option>
                <option value="vet_chemicals">Vet & Chemicals</option>
                <option value="pesticides_inventory">Pesticides</option>
              </select>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-2"
              >
                <option value="">Select Item</option>
                {availableItems.map((item) => {
                  const idField =
                    itemType === "seeds_inventory"
                      ? "seed_id"
                      : itemType === "fertilizers_inventory"
                        ? "fertilizer_id"
                        : itemType === "vet_chemicals"
                          ? "vet_id"
                          : "pesticide_id";
                  const nameField =
                    itemType === "seeds_inventory"
                      ? "seed_name"
                      : itemType === "fertilizers_inventory"
                        ? "fertilizer_name"
                        : itemType === "vet_chemicals"
                          ? "product_name"
                          : "pesticide_name";
                  return (
                    <option key={item[idField]} value={item[idField]}>
                      {item[nameField]} (Avail: {item.quantity_available}{" "}
                      {item.unit})
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-24"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Add
              </button>
            </div>

            {items.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        <span className="font-medium">{item.item_name}</span> (
                        {item.item_type})
                      </span>
                      <div className="flex items-center gap-4">
                        <span>
                          {item.quantity_given} {item.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Distribution"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
