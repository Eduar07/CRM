import type { Meeting } from "../../types/meeting";
import { formatDateTime } from "../../utils/format";

type MeetingListProps = {
  meetings: Meeting[];
};

export function MeetingList({ meetings }: MeetingListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b text-slate-500">
          <tr>
            <th className="py-3 pr-4">Inicio</th>
            <th className="py-3 pr-4">Título</th>
            <th className="py-3 pr-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting) => (
            <tr key={meeting.id} className="border-b">
              <td className="py-3 pr-4">{formatDateTime(meeting.startTime)}</td>
              <td className="py-3 pr-4">{meeting.title}</td>
              <td className="py-3 pr-4">{meeting.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
