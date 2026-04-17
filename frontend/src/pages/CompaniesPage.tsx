import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCompanies } from "../services/company.service";
import type { Company } from "../types/company";

export function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);

  useEffect(() => {
    listCompanies().then(setItems).catch(console.error);
  }, []);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Empresas</h1>
        <input
          className="w-full max-w-xs rounded-2xl border px-4 py-2 text-sm"
          placeholder="Buscar..."
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-3 pr-4">Nombre</th>
              <th className="py-3 pr-4">País</th>
              <th className="py-3 pr-4">Departamento</th>
              <th className="py-3 pr-4">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {items.map((company) => (
              <tr key={company.id} className="border-b last:border-b-0">
                <td className="py-3 pr-4 font-medium">
                  <Link className="text-blue-600 hover:underline" to={`/companies/${company.id}`}>
                    {company.name}
                  </Link>
                </td>
                <td className="py-3 pr-4">{company.country}</td>
                <td className="py-3 pr-4">{company.department ?? "-"}</td>
                <td className="py-3 pr-4 truncate max-w-[220px]">{company.linkedinUrl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}