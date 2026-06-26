import {
  Plan, DailySummary, FoodLog, FoodLogCreate,
  FoodAnalysisResult, Streak, Profile, PlanGenerateRequest,
} from './types';

const BASE = process.env.EXPO_PUBLIC_API_URL!;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    // Preserve `instanceof ApiError` after Babel/Hermes transpilation, which
    // otherwise breaks the prototype chain when extending built-ins.
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 30_000;

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body && !(init.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...init.headers,
      },
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError(0, 'Request timed out. Please check your connection and try again.');
    }
    throw new ApiError(0, 'Network error. Please check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const err = await res.json();
      detail = err.detail ?? detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  profile: {
    get: (token: string) =>
      request<Profile>('/profile', token),

    update: (token: string, body: Partial<Profile>) =>
      request<Profile>('/profile', token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },

  plans: {
    generate: (token: string, body: PlanGenerateRequest) =>
      request<Plan>('/plans/generate', token, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    getActive: (token: string) =>
      request<Plan>('/plans', token),
  },

  foodLogs: {
    dailySummary: (token: string, logDate: string) =>
      request<DailySummary>(`/food-logs/daily-summary?log_date=${encodeURIComponent(logDate)}`, token),

    list: (token: string, logDate: string) =>
      request<FoodLog[]>(`/food-logs?log_date=${encodeURIComponent(logDate)}`, token),

    create: (token: string, body: FoodLogCreate) =>
      request<FoodLog>('/food-logs', token, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    delete: (token: string, logId: string) =>
      request<{ deleted: boolean }>(`/food-logs/${encodeURIComponent(logId)}`, token, {
        method: 'DELETE',
      }),
  },

  foodAnalysis: {
    analyze: async (
      token: string,
      imageUri: string,
      mealType: string
    ): Promise<FoodAnalysisResult> => {
      const form = new FormData();
      form.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'food.jpg',
      } as any);
      form.append('meal_type', mealType);

      return request<FoodAnalysisResult>('/food-analysis', token, {
        method: 'POST',
        body: form,
      });
    },
  },

  streaks: {
    get: (token: string) =>
      request<Streak>('/streaks', token),
  },

  weightEntries: {
    create: (token: string, body: { weight_kg: number; log_date: string }) =>
      request('/weight-entries', token, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  progress: {
    weekly: (token: string, weekStart?: string) =>
      request<any>(`/progress/weekly${weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : ''}`, token),

    monthly: (token: string, year?: number, month?: number) => {
      const params = year && month ? `?year=${year}&month=${month}` : '';
      return request<any>(`/progress/monthly${params}`, token);
    },
  },
};

export { ApiError };
