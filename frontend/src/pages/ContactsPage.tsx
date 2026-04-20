import { useEffect, useMemo, useState } from "react";
import { EmptyState, Loader } from "../components/common";
import { useCompanies } from "../hooks/useCompanies";
import { listContactsByCompany } from "../services/contact.service";
import type { Contact } from "../types/contact";

const ROLE_LABELS: Record<string, string> = {
  HR: "Recursos Humanos", TALENT_MANAGER: "Talent Manager",
  CTO: "CTO", CEO: "CEO",
};

export function ContactsPage() {
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId && companies.length > 0) setCompanyId(companies[0].id);
  }, [companyId, companies]);

  useEffect(() => {
    if (!companyId) { setContacts([]); return; }
    let active = true;
    setLoadingContacts(true); setContactsError(null);
    listContactsByCompany(companyId)
      .then((items) => { if (active) setContacts(items); })
      .catch((e) => { if (active) setContactsError(e instanceof Error ? e.message : "Error"); })
      .finally(() => { if (active) setLoadingContacts(false); });
    return () => { active = false; };
  }, [companyId]);

  const selectedCompany = useMemo(() => companies.find((c) => c.id === companyId), [companies, companyId]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900">Contactos</h1>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
            disabled={loadingCompanies || companies.length === 0}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none max-w-xs">
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6">
        {loadingCompanies && <Loader text="Cargando empresas..." />}
        {companiesError && <EmptyState title="Error" description={companiesError} />}
        {loadingContacts && <Loader text="Cargando contactos..." />}
        {contactsError && <EmptyState title="Error" description={contactsError} />}
        {!loadingContacts && !contactsError && selectedCompany && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">{selectedCompany.name}</h2>
              <p className="text-xs text-gray-500">{contacts.length} contactos</p>
            </div>
            {contacts.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">Sin contactos registrados</div>
            ) : (
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-100">
                  <tr>
                    {["Nombre","Email","Rol","Teléfono"].map(h => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{c.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{c.email}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{ROLE_LABELS[c.role] ?? c.role}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
