import type { Meeting } from "../../types/meeting";
import { formatDateTime } from "../../utils/format";

type MeetingCalendarProps = {
  meetings: Meeting[];
};

export function MeetingCalendar({ meetings }: MeetingCalendarProps) {
  return (
    <div className="rounded-3xl border bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold">Calendario rápido</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {meetings.map((meeting) => (
          <li key={meeting.id} className="rounded-xl border p-2">
            <p className="font-medium">{meeting.title}</p>
            <p>{formatDateTime(meeting.startTime)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
