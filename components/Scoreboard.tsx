import { getHuntScoreboardNoDuplicateItems } from '@/lib/api/queries/scoreboard/getHuntScoreboardNoDuplicateItems';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type ScoreboardProps = {
  huntId: number;
};

function formatCompletionTime(completionTime: string | null): string {
  if (!completionTime) return '-';

  // PostgreSQL interval format can be like "1 day 02:30:45" or "02:30:45"
  // Try to parse and format it nicely
  try {
    // If it contains "day" or "days", extract the day part
    const dayMatch = completionTime.match(/(\d+)\s+day/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;

    // Extract time part (HH:MM:SS)
    const timeMatch = completionTime.match(/(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      return parts.join(' ');
    }

    // Fallback: return as-is if we can't parse it
    return completionTime;
  } catch {
    return completionTime;
  }
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleString();
}

export default async function Scoreboard({ huntId }: ScoreboardProps) {
  const scoreboard = await getHuntScoreboardNoDuplicateItems(huntId);

  if (scoreboard.length === 0) {
    return (
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Scoreboard</h2>
        <p className="text-gray-500">No participants yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[calc(100vw-4rem)] rounded-lg border p-6 lg:max-w-full">
      <h2 className="mb-4 text-xl font-semibold">Scoreboard</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">First Approved</TableHead>
            <TableHead className="text-center">Last Approved</TableHead>
            <TableHead className="text-center">Completion Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scoreboard.map((entry, index) => {
            const rank = index + 1;
            const initials =
              entry.userName
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '?';

            return (
              <TableRow key={entry.userId}>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center">
                    {rank === 1 && <span className="text-yellow-500">🥇</span>}
                    {rank === 2 && <span className="text-gray-400">🥈</span>}
                    {rank === 3 && <span className="text-amber-600">🥉</span>}
                    {rank > 3 && <span className="text-gray-500">{rank}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={entry.userImage || undefined} alt={entry.userName || ''} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.userName || 'Anonymous'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {entry.score ? Number(entry.score) : 0}
                </TableCell>
                <TableCell className="text-center text-sm text-gray-600">
                  {formatDate(entry.firstApprovedAt)}
                </TableCell>
                <TableCell className="text-center text-sm text-gray-600">
                  {formatDate(entry.lastApprovedAt)}
                </TableCell>
                <TableCell className="text-center text-sm text-gray-600">
                  {formatCompletionTime(entry.completionTime)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
