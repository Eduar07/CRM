import { Menu } from "lucide-react";
import { Button } from "../../components/ui/Button";

type TopbarProps = {
  onToggleMenu: () => void;
  username: string;
};

export function Topbar({ onToggleMenu, username }: TopbarProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
      <Button variant="secondary" className="p-2 md:hidden" onClick={onToggleMenu}>
        <Menu size={20} />
      </Button>
      <div>
        <h2 className="text-base font-semibold text-slate-900">CRM de prospección</h2>
        <p className="text-xs text-slate-500">Dashboard operativo</p>
      </div>
      <div className="text-sm text-slate-600">{username}</div>
    </header>
  );
}
