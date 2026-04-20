import type { Company } from "../../types/company";
import { formatDate } from "../../utils/format";

type CompanyDetailProps = {
  company: Company;
};

export function CompanyDetail({ company }: CompanyDetailProps) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{company.name}</h2>
      <p className="mt-1 text-sm text-slate-500">Creada: {formatDate(company.createdAt)}</p>
      <dl className="mt-4 grid gap-2 text-sm text-slate-700">
        <div>
          <dt className="font-medium">País</dt>
          <dd>{company.country}</dd>
        </div>
        <div>
          <dt className="font-medium">Departamento</dt>
          <dd>{company.department ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-medium">LinkedIn</dt>
          <dd className="truncate">{company.linkedinUrl}</dd>
        </div>
      </dl>
    </div>
  );
}
