import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  UserPlus, Mail, Calendar, ArrowLeft, Building2, Globe, Linkedin,
  MapPin, Phone, AtSign, Pencil, Trash2, Hash, FileText, User, BadgeInfo,
} from "lucide-react";
import { EmptyState, Loader } from "../components/common";
import { Modal } from "../components/ui/Modal";
import { useCompanyDetail } from "../hooks/useCompanyDetail";
import { useAuth } from "../hooks/useAuth";
import { createContact, listContactsByCompany } from "../services/contact.service";
import { sendProspectionEmail } from "../services/email.service";
import { scheduleMeeting } from "../services/meeting.service";
import { updateCompany, deleteCompany } from "../services/company.service";
import type { Contact, ContactRole } from "../types/contact";
import type { UpdateCompanyRequest, ContactStatus } from "../types/company";

const ROLES: { value: ContactRole; label: string }[] = [
  { value: "CEO", label: "CEO" },
  { value: "CTO", label: "CTO" },
  { value: "TALENT_MANAGER", label: "Talent Manager" },
  { value: "HR", label: "Recursos Humanos" },
];

const STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "Nueva", label: "Nueva" },
  { value: "Contactada", label: "Contactada" },
  { value: "En proceso", label: "En proceso" },
  { value: "Cerrada", label: "Cerrada" },
];

const CLS = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

type Toast = { msg: string; type: "success" | "error" } | null;

