import type { Contact } from "../../types/contact";

type CompanyContactsProps = {
  contacts: Contact[];
};

export function CompanyContacts({ contacts }: CompanyContactsProps) {
  return (
    <div className="space-y-2">
      {contacts.map((contact) => (
        <div key={contact.id} className="rounded-2xl border p-3">
          <p className="font-medium">{contact.name}</p>
          <p className="text-sm text-slate-500">{contact.role} - {contact.email}</p>
        </div>
      ))}
    </div>
  );
}
