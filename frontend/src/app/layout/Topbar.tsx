// Topbar is now embedded in DashboardLayout.tsx
// This file is kept for backwards compatibility

type TopbarProps = {
  onToggleMenu?: () => void;
  username?: string;
};

export function Topbar(_props: TopbarProps) {
  return null;
}
