import { useEffect, useMemo, useState } from "react";
import { EmptyState, Loader } from "../components/common";
import { useCompanies } from "../hooks/useCompanies";
import { listContactsByCompany } from "../services/contact.service";
import { listEmailsByContact } from "../services/email.service";
import type { Contact } from "../types/contact";
import type { EmailRecord } from "../types/email";
import { formatDateTime } from "../utils/format";

export function EmailsPage() {
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactId, setContactId] = useState("");
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companyId, companies]);

  useEffect(() => {
    if (!companyId) {
      setContacts([]);
      setContactId("");
      return;
    }

    let active = true;
    setLoadingContacts(true);
    setContactsError(null);

    listContactsByCompany(companyId)
      .then((items) => {
        if (!active) {
          return;
        }

        setContacts(items);
        setContactId((prev) => (prev && items.some((item) => item.id === prev) ? prev : items[0]?.id ?? ""));
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

  useEffect(() => {
    if (!contactId) {
      setEmails([]);
      return;
    }

    let active = true;
    setLoadingEmails(true);
    setEmailsError(null);

    listEmailsByContact(contactId)
      .then((items) => {
        if (active) {
          setEmails(items);
        }
      })
      .catch((error) => {
        if (active) {
          setEmailsError(error instanceof Error ? error.message : "No se pudieron cargar los emails");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingEmails(false);
        }
      });

    return () => {
      active = false;
    };
  }, [contactId]);

  const selectedContact = useMemo(() => contacts.find((contact) => contact.id === contactId), [contactId, contacts]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">Emails</h1>
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

        <select
          className="w-full max-w-sm rounded-2xl border px-4 py-2 text-sm"
          value={contactId}
          onChange={(event) => setContactId(event.target.value)}
          disabled={loadingContacts || contacts.length === 0}
        >
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name} - {contact.email}
            </option>
          ))}
        </select>
      </div>

      {loadingCompanies ? <Loader text="Cargando empresas..." /> : null}
      {companiesError ? <EmptyState title="No se pudieron cargar las empresas" description={companiesError} /> : null}

      {loadingContacts ? <Loader text="Cargando contactos..." /> : null}
      {contactsError ? <EmptyState title="No se pudieron cargar los contactos" description={contactsError} /> : null}

      {loadingEmails ? <Loader text="Cargando historial de emails..." /> : null}
      {emailsError ? <EmptyState title="No se pudieron cargar los emails" description={emailsError} /> : null}

      {!loadingEmails && !emailsError && !selectedContact ? (
        <EmptyState title="Sin contacto seleccionado" description="Selecciona un contacto para ver su historial de emails." />
      ) : null}

      {!loadingEmails && !emailsError && selectedContact && emails.length === 0 ? (
        <EmptyState
          title="Sin historial"
          description={`No hay emails registrados para ${selectedContact.name}.`}
        />
      ) : null}

      {!loadingEmails && !emailsError && emails.length > 0 ? (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {emails.map((email) => (
              <div key={email.id} className="rounded-2xl border p-4">
                <p className="font-medium text-slate-900">Asunto: {email.subject}</p>
                <p className="mt-1 text-sm text-slate-600">Para: {email.toEmail}</p>
                <p className="mt-1 text-sm text-slate-600">Estado: {email.status}</p>
                <p className="mt-1 text-sm text-slate-500">Enviado: {formatDateTime(email.sentAt)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
