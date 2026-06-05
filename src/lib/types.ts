export interface Plan {
  id: string;
  user_id: string;
  calories_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  tdee: number;
  bmr: number;
  deficit_surplus: number;
  weeks_to_goal: number;
  is_active: boolean;
  generated_at: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  calories_burned: number;
  water_ml: number;
  goal_calories: number;
  net_calories: number;
  calories_remaining: number;
  entries_by_meal: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    dinner: FoodLog[];
    snack: FoodLog[];
  };
}

export interface FoodLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_qty: number;
  serving_unit: string;
  photo_url: string | null;
  ai_confidence: number | null;
  logged_at: string;
}

export interface FoodLogCreate {
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  serving_qty?: number;
  serving_unit?: string;
  photo_url?: string;
  ai_confidence?: number;
  notes?: string;
}

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  serving_size: number;
  serving_unit: string;
  confidence: number;
  items: { name: string; calories: number }[];
  photo_url: string;
  meal_type: string;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  gender: string | null;
  birthday: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: string | null;
  desired_weight_kg: number | null;
  weight_speed_kg_week: number | null;
  workouts_per_week: number | null;
  diet_preference: string | null;
  rollover_calories: boolean;
  add_calories_burned: boolean;
  metric: boolean;
  onboarding_complete: boolean;
}

export interface PlanGenerateRequest {
  gender: string;
  birthday: string;
  height_cm: number;
  weight_kg: number;
  goal: 'lose' | 'maintain' | 'gain';
  desired_weight_kg: number;
  weight_speed_kg_week: number;
  workouts_per_week: number;
  diet_preference: string;
}
