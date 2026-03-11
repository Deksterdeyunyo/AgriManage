import React, { useEffect, useState } from "react";
import {
  Sprout,
  FlaskConical,
  Syringe,
  BugOff,
  Users,
  Truck,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    seeds: 0,
    fertilizers: 0,
    vet: 0,
    pesticides: 0,
    recipients: 0,
    distributions: 0,
  });
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const fetchStats = async () => {
      if (!configured) {
        setLoading(false);
        return;
      }

      try {
        const [
          { count: seeds },
          { count: fertilizers },
          { count: vet },
          { count: pesticides },
          { count: recipients },
          { count: distributions },
        ] = await Promise.all([
          supabase
            .from("seeds_inventory")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("fertilizers_inventory")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("vet_chemicals")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("pesticides_inventory")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("recipients")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("distribution_records")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          seeds: seeds || 0,
          fertilizers: fertilizers || 0,
          vet: vet || 0,
          pesticides: pesticides || 0,
          recipients: recipients || 0,
          distributions: distributions || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Seeds Types",
      value: stats.seeds,
      icon: Sprout,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Fertilizers",
      value: stats.fertilizers,
      icon: FlaskConical,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Vet & Chemicals",
      value: stats.vet,
      icon: Syringe,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Pesticides",
      value: stats.pesticides,
      icon: BugOff,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Recipients",
      value: stats.recipients,
      icon: Users,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Distributions",
      value: stats.distributions,
      icon: Truck,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  const chartData = [
    { name: "Seeds", count: stats.seeds },
    { name: "Fertilizers", count: stats.fertilizers },
    { name: "Vet", count: stats.vet },
    { name: "Pesticides", count: stats.pesticides },
  ];

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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Loading statistics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center"
                >
                  <div className={`p-4 rounded-full mr-4 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Inventory Breakdown
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
