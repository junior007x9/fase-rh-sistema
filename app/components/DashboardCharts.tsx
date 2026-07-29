// Arquivo: app/components/DashboardCharts.tsx
"use client";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CORES_VINCULOS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
const CORES_AUSENCIAS = ["#ef4444", "#f97316", "#eab308", "#06b6d4"];

export default function DashboardCharts({ vinculosData, ausenciasData }: { vinculosData: any[], ausenciasData: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      
      {/* Gráfico 1: Distribuição de Vínculos */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Distribuição de Servidores por Vínculo
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vinculosData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {vinculosData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES_VINCULOS[index % CORES_VINCULOS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} Servidores`, 'Quantidade']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico 2: Tipos de Afastamentos */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          Cenário de Ausências e Licenças
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ausenciasData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} name="Qtd. Afastamentos">
                {ausenciasData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES_AUSENCIAS[index % CORES_AUSENCIAS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}