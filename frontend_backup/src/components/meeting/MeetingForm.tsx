import { useState } from "react";
import type { FormEvent } from "react";
import type { ScheduleMeetingRequest } from "../../types/meeting";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type MeetingFormProps = {
  initialValues: Pick<ScheduleMeetingRequest, "companyId" | "contactId" | "userId">;
  onSubmit: (payload: ScheduleMeetingRequest) => Promise<void>;
};

export function MeetingForm({ initialValues, onSubmit }: MeetingFormProps) {
  const [form, setForm] = useState<ScheduleMeetingRequest>({
    ...initialValues,
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    meetingLink: ""
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        value={form.title}
        onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Título"
      />
      <Input
        value={form.startTime}
        onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
        placeholder="Start time (ISO)"
      />
      <Input
        value={form.endTime}
        onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
        placeholder="End time (ISO)"
      />
      <Input
        value={form.meetingLink}
        onChange={(e) => setForm((prev) => ({ ...prev, meetingLink: e.target.value }))}
        placeholder="Meeting link"
      />
      <Button type="submit">Agendar</Button>
    </form>
  );
}
