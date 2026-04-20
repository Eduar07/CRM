import { Link } from "react-router-dom";
import type { Company } from "../../types/company";

type CompanyTableProps = {
  items: Company[];
};

export function CompanyTable({ items }: CompanyTableProps) {
  return (
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
              <td className="max-w-[220px] truncate py-3 pr-4">{company.linkedinUrl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
