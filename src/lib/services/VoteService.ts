import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import type { Vote } from '@/types';

// Points awarded per vote received
const POINTS_PER_VOTE = 1;
// Bonus points for the photo with most votes
const WINNER_BONUS = 3;

export class VoteService {
  /**
   * Casts a vote for a photo.
   * - One vote per participant per challenge
   * - Cannot vote for your own photo
   */
  static async cast(
    challengeId: string,
    voterId: string,
    photoId: string,
  ): Promise<Vote> {
    const admin = createAdminClient();

    // Check for existing vote
    const { data: existing } = await admin
      .from('votes')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('voter_id', voterId)
      .maybeSingle();

    if (existing) throw new Error('Vous avez déjà voté pour ce défi.');

    // Prevent self-vote
    const { data: photo } = await admin
      .from('photos')
      .select('participant_id')
      .eq('id', photoId)
      .maybeSingle();

    if (photo?.participant_id === voterId) {
      throw new Error('Vous ne pouvez pas voter pour votre propre photo.');
    }

    // Insert vote
    const { data: vote, error } = await admin
      .from('votes')
      .insert({ challenge_id: challengeId, voter_id: voterId, photo_id: photoId })
      .select()
      .single();

    if (error || !vote) throw new Error(`Vote failed: ${error?.message}`);

    // Increment votes_count on photo
    const { data: photoData } = await admin
      .from('photos')
      .select('votes_count')
      .eq('id', photoId)
      .single();
    await admin
      .from('photos')
      .update({ votes_count: (photoData?.votes_count ?? 0) + 1 })
      .eq('id', photoId);

    return vote;
  }

  /**
   * Checks whether a participant has already voted for a given challenge.
   */
  static async hasVoted(challengeId: string, voterId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('voter_id', voterId)
      .maybeSingle();
    return Boolean(data);
  }

  /**
   * Gets the vote cast by a participant for a challenge.
   */
  static async getVote(challengeId: string, voterId: string): Promise<Vote | null> {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('voter_id', voterId)
      .maybeSingle();
    return data;
  }

  /**
   * Tallies votes for a challenge and updates participant points.
   * Call this when closing voting for a challenge.
   */
  static async tallyAndAwardPoints(challengeId: string): Promise<void> {
    const admin = createAdminClient();

    // Get all photos with votes for this challenge
    const { data: photos, error } = await admin
      .from('photos')
      .select('id, participant_id, votes_count')
      .eq('challenge_id', challengeId)
      .order('votes_count', { ascending: false });

    if (error) throw new Error(error.message);
    if (!photos || photos.length === 0) return;

    const maxVotes = photos[0]?.votes_count ?? 0;
    const winners = photos.filter((p) => p.votes_count === maxVotes && maxVotes > 0);

    // Award points: 1 per vote received + bonus for winner(s)
    for (const photo of photos) {
      const basePoints = photo.votes_count * POINTS_PER_VOTE;
      const bonus = winners.some((w) => w.id === photo.id) ? WINNER_BONUS : 0;
      const totalPoints = basePoints + bonus;

      if (totalPoints > 0) {
        // Fetch current total
        const { data: p } = await admin
          .from('participants')
          .select('total_points')
          .eq('id', photo.participant_id)
          .single();

        await admin
          .from('participants')
          .update({ total_points: (p?.total_points ?? 0) + totalPoints })
          .eq('id', photo.participant_id);
      }
    }
  }

  /**
   * Fetches all votes for a challenge.
   */
  static async getForChallenge(challengeId: string): Promise<Vote[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('challenge_id', challengeId);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
