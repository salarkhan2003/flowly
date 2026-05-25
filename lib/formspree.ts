import { FORMSPREE_ENDPOINT } from '../constants/community';

/** Matches hidden input: <input type="hidden" name="formType" value="..." /> */
export type FormType = 'join_team' | 'feedback' | 'onboarding';

export interface FormspreePayload {
  formType: FormType;
  _subject?: string;
  name?: string;
  email?: string;
  phone?: string;
  age_range?: string;
  gender?: string;
  category?: string;
  message?: string;
  app_version?: string;
}

const SUBMIT_TIMEOUT_MS = 12_000;

export async function submitToFormspree(payload: FormspreePayload): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v != null && String(v).trim() !== '')
    );

    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) return { ok: true };

    const data = await res.json().catch(() => ({}));
    const errMsg =
      typeof data.error === 'string'
        ? data.error
        : Array.isArray(data.errors)
          ? data.errors.map((e: { message?: string }) => e.message).filter(Boolean).join(', ')
          : `Submission failed (${res.status})`;
    return { ok: false, error: errMsg || 'Could not send. Check your connection.' };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, error: 'Request timed out. Check your connection and try again.' };
    }
    return { ok: false, error: 'Network error. Try again when online.' };
  }
}
