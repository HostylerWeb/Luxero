export type DrawQueueTabId = "queue" | "completed" | "recent" | "pending_draw" | "drawn";

export interface WinnerPreview {
  id: string;
  name: string;
  ticketNumber: string;
}

export interface RecentWinner {
  id: string;
  competitionId: string;
  competitionTitle: string;
  winner: WinnerPreview;
  drawnAt: string;
}

export interface SheetInfo {
  competitionId: string;
  sheetUrl: string;
  sheetId: string;
  dbEntryCount: number;
  sheetRowCount: number;
  dataRowCount: number;
  diff: number;
  inSync: boolean;
  lastSyncedAt: string;
}
