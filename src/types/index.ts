// ─── Enums & literals ────────────────────────────────────────────────────────

export type GameMode = 'daily' | 'surprise';
export type GameStatus = 'active' | 'ended';
export type ChallengeStatus = 'pending' | 'active' | 'voting' | 'completed';

// ─── Core domain types ────────────────────────────────────────────────────────

export interface Game {
  id: string;
  code: string;
  name: string;
  host_id: string;
  game_mode: GameMode;
  /** HH:MM:SS — only for 'daily' mode */
  challenge_time: string | null;
  start_date: string;
  end_date: string | null;
  status: GameStatus;
  created_at: string;
}

export interface Participant {
  id: string;
  game_id: string;
  pseudo: string;
  avatar_color: string;
  is_host: boolean;
  total_points: number;
  created_at: string;
}

export interface Theme {
  id: string;
  /** null = predefined (shared across all games) */
  game_id: string | null;
  text: string;
  has_player_var: boolean;
  has_random_player_var: boolean;
  is_predefined: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  game_id: string;
  theme_id: string;
  /** Resolved text with participant names substituted (or "Thèmes individuels" when individual_themes=true) */
  theme_text: string;
  /** When true, each participant has their own theme stored in participant_themes */
  individual_themes: boolean;
  day_number: number;
  challenge_date: string;
  scheduled_time: string;
  status: ChallengeStatus;
  created_at: string;
}

export interface ParticipantTheme {
  id: string;
  challenge_id: string;
  participant_id: string;
  theme_id: string | null;
  theme_text: string;
  created_at: string;
}

export interface Photo {
  id: string;
  challenge_id: string;
  participant_id: string;
  storage_path: string;
  public_url: string | null;
  votes_count: number;
  created_at: string;
}

export interface Vote {
  id: string;
  challenge_id: string;
  voter_id: string;
  photo_id: string;
  created_at: string;
}

// ─── Extended types (with joins) ──────────────────────────────────────────────

export interface ChallengeWithTheme extends Challenge {
  theme: Theme;
}

export interface PhotoWithParticipant extends Photo {
  participant: Pick<Participant, 'id' | 'pseudo' | 'avatar_color'>;
}

export interface ParticipantWithRank extends Participant {
  rank: number;
}

export interface GameWithParticipants extends Game {
  participants: Participant[];
}

export interface ChallengeWithPhotos extends Challenge {
  photos: PhotoWithParticipant[];
}

// ─── Form / action payloads ───────────────────────────────────────────────────

export interface CreateGamePayload {
  gameName: string;
  pseudo: string;
  gameMode: GameMode;
  challengeTime?: string;
}

export interface JoinGamePayload {
  code: string;
  pseudo: string;
}

export interface UploadPhotoPayload {
  challengeId: string;
  file: File;
}

export interface CastVotePayload {
  challengeId: string;
  photoId: string;
}

// ─── Session (stored in httpOnly cookie) ─────────────────────────────────────

export interface SessionData {
  participantId: string;
  gameId: string;
  /** Game code (e.g. "A1B2C3") — stored so middleware can redirect without a DB call */
  gameCode: string;
  pseudo: string;
}

// ─── Server Action results ────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
