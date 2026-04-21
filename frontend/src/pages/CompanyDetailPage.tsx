import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { UserPlus, Mail, Calendar, ArrowLeft, Building2, Globe, Linkedin, MapPin } from "lucide-react";
import { EmptyState, Loader } from "../components/common";
import { Modal } from "../components/ui/Modal";
import { useCompanyDetail } from "../hooks/useCompanyDetail";
import { useAuth } from "../hooks/useAuth";
import { createContact, listContactsByCompany } from "../services/contact.service";
import { sendProspectionEmail } from "../services/email.service";
import { scheduleMeeting } from "../services/meeting.service";
import type { Contact, ContactRole } from "../types/contact";

const ROLES: { value: ContactRole; label: string }[] = [
  { value: "CEO", label: "CEO" },
  { value: "CTO", label: "CTO" },
  { value: "TALENT_MANAGER", label: "Talent Manager" },
  { value: "HR", label: "Recursos Humanos" },
];

type Toast = { msg: string; type: "success" | "error" } | null;

export function CompanyDetailPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const { company, loading, error } = useCompanyDetail(id);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [toast, setToast] = useState<Toast>(null);

  // Modales
  const [modalContact, setModalContact] = useState(false);
  const [modalEmail, setModalEmail] = useState(false);
  const [modalMeeting, setModalMeeting] = useState(false);

  // Formulario contacto
  const [contactForm, setContactForm] = useState({ name: "", email: "", role: "CEO" as ContactRole });
  const [savingContact, setSavingContact] = useState(false);

  // Formulario email
  const [emailForm, setEmailForm] = useState({ contactId: "" });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Formulario reunión
  const [meetingForm, setMeetingForm] = useState({
    contactId: "", title: "", description: "", startTime: "", endTime: "", meetingLink: "",
  });
  const [savingMeeting, setSavingMeeting] = useState(false);

  // Cargar contactos cuando tenemos companyId
  useEffect(() => {
    if (!id) return;
    listContactsByCompany(id).then(setContacts).catch(() => setContacts([]));
  }, [id]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Handlers: Registrar contacto ────────────────────────────────────────────
  const openContactModal = () => {
    setContactForm({ name: "", email: "", role: "CEO" });
    setModalContact(true);
  };

  const submitContact = async () => {
    if (!id || !contactForm.name.trim() || !contactForm.email.trim()) {
      showToast("Nombre y email son obligatorios", "error"); return;
    }
    setSavingContact(true);
    try {
      await createContact({
        companyId: id,
        name: contactForm.name,
        email: contactForm.email,
        role: contactForm.role,
      });
      showToast("Contacto registrado ✓");
      setModalContact(false);
      // Refrescar lista de contactos
      const updated = await listContactsByCompany(id);
      setContacts(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar contacto", "error");
    } finally {
      setSavingContact(false);
    }
  };

  // ── Handlers: Enviar email ──────────────────────────────────────────────────
  const openEmailModal = () => {
    if (contacts.length === 0) {
      showToast("Primero registra un contacto para esta empresa", "error");
      return;
    }
    setEmailForm({ contactId: contacts[0].id });
    setModalEmail(true);
  };

  const submitEmail = async () => {
    if (!id || !emailForm.contactId) {
      showToast("Selecciona un contacto", "error"); return;
    }
    setSendingEmail(true);
    try {
      await sendProspectionEmail({ companyId: id, contactId: emailForm.contactId });
      showToast("Email enviado ✓");
      setModalEmail(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al enviar email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  // ── Handlers: Agendar reunión ──────────────────────────────────────────────
  const openMeetingModal = () => {
    if (contacts.length === 0) {
      showToast("Primero registra un contacto para esta empresa", "error");
      return;
    }
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    const toLocal = (d: Date) => {
      // formato requerido por datetime-local: YYYY-MM-DDTHH:mm
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setMeetingForm({
      contactId: contacts[0].id,
      title: "",
      description: "",
      startTime: toLocal(now),
      endTime: toLocal(later),
      meetingLink: "",
    });
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
        companyId: id,
        contactId: meetingForm.contactId,
        userId,
        title: meetingForm.title,
        description: meetingForm.description || undefined,
        startTime: new Date(meetingForm.startTime).toISOString(),
        endTime: new Date(meetingForm.endTime).toISOString(),
        meetingLink: meetingForm.meetingLink || undefined,
      });
      showToast("Reunión agendada ✓");
      setModalMeeting(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al agendar reunión", "error");
    } finally {
      setSavingMeeting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <Link to="/companies" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-2">
          <ArrowLeft size={13} /> Volver a empresas
        </Link>
        <h1 className="text-lg font-bold text-gray-900">{company?.name ?? "Detalle de empresa"}</h1>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-3">
        {/* Info principal */}
        <div className="xl:col-span-2 space-y-4">
          {loading && <Loader text="Cargando empresa..." />}
          {error && <EmptyState title="Error" description={error} />}
          {!loading && !error && company && (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <Building2 size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{company.name}</h2>
                    <p className="text-xs text-gray-500">
                      Creada {new Date(company.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {company.industry && <InfoRow icon={<Building2 size={13} />} label="Industria" value={company.industry} />}
                  {company.size && <InfoRow icon={<Building2 size={13} />} label="Tamaño" value={`${company.size} empleados`} />}
                  {company.country && <InfoRow icon={<MapPin size={13} />} label="País" value={company.country} />}
                  {company.department && <InfoRow icon={<MapPin size={13} />} label="Departamento" value={company.department} />}
                  {company.assignedTo && <InfoRow icon={<Building2 size={13} />} label="Asignada a" value={company.assignedTo} />}
                  {company.contactStatus && <InfoRow icon={<Building2 size={13} />} label="Estado" value={company.contactStatus} />}
                  {company.website && (
                    <InfoRow icon={<Globe size={13} />} label="Website"
                      value={<a href={company.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{company.website}</a>} />
                  )}
                  {company.linkedinUrl && (
                    <InfoRow icon={<Linkedin size={13} />} label="LinkedIn"
                      value={<a href={company.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate block">{company.linkedinUrl}</a>} />
                  )}
                </div>
              </div>

              {/* Contactos */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Contactos ({contacts.length})</h3>
                </div>
                {contacts.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400">Sin contactos registrados</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {contacts.map((c) => (
                      <div key={c.id} className="flex items-start gap-3 px-5 py-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                          {c.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500 truncate">{c.email}</p>
                        </div>
                        <span className="shrink-0 text-[11px] rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">{c.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar Acciones rápidas */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            <ActionButton icon={<UserPlus size={15} />} label="Registrar contacto" onClick={openContactModal} />
            <ActionButton icon={<Mail size={15} />} label="Enviar email" onClick={openEmailModal} disabled={!company} />
            <ActionButton icon={<Calendar size={15} />} label="Agendar reunión" onClick={openMeetingModal} disabled={!company} />
          </div>
        </aside>
      </div>

      {/* ── MODAL: Registrar contacto ── */}
      <Modal open={modalContact} title="Registrar contacto" onClose={() => setModalContact(false)}>
        <div className="space-y-3">
          <Field label="Nombre completo *">
            <input value={contactForm.name} onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
              placeholder="ej: Carlos Ramírez Peña" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <Field label="Email *">
            <input type="email" value={contactForm.email} onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
              placeholder="contacto@empresa.com" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <Field label="Rol *">
            <select value={contactForm.role} onChange={(e) => setContactForm(p => ({ ...p, role: e.target.value as ContactRole }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer">
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <ModalActions
            onCancel={() => setModalContact(false)}
            onConfirm={submitContact}
            loading={savingContact}
            confirmText="Guardar contacto"
          />
        </div>
      </Modal>

      {/* ── MODAL: Enviar email ── */}
      <Modal open={modalEmail} title="Enviar email de prospección" onClose={() => setModalEmail(false)}>
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Se enviará el email de prospección estándar de Campusland (Staff Augmentation, IA, Consultoría).
          </p>
          <Field label="Contacto destinatario *">
            <select value={emailForm.contactId} onChange={(e) => setEmailForm({ contactId: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer">
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
              ))}
            </select>
          </Field>
          <ModalActions
            onCancel={() => setModalEmail(false)}
            onConfirm={submitEmail}
            loading={sendingEmail}
            confirmText="Enviar email"
          />
        </div>
      </Modal>

      {/* ── MODAL: Agendar reunión ── */}
      <Modal open={modalMeeting} title="Agendar reunión" onClose={() => setModalMeeting(false)}>
        <div className="space-y-3">
          <Field label="Contacto *">
            <select value={meetingForm.contactId} onChange={(e) => setMeetingForm(p => ({ ...p, contactId: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer">
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
              ))}
            </select>
          </Field>
          <Field label="Título de la reunión *">
            <input value={meetingForm.title} onChange={(e) => setMeetingForm(p => ({ ...p, title: e.target.value }))}
              placeholder="ej: Demo de Staff Augmentation"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Inicio *">
              <input type="datetime-local" value={meetingForm.startTime}
                onChange={(e) => setMeetingForm(p => ({ ...p, startTime: e.target.value, endTime: p.endTime < e.target.value ? e.target.value : p.endTime }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </Field>
            <Field label="Fin *">
              <input type="datetime-local" value={meetingForm.endTime} min={meetingForm.startTime}
                onChange={(e) => setMeetingForm(p => ({ ...p, endTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </Field>
          </div>
          <Field label="Agenda / Descripción">
            <textarea rows={3} value={meetingForm.description}
              onChange={(e) => setMeetingForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Temas a tratar..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
          </Field>
          <Field label="Link de videollamada (opcional)">
            <input type="url" value={meetingForm.meetingLink}
              onChange={(e) => setMeetingForm(p => ({ ...p, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <ModalActions
            onCancel={() => setModalMeeting(false)}
            onConfirm={submitMeeting}
            loading={savingMeeting}
            confirmText="Agendar reunión"
          />
        </div>
      </Modal>
    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-sm text-gray-900">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
      {icon} {label}
    </button>
  );
}

function ModalActions({ onCancel, onConfirm, loading, confirmText }: { onCancel: () => void; onConfirm: () => void; loading: boolean; confirmText: string }) {
  return (
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} disabled={loading}
        className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60">
        Cancelar
      </button>
      <button onClick={onConfirm} disabled={loading}
        className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-sm hover:shadow-md">
        {loading ? "Guardando..." : confirmText}
      </button>
    </div>
  );
}
