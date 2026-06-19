import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Variables .env.local manquantes', url: !!url, key: !!key });
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return NextResponse.json({
      ok: true,
      status: res.status,
      url,
    });
  } catch (err: unknown) {
    const error = err as Error & { cause?: unknown };
    return NextResponse.json({
      ok: false,
      message: error.message,
      cause: String(error.cause ?? 'aucune cause'),
      url,
    });
  }
}
