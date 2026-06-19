import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getSession } from '@/lib/actions/auth';
import { ChallengeService } from '@/lib/services/ChallengeService';
import { formatDateFr } from '@/lib/utils/date';

interface PageProps {
  params: Promise<{ code: string }>;
}

const statusConfig = {
  pending: { label: 'En attente', variant: 'default' as const },
  active: { label: 'En cours', variant: 'success' as const },
  voting: { label: 'Vote ouvert', variant: 'warning' as const },
  completed: { label: 'Terminé', variant: 'info' as const },
};

export default async function HistoryPage({ params }: PageProps) {
  const { code } = await params;
  const session = await getSession();
  if (!session) redirect('/');

  const challenges = await ChallengeService.getHistory(session.gameId);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Historique des défis</h1>
        <p className="mt-1 text-sm text-gray-500">{challenges.length} défi(s) au total</p>
      </div>

      {challenges.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-gray-400 text-sm">Aucun défi pour l&apos;instant.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {challenges.map((challenge) => {
            const { label, variant } = statusConfig[challenge.status];
            return (
              <Link key={challenge.id} href={`/game/${code}/results/${challenge.id}`}>
                <Card className="flex items-center gap-3 hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                    {challenge.day_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {challenge.theme_text}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateFr(challenge.challenge_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={variant}>{label}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
