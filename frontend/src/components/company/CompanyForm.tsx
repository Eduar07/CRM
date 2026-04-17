import { useState } from "react";
import type { FormEvent } from "react";
import type { CreateCompanyRequest } from "../../types/company";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

type CompanyFormProps = {
  onSubmit: (payload: CreateCompanyRequest) => Promise<void>;
};

export function CompanyForm({ onSubmit }: CompanyFormProps) {
  const [form, setForm] = useState<CreateCompanyRequest>({
    name: "",
    linkedinUrl: "",
    country: "",
    department: ""
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Input
        value={form.name}
        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        placeholder="Nombre"
      />
      <Input
        value={form.country}
        onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
        placeholder="País"
      />
      <Input
        value={form.department}
        onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
        placeholder="Departamento"
      />
      <Input
        value={form.linkedinUrl}
        onChange={(e) => setForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
        placeholder="URL de LinkedIn"
      />
      <Button type="submit">Guardar empresa</Button>
    </form>
  );
}
