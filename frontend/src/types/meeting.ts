export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELED";

export type Meeting = {
  id: string;
  companyId: string;
  contactId: string;
  userId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  status: MeetingStatus;
};

export type ScheduleMeetingRequest = {
  companyId: string;
  contactId: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
};
