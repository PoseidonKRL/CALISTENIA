export type ExerciseCategory = 'Warmup' | 'Strength' | 'Compound' | 'Core' | 'Cardio';

export interface Exercise {
    name: string;
    sets: number | string;
    reps_time: string;
    notes: string;
    category: ExerciseCategory;
}

export interface DailyMission {
    id: string;
    text: string;
    xp: number;
    completed: boolean;
    createdAt: number; // Timestamp of creation
}

export interface ActivityLogItem {
    id: string; // Composite key like 'mission-uuid' or 'exercise-Day-Exercise Name'
    text: string;
    xp: number;
    type: 'mission' | 'exercise';
    completedAt: number; // Timestamp of completion
}


export interface XpHistory {
    date: string; // YYYY-MM-DD
    xp: number;
}

export interface DayPlan {
    day: string;
    focus: string;
    exercises: Exercise[];
}

export interface WeeklyPlan {
    week: string;
    days: DayPlan[];
}

export interface WorkoutPlan {
    objectives: string[];
    resources: string[];
    schedule: {
        training_days: string;
        cardio_core_days: string;
        time_slot: string;
        meal_timing: string;
    };
    general_principles: string[];
    legend: {
        series_x_repetitions: string;
        f: string;
        trx_note: string;
    };
    weekly_plan: WeeklyPlan[];
    instructions_for_weeks_2_4_progression: string[];
}

export interface LevelUpInfo {
    level: number;
    name: string;
}
