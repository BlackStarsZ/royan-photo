import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import type { Photo, PhotoWithParticipant } from '@/types';

const STORAGE_BUCKET = 'photos';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export class PhotoService {
  /**
   * Uploads a photo to Supabase Storage and creates the database record.
   */
  static async upload(
    challengeId: string,
    participantId: string,
    gameId: string,
    file: File,
  ): Promise<Photo> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('La photo dépasse la taille maximale de 10 Mo.');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Format de fichier non supporté. Utilisez JPG, PNG, WebP ou HEIC.');
    }

    const admin = createAdminClient();

    // Check if participant already uploaded for this challenge
    const { data: existing } = await admin
      .from('photos')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('participant_id', participantId)
      .maybeSingle();

    if (existing) throw new Error('Vous avez déjà soumis une photo pour ce défi.');

    // Build storage path: games/{gameId}/{challengeId}/{participantId}.jpg
    const ext = file.name.split('.').pop() ?? 'jpg';
    const storagePath = `games/${gameId}/${challengeId}/${participantId}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, { upsert: true, contentType: file.type });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: urlData } = admin.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Persist to database
    const { data: photo, error: dbError } = await admin
      .from('photos')
      .insert({
        challenge_id: challengeId,
        participant_id: participantId,
        storage_path: storagePath,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (dbError || !photo) throw new Error(`DB insert failed: ${dbError?.message}`);
    return photo;
  }

  /**
   * Fetches all photos for a challenge with participant info.
   */
  static async getByChallengeId(challengeId: string): Promise<PhotoWithParticipant[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('photos')
      .select('*, participant:participants(id, pseudo, avatar_color)')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as PhotoWithParticipant[];
  }

  /**
   * Checks whether a participant has already uploaded for a given challenge.
   */
  static async hasUploaded(challengeId: string, participantId: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from('photos')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('participant_id', participantId)
      .maybeSingle();
    return Boolean(data);
  }
}
