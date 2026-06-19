'use client';

import { useState } from 'react';
import { Zap, Vote, CheckCircle, Plus, X, Clock, Shuffle, Users } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { generateChallengeAction, openVotingAction, closeVotingAction } from '@/lib/actions/challenge';
import { addCustomThemeAction } from '@/lib/actions/game';
import type { Challenge, GameMode } from '@/types';

interface HostControlsProps {
  gameId: string;
  gameCode: string;
  todayChallenge: Challenge | null;
  defaultMode?: GameMode;
}

interface Feedback {
  message: string;
  type: 'success' | 'error';
}

export function HostControls({ gameId, gameCode, todayChallenge, defaultMode = 'daily' }: HostControlsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>(defaultMode);
  const [individualThemes, setIndividualThemes] = useState(false);

  const canGenerate = !todayChallenge || todayChallenge.status === 'completed';

  const notify = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const run = async (key: string, fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoadingAction(key);
    const result = await fn();
    setLoadingAction(null);
    if (result.success) notify('Action effectuée avec succès.', 'success');
    else notify(result.error ?? 'Erreur inconnue.', 'error');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrôles hôte</CardTitle>
      </CardHeader>

      <div className="flex flex-col gap-3">
        {/* Inline feedback */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} aria-label="Fermer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Mode selector + options + generate button */}
        {canGenerate && (
          <div className="flex flex-col gap-3">
            {/* Timing mode */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-500">Type de défi</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode('daily')}
                  className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-colors ${
                    selectedMode === 'daily'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Quotidien</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('surprise')}
                  className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-colors ${
                    selectedMode === 'surprise'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <Shuffle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Surprise</span>
                </button>
              </div>
            </div>

            {/* Individual themes toggle */}
            <button
              type="button"
              onClick={() => setIndividualThemes((v) => !v)}
              className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-colors ${
                individualThemes
                  ? 'border-violet-400 bg-violet-50 text-violet-700'
                  : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Thème différent par joueur</p>
                <p className="text-xs opacity-70">
                  Chaque participant reçoit son propre défi secret
                </p>
              </div>
              {/* Toggle pill */}
              <span
                className={`flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  individualThemes ? 'bg-violet-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform ${
                    individualThemes ? 'translate-x-[18px]' : ''
                  }`}
                />
              </span>
            </button>

            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={loadingAction === 'generate'}
              onClick={() =>
                run('generate', () => generateChallengeAction(gameId, selectedMode, individualThemes))
              }
            >
              <Zap className="h-4 w-4" />
              {todayChallenge ? 'Lancer le prochain défi' : 'Générer le défi du jour'}
            </Button>
          </div>
        )}

        {/* Open voting */}
        {todayChallenge?.status === 'active' && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            loading={loadingAction === 'openVoting'}
            onClick={() => run('openVoting', () => openVotingAction(todayChallenge.id, gameCode))}
          >
            <Vote className="h-4 w-4" />
            Ouvrir les votes
          </Button>
        )}

        {/* Close voting */}
        {todayChallenge?.status === 'voting' && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            loading={loadingAction === 'closeVoting'}
            onClick={() => run('closeVoting', () => closeVotingAction(todayChallenge.id, gameCode))}
          >
            <CheckCircle className="h-4 w-4" />
            Clôturer les votes
          </Button>
        )}

        {/* Add custom theme */}
        <div className="flex gap-2 border-t border-gray-100 pt-3">
          <Input
            value={customTheme}
            onChange={(e) => setCustomTheme(e.target.value)}
            placeholder="Ajouter un thème personnalisé…"
            hint="Utilisez {player} ou {random_player}"
          />
          <Button
            variant="ghost"
            size="md"
            loading={loadingAction === 'addTheme'}
            disabled={!customTheme.trim()}
            onClick={() =>
              run('addTheme', async () => {
                const r = await addCustomThemeAction(customTheme);
                if (r.success) setCustomTheme('');
                return r;
              })
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
