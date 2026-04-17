import { useEffect, useMemo, useState } from "react";
import { EmptyState, Loader } from "../components/common";
import { useCompanies } from "../hooks/useCompanies";
import { listContactsByCompany } from "../services/contact.service";
import type { Contact } from "../types/contact";

export function ContactsPage() {
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companyId, companies]);

  useEffect(() => {
    if (!companyId) {
      setContacts([]);
      return;
    }

    let active = true;
    setLoadingContacts(true);
    setContactsError(null);

    listContactsByCompany(companyId)
      .then((items) => {
        if (active) {
          setContacts(items);
        }
      })
      .catch((error) => {
        if (active) {
          setContactsError(error instanceof Error ? error.message : "No se pudieron cargar los contactos");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingContacts(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyId]);

  const selectedCompany = useMemo(() => {
    return companies.find((company) => company.id === companyId);
  }, [companies, companyId]);

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Contactos</h1>
        <select
          className="w-full max-w-sm rounded-2xl border px-4 py-2 text-sm"
          value={companyId}
          onChange={(event) => setCompanyId(event.target.value)}
          disabled={loadingCompanies || companies.length === 0}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {loadingCompanies ? <Loader text="Cargando empresas..." /> : null}
      {companiesError ? <EmptyState title="No se pudieron cargar las empresas" description={companiesError} /> : null}

      {!loadingCompanies && !companiesError && !selectedCompany ? (
        <EmptyState title="Sin empresa seleccionada" description="Selecciona una empresa para ver sus contactos." />
      ) : null}

      {loadingContacts ? <Loader text="Cargando contactos..." /> : null}
      {contactsError ? <EmptyState title="No se pudieron cargar los contactos" description={contactsError} /> : null}

      {!loadingContacts && !contactsError && selectedCompany && contacts.length === 0 ? (
        <EmptyState
          title="Sin contactos"
          description={`La empresa ${selectedCompany.name} todavía no tiene contactos registrados.`}
        />
      ) : null}

      {!loadingContacts && !contactsError && contacts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-3 pr-4">Nombre</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Rol</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4 font-medium">{contact.name}</td>
                  <td className="py-3 pr-4">{contact.email}</td>
                  <td className="py-3 pr-4">{contact.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