function splitList(val: string | null | undefined): string[] {
  if (!val) return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

export function CompanyDetailPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { company, loading, error } = useCompanyDetail(id);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [toast, setToast] = useState<Toast>(null);

  const [modalContact, setModalContact] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [modalMeeting, setModalMeeting] = useState(false);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);

  const [contactForm, setContactForm] = useState({ name: "", email: "", role: "CEO" as ContactRole });
  const [savingContact, setSavingContact] = useState(false);

  const [emailForm, setEmailForm] = useState({ contactId: "" });
  const [sendingEmail, setSendingEmail] = useState(false);

  const [meetingForm, setMeetingForm] = useState({
    contactId: "", title: "", description: "", startTime: "", endTime: "", meetingLink: "",
  });
  const [savingMeeting, setSavingMeeting] = useState(false);

  const [editForm, setEditForm] = useState<UpdateCompanyRequest>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    listContactsByCompany(id).then(setContacts).catch(() => setContacts([]));
  }, [id]);

  // Populate edit form when company loads
  useEffect(() => {
    if (!company) return;
    setEditForm({
      name: company.name ?? "",
      industry: company.industry ?? "",
      size: company.size ?? "",
      website: company.website ?? "",
      country: company.country ?? "",
      department: company.department ?? "",
      assignedTo: company.assignedTo ?? "",
      contactStatus: company.contactStatus ?? "Nueva",
      nit: company.nit ?? "",
      phones: company.phones ?? "",
      emails: company.emails ?? "",
      address: company.address ?? "",
      legalRep: company.legalRep ?? "",
      companyState: company.companyState ?? "",
      description: company.description ?? "",
    });
  }, [company]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Contact ─────────────────────────────────────────────────────────────────
  const submitContact = async () => {
    if (!id || !contactForm.name.trim() || !contactForm.email.trim()) {
      showToast("Nombre y email son obligatorios", "error"); return;
    }
    setSavingContact(true);
    try {
      await createContact({ companyId: id, name: contactForm.name, email: contactForm.email, role: contactForm.role });
      showToast("Contacto registrado");
      setModalContact(false);
      setContacts(await listContactsByCompany(id));
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al guardar contacto", "error");
    } finally { setSavingContact(false); }
  };

  // ── Email ────────────────────────────────────────────────────────────────────
  const openEmailModal = () => {
    if (contacts.length === 0) { showToast("Primero registra un contacto", "error"); return; }
    setEmailForm({ contactId: contacts[0].id });
    setModalEmail(true);
  };

  const submitEmail = async () => {
    if (!id || !emailForm.contactId) { showToast("Selecciona un contacto", "error"); return; }
    setSendingEmail(true);
    try {
      await sendProspectionEmail({ companyId: id, contactId: emailForm.contactId });
      showToast("Email enviado");
      setModalEmail(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al enviar email", "error");
    } finally { setSendingEmail(false); }
  };

  // ── Meeting ──────────────────────────────────────────────────────────────────
  const openMeetingModal = () => {
    if (contacts.length === 0) { showToast("Primero registra un contacto", "error"); return; }
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    const toLocal = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    };
    setMeetingForm({ contactId: contacts[0].id, title: "", description: "", startTime: toLocal(now), endTime: toLocal(later), meetingLink: "" });
    setModalMeeting(true);
  };

  const submitMeeting = async () => {
    if (!id || !userId || !meetingForm.contactId || !meetingForm.title.trim()) {
      showToast("Completa todos los campos obligatorios", "error"); return;
    }
    if (new Date(meetingForm.endTime) <= new Date(meetingForm.startTime)) {
      showToast("La hora de fin debe ser posterior a la de inicio", "error"); return;
    }
    setSavingMeeting(true);
    try {
      await scheduleMeeting({
        companyId: id, contactId: meetingForm.contactId, userId,
        title: meetingForm.title, description: meetingForm.description || undefined,
        startTime: new Date(meetingForm.startTime).toISOString(),
        endTime: new Date(meetingForm.endTime).toISOString(),
        meetingLink: meetingForm.meetingLink || undefined,
      });
      showToast("Reunión agendada");
      setModalMeeting(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al agendar", "error");
    } finally { setSavingMeeting(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const submitEdit = async () => {
    if (!id) return;
    setSavingEdit(true);
    try {
      await updateCompany(id, editForm);
      showToast("Empresa actualizada");
      setModalEdit(false);
      // Refresh page data
      window.location.reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al actualizar", "error");
    } finally { setSavingEdit(false); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const submitDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteCompany(id);
      navigate("/companies");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Error al eliminar", "error");
      setModalDelete(false);
    } finally { setDeleting(false); }
  };

  const ef = (field: keyof UpdateCompanyRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setEditForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <Link to="/companies" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2 dark:text-gray-400 dark:hover:text-gray-100">
          <ArrowLeft size={13} /> Volver a empresas
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{company?.name ?? "Detalle de empresa"}</h1>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-3">
        {/* Columna principal */}
        <div className="xl:col-span-2 space-y-4">
          {loading && <Loader text="Cargando empresa..." />}
          {error && <EmptyState title="Error" description={error} />}

          {!loading && !error && company && (
            <>
              {/* Ficha general */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                      <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{company.name}</h2>
                      {company.nit && (
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">NIT: {company.nit}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Creada {new Date(company.createdAt).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {company.companyState && <InfoRow icon={<BadgeInfo size={13} />} label="Estado empresa" value={company.companyState} />}
                  {company.industry && <InfoRow icon={<Building2 size={13} />} label="Industria" value={company.industry} />}
                  {company.size && <InfoRow icon={<Building2 size={13} />} label="Tamaño" value={`${company.size} empleados`} />}
                  {company.country && <InfoRow icon={<MapPin size={13} />} label="País" value={company.country} />}
                  {company.department && <InfoRow icon={<MapPin size={13} />} label="Departamento" value={company.department} />}
                  {company.address && <InfoRow icon={<MapPin size={13} />} label="Dirección" value={company.address} />}
                  {company.legalRep && <InfoRow icon={<User size={13} />} label="Rep. legal" value={company.legalRep} />}
                  {company.assignedTo && <InfoRow icon={<Building2 size={13} />} label="Asignada a" value={company.assignedTo} />}
                  {company.contactStatus && <InfoRow icon={<Building2 size={13} />} label="Estado CRM" value={company.contactStatus} />}
                  {company.website && (
                    <InfoRow icon={<Globe size={13} />} label="Website"
                      value={<a href={company.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400 break-all">{company.website}</a>} />
                  )}
                  {company.linkedinUrl && (
                    <InfoRow icon={<Linkedin size={13} />} label="LinkedIn"
                      value={<a href={company.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate block dark:text-indigo-400">{company.linkedinUrl}</a>} />
                  )}
                </div>

                {/* Teléfonos */}
                {company.phones && splitList(company.phones).length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Phone size={11} /> Teléfonos
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {splitList(company.phones).map((p) => (
                        <a key={p} href={`tel:${p.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300">
                          <Phone size={11} /> {p}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emails */}
                {company.emails && splitList(company.emails).length > 0 && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <AtSign size={11} /> Correos electrónicos
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {splitList(company.emails).map((e) => (
                        <a key={e} href={`mailto:${e}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-indigo-950 dark:hover:text-indigo-300">
                          <AtSign size={11} /> {e}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Descripción */}
                {company.description && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 flex items-center gap-1 mb-1">
                      <FileText size={11} /> Descripción
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{company.description}</p>
                  </div>
                )}
              </div>

              {/* Contactos */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Contactos ({contacts.length})</h3>
                </div>
                {contacts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">Sin contactos registrados</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {contacts.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 px-5 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</p>
                          <p className="text-xs text-gray-500 truncate dark:text-gray-400">{c.email}</p>
                        </div>
                        <span className="shrink-0 text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{c.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 dark:text-gray-100">Acciones rápidas</h2>
            <div className="space-y-2">
              <ActionButton icon={<UserPlus size={15} />} label="Registrar contacto" onClick={() => { setContactForm({ name: "", email: "", role: "CEO" }); setModalContact(true); }} />
              <ActionButton icon={<Mail size={15} />} label="Enviar email" onClick={openEmailModal} disabled={!company} />
              <ActionButton icon={<Calendar size={15} />} label="Agendar reunión" onClick={openMeetingModal} disabled={!company} />
              <ActionButton icon={<Pencil size={15} />} label="Editar empresa" onClick={() => setModalEdit(true)} disabled={!company} variant="indigo" />
              <ActionButton icon={<Trash2 size={15} />} label="Eliminar empresa" onClick={() => setModalDelete(true)} disabled={!company} variant="red" />
            </div>
          </div>

          {/* NIT card if present */}
          {company?.nit && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500 flex items-center gap-1 mb-1"><Hash size={11} /> NIT</p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{company.nit}</p>
            </div>
          )}
        </aside>
      </div>

      {/* ── MODAL: Registrar contacto ── */}
      <Modal open={modalContact} title="Registrar contacto" onClose={() => setModalContact(false)}>
        <div className="space-y-3">
          <Field label="Nombre completo *">
            <input value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))} placeholder="Carlos Ramírez" className={CLS} />
          </Field>
          <Field label="Email *">
            <input type="email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))} placeholder="contacto@empresa.com" className={CLS} />
          </Field>
          <Field label="Rol *">
            <select value={contactForm.role} onChange={(e) => setContactForm(p => ({ ...p, role: e.target.value as ContactRole }))} className={CLS}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <ModalActions onCancel={() => setModalContact(false)} onConfirm={submitContact} loading={savingContact} confirmText="Guardar contacto" />
        </div>
      </Modal>

      {/* ── MODAL: Enviar email ── */}
      <Modal open={modalEmail} title="Enviar email de prospección" onClose={() => setModalEmail(false)}>
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Se enviará el email de prospección estándar de Campusland.</p>
          <Field label="Contacto *">
            <select value={emailForm.contactId} onChange={(e) => setEmailForm({ contactId: e.target.value })} className={CLS}>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
          </Field>
          <ModalActions onCancel={() => setModalEmail(false)} onConfirm={submitEmail} loading={sendingEmail} confirmText="Enviar email" />
        </div>
      </Modal>

      {/* ── MODAL: Agendar reunión ── */}
      <Modal open={modalMeeting} title="Agendar reunión" onClose={() => setModalMeeting(false)}>
        <div className="space-y-3">
          <Field label="Contacto *">
            <select value={meetingForm.contactId} onChange={(e) => setMeetingForm(p => ({ ...p, contactId: e.target.value }))} className={CLS}>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
            </select>
          </Field>
          <Field label="Título *">
            <input value={meetingForm.title} onChange={(e) => setMeetingForm(p => ({ ...p, title: e.target.value }))} placeholder="Demo Staff Augmentation" className={CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Inicio *">
              <input type="datetime-local" value={meetingForm.startTime}
                onChange={(e) => setMeetingForm(p => ({ ...p, startTime: e.target.value, endTime: p.endTime < e.target.value ? e.target.value : p.endTime }))}
                className={CLS} />
            </Field>
            <Field label="Fin *">
              <input type="datetime-local" value={meetingForm.endTime} min={meetingForm.startTime}
                onChange={(e) => setMeetingForm(p => ({ ...p, endTime: e.target.value }))} className={CLS} />
            </Field>
          </div>
          <Field label="Agenda">
            <textarea rows={3} value={meetingForm.description} onChange={(e) => setMeetingForm(p => ({ ...p, description: e.target.value }))} placeholder="Temas a tratar..." className={`${CLS} resize-none`} />
          </Field>
          <Field label="Link videollamada">
            <input type="url" value={meetingForm.meetingLink} onChange={(e) => setMeetingForm(p => ({ ...p, meetingLink: e.target.value }))} placeholder="https://meet.google.com/..." className={CLS} />
          </Field>
          <ModalActions onCancel={() => setModalMeeting(false)} onConfirm={submitMeeting} loading={savingMeeting} confirmText="Agendar reunión" />
        </div>
      </Modal>

      {/* ── MODAL: Editar empresa ── */}
      <Modal open={modalEdit} title="Editar empresa" onClose={() => setModalEdit(false)}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Field label="Nombre *">
            <input value={editForm.name ?? ""} onChange={ef("name")} className={CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="NIT">
              <input value={editForm.nit ?? ""} onChange={ef("nit")} placeholder="900123456-1" className={CLS} />
            </Field>
            <Field label="Estado empresa">
              <input value={editForm.companyState ?? ""} onChange={ef("companyState")} placeholder="Activa" className={CLS} />
            </Field>
          </div>
          <Field label="Teléfonos (separados por coma)">
            <input value={editForm.phones ?? ""} onChange={ef("phones")} placeholder="300 123 4567, (7) 634 1234" className={CLS} />
          </Field>
          <Field label="Emails (separados por coma)">
            <input value={editForm.emails ?? ""} onChange={ef("emails")} placeholder="info@empresa.com, ventas@empresa.com" className={CLS} />
          </Field>
          <Field label="Dirección">
            <input value={editForm.address ?? ""} onChange={ef("address")} placeholder="Calle 1 # 2-3, Bucaramanga" className={CLS} />
          </Field>
          <Field label="Representante legal">
            <input value={editForm.legalRep ?? ""} onChange={ef("legalRep")} placeholder="Juan Pérez" className={CLS} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Industria">
              <input value={editForm.industry ?? ""} onChange={ef("industry")} placeholder="Tecnología" className={CLS} />
            </Field>
            <Field label="Tamaño">
              <input value={editForm.size ?? ""} onChange={ef("size")} placeholder="50" className={CLS} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="País">
              <input value={editForm.country ?? ""} onChange={ef("country")} className={CLS} />
            </Field>
            <Field label="Departamento">
              <input value={editForm.department ?? ""} onChange={ef("department")} placeholder="Santander" className={CLS} />
            </Field>
          </div>
          <Field label="Website">
            <input type="url" value={editForm.website ?? ""} onChange={ef("website")} placeholder="https://empresa.com" className={CLS} />
          </Field>
          <Field label="Estado CRM">
            <select value={editForm.contactStatus ?? "Nueva"} onChange={ef("contactStatus")} className={CLS}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Asignada a">
            <input value={editForm.assignedTo ?? ""} onChange={ef("assignedTo")} className={CLS} />
          </Field>
          <Field label="Descripción">
            <textarea rows={3} value={editForm.description ?? ""} onChange={ef("description")} className={`${CLS} resize-none`} />
          </Field>
          <ModalActions onCancel={() => setModalEdit(false)} onConfirm={submitEdit} loading={savingEdit} confirmText="Guardar cambios" />
        </div>
      </Modal>

      {/* ── MODAL: Confirmar eliminación ── */}
      <Modal open={modalDelete} title="Eliminar empresa" onClose={() => setModalDelete(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ¿Estás seguro de que quieres eliminar <strong>{company?.name}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setModalDelete(false)} disabled={deleting}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancelar
            </button>
            <button onClick={submitDelete} disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-all">
              {deleting ? "Eliminando..." : "Sí, eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{icon} {label}</div>
      <div className="mt-0.5 text-sm text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

function ActionButton({
  icon, label, onClick, disabled, variant = "default",
}: {
  icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; variant?: "default" | "indigo" | "red";
}) {
  const cls = {
    default: "border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-300",
    indigo: "border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950",
    red: "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950",
  }[variant];

  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all ${cls}`}>
      {icon} {label}
    </button>
  );
}

function ModalActions({ onCancel, onConfirm, loading, confirmText }: {
  onCancel: () => void; onConfirm: () => void; loading: boolean; confirmText: string;
}) {
  return (
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} disabled={loading}
        className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
        Cancelar
      </button>
      <button onClick={onConfirm} disabled={loading}
        className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-sm">
        {loading ? "Guardando..." : confirmText}
      </button>
    </div>
  );
}
