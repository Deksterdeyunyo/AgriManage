import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { FileText, Download, Printer, Filter, Edit, Trash2 } from "lucide-react";
import Modal from "../components/Modal";

export default function Reports() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState<string>("All");
  const configured = isSupabaseConfigured();

  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  const fetchLogs = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("distribution_log")
      .select(
        `
        *,
        distribution_records (
          distribution_date,
          program,
          recipients (full_name, barangay)
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [configured]);

  const uniqueBarangays = Array.from(
    new Set(
      logs.map(
        (log) => log.distribution_records?.recipients?.barangay || "Unknown Barangay"
      )
    )
  ).sort();

  const filteredLogs =
    selectedBarangay === "All"
      ? logs
      : logs.filter(
          (log) =>
            (log.distribution_records?.recipients?.barangay || "Unknown Barangay") ===
            selectedBarangay
        );

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      "Date",
      "Recipient",
      "Barangay",
      "Program",
      "Item Type",
      "Item Name",
      "Quantity",
      "Unit",
    ];
    const csvData = filteredLogs.map((log) => [
      log.distribution_records?.distribution_date,
      log.distribution_records?.recipients?.full_name,
      log.distribution_records?.recipients?.barangay,
      log.distribution_records?.program,
      log.item_type,
      log.item_name,
      log.quantity_given,
      log.unit,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell || ""}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `distribution_report_${selectedBarangay.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (log: any) => {
    if (!window.confirm("Are you sure you want to delete this record? This will restore the item quantity to inventory.")) return;
    
    setLoading(true);
    try {
      // 1. Delete the log
      const { error: deleteError } = await supabase
        .from("distribution_log")
        .delete()
        .eq("log_id", log.log_id);
        
      if (deleteError) throw deleteError;
      
      // 2. Restore inventory
      const tableName = log.item_type === "Seed" ? "seeds_inventory" :
                        log.item_type === "Fertilizer" ? "fertilizers_inventory" :
                        log.item_type === "Vet" ? "vet_chemicals" : "pesticides_inventory";
                        
      const idField = log.item_type === "Seed" ? "seed_id" :
                      log.item_type === "Fertilizer" ? "fertilizer_id" :
                      log.item_type === "Vet" ? "vet_id" : "pesticide_id";
                      
      // Get current inventory
      const { data: itemData } = await supabase
        .from(tableName)
        .select("quantity_available")
        .eq(idField, log.item_id)
        .single();
        
      if (itemData) {
        await supabase
          .from(tableName)
          .update({ quantity_available: itemData.quantity_available + log.quantity_given })
          .eq(idField, log.item_id);
      }
      
      await fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete record.");
      setLoading(false);
    }
  };

  const openEditModal = (log: any) => {
    setEditingLog(log);
    setEditQuantity(log.quantity_given);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    
    setLoading(true);
    try {
      const quantityDiff = editQuantity - editingLog.quantity_given;
      
      // Update log
      const { error: updateError } = await supabase
        .from("distribution_log")
        .update({ quantity_given: editQuantity })
        .eq("log_id", editingLog.log_id);
        
      if (updateError) throw updateError;
      
      // Update inventory
      if (quantityDiff !== 0) {
        const tableName = editingLog.item_type === "Seed" ? "seeds_inventory" :
                          editingLog.item_type === "Fertilizer" ? "fertilizers_inventory" :
                          editingLog.item_type === "Vet" ? "vet_chemicals" : "pesticides_inventory";
                          
        const idField = editingLog.item_type === "Seed" ? "seed_id" :
                        editingLog.item_type === "Fertilizer" ? "fertilizer_id" :
                        editingLog.item_type === "Vet" ? "vet_id" : "pesticide_id";
                        
        const { data: itemData } = await supabase
          .from(tableName)
          .select("quantity_available")
          .eq(idField, editingLog.item_id)
          .single();
          
        if (itemData) {
          await supabase
            .from(tableName)
            .update({ quantity_available: itemData.quantity_available - quantityDiff })
            .eq(idField, editingLog.item_id);
        }
      }
      
      await fetchLogs();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update record.");
      setLoading(false);
    }
  };

  // Group logs by barangay
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const brgy = log.distribution_records?.recipients?.barangay || 'Unknown Barangay';
    if (!acc[brgy]) {
      acc[brgy] = [];
    }
    acc[brgy].push(log);
    return acc;
  }, {} as Record<string, any[]>);

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
      {/* Screen View */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Distribution Reports
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <select
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 p-0 cursor-pointer"
              >
                <option value="All">All Barangays</option>
                {uniqueBarangays.map((brgy) => (
                  <option key={brgy} value={brgy}>
                    {brgy}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handlePrint}
              disabled={filteredLogs.length === 0}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Printer className="h-5 w-5 mr-2" />
              Print Report
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download className="h-5 w-5 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-800">
                {selectedBarangay === "All" ? "All Distributions" : `Distributions in ${selectedBarangay}`}
              </h2>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {filteredLogs.length} records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading report data...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No distribution records found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.distribution_records?.distribution_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {log.distribution_records?.recipients?.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.distribution_records?.recipients?.barangay}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.distribution_records?.program}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          {log.item_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.quantity_given} {log.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(log)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(log)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Print View (Only rendered during print) */}
      <div className="hidden print:block w-full bg-white text-black">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Agricultural Distribution Report</h1>
          <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
          {selectedBarangay !== "All" && (
            <p className="text-lg font-semibold mt-2">Filtered by Barangay: {selectedBarangay}</p>
          )}
        </div>

        {Object.entries(groupedLogs).sort(([a], [b]) => a.localeCompare(b)).map(([barangay, barangayLogs]) => (
          <div key={barangay} className="mb-12 page-break-inside-avoid">
            <h2 className="text-xl font-bold bg-gray-100 p-2 border-b-2 border-gray-800 mb-4">
              Barangay: {barangay}
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Recipient</th>
                  <th className="py-2 pr-4 font-semibold">Program</th>
                  <th className="py-2 pr-4 font-semibold">Item Category</th>
                  <th className="py-2 pr-4 font-semibold">Item Name</th>
                  <th className="py-2 font-semibold text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {(barangayLogs as any[]).map((log) => (
                  <tr key={log.log_id} className="border-b border-gray-200">
                    <td className="py-2 pr-4 text-sm">{log.distribution_records?.distribution_date}</td>
                    <td className="py-2 pr-4 text-sm font-medium">{log.distribution_records?.recipients?.full_name}</td>
                    <td className="py-2 pr-4 text-sm">{log.distribution_records?.program || '-'}</td>
                    <td className="py-2 pr-4 text-sm">{log.item_type}</td>
                    <td className="py-2 pr-4 text-sm">{log.item_name}</td>
                    <td className="py-2 text-sm text-right">{log.quantity_given} {log.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-right text-sm font-bold">
              Total distributions in {barangay}: {(barangayLogs as any[]).length}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Distribution Record"
      >
        {editingLog && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1"><strong>Recipient:</strong> {editingLog.distribution_records?.recipients?.full_name}</p>
              <p className="text-sm text-gray-600 mb-1"><strong>Item:</strong> {editingLog.item_name} ({editingLog.item_type})</p>
              <p className="text-sm text-gray-600"><strong>Date:</strong> {editingLog.distribution_records?.distribution_date}</p>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Quantity Given ({editingLog.unit})
              </label>
              <input
                type="number"
                min="1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Changing this will automatically update the available inventory.
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
