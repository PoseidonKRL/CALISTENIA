
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { workoutPlan, XP_PER_CATEGORY, PREDEFINED_AVATARS, MOTIVATIONAL_QUOTES, PLAYER_TITLES, MISSION_XP_AMOUNTS } from './constants';
import type { DayPlan, Exercise, DailyMission, XpHistory, ActivityLogItem, LevelUpInfo } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
    CheckCircleIcon, ChevronDownIcon, DumbbellIcon, FlameIcon, 
    TrashIcon, ChartBarIcon, UserIcon, ClipboardDocumentListIcon,
    ClockIcon, LockClosedIcon, SparklesIcon, TrophyIcon, ShieldCheckIcon, PlusIcon
} from './components/Icons';

// --- GAMIFICATION CONSTANTS ---
const XP_BASE_LEVEL = 250; // XP needed for level 1 -> 2
const XP_PER_LEVEL_INCREASE = 75; // Additional XP needed for each subsequent level
const initialCheckedItems: Record<string, boolean> = {};
const defaultAvatar = PREDEFINED_AVATARS[0];
const MISSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

// --- HELPER FUNCTIONS ---
const getTodaysDateString = () => new Date().toISOString().split('T')[0];

const calculateXpForNextLevel = (level: number) => {
    return Math.floor(XP_BASE_LEVEL + (level - 1) * XP_PER_LEVEL_INCREASE);
};

const getPlayerTitle = (level: number): string => {
    return [...PLAYER_TITLES].reverse().find(title => level >= title.level)?.name ?? "Iniciante";
};

const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return "Expirado";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos atrás";
    return "Agora mesmo";
}

// --- UI COMPONENTS ---

const Header: React.FC<{ 
    avatarUrl: string;
    onAvatarClick: () => void;
    level: number;
    title: string;
    xp: number;
    xpForNextLevel: number;
}> = ({ avatarUrl, onAvatarClick, level, title, xp, xpForNextLevel }) => {
    const xpProgress = xpForNextLevel > 0 ? (xp / xpForNextLevel) * 100 : 0;
    
    return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-20 p-4 border-b border-border-color">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4 flex-1">
                <img 
                    src={avatarUrl} 
                    alt="User Avatar" 
                    className="w-12 h-12 rounded-full border-2 border-primary cursor-pointer transition-transform hover:scale-105"
                    onClick={onAvatarClick}
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                        <h1 className="text-md font-bold text-text-primary truncate">Level {level} - {title}</h1>
                        <p className="text-xs text-text-secondary font-mono flex-shrink-0 ml-2">{xp} / {xpForNextLevel} XP</p>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-2.5 mt-1 overflow-hidden">
                        <div 
                            className="bg-primary h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_theme(colors.primary)]" 
                            style={{ width: `${xpProgress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </header>
)};

const ExerciseItem: React.FC<{ 
    exercise: Exercise;
    dayIdentifier: string;
    isChecked: boolean;
    onToggle: (id: string, xp: number, name: string) => void;
}> = ({ exercise, dayIdentifier, isChecked, onToggle }) => {
    const exerciseId = `${dayIdentifier}-${exercise.name}`;
    const xpAmount = XP_PER_CATEGORY[exercise.category] || 0;

    return (
        <div 
            onClick={() => onToggle(exerciseId, xpAmount, exercise.name)}
            className={`flex items-center justify-between space-x-4 p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer ${isChecked ? 'bg-gradient-to-br from-accent-green/20 to-accent-green/5 border-accent-green' : 'bg-surface-light border-transparent hover:border-primary hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10'}`}
            role="checkbox"
            aria-checked={isChecked}
        >
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-surface to-surface-light shadow-inner`}>
                    <DumbbellIcon className={`w-6 h-6 transition-colors ${isChecked ? 'text-accent-green' : 'text-text-secondary'}`} />
                </div>
                <div>
                    <p className={`font-semibold ${isChecked ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{exercise.name.replace(/\*\*/g, '')}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary mt-1">
                        <span>{exercise.sets} x {exercise.reps_time}</span>
                        {xpAmount > 0 && (
                            <div className="flex items-center text-secondary font-bold">
                                <FlameIcon className="w-4 h-4 mr-1"/>
                                <span>+{xpAmount} XP</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-300 ${isChecked ? 'bg-accent-green border-accent-green' : 'border-text-secondary'}`}>
                {isChecked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
        </div>
    );
};

const DayView: React.FC<{ 
    day: DayPlan; 
    checkedItems: Record<string, boolean>; 
    onToggle: (id: string, xp: number, name: string) => void;
    isInitiallyOpen: boolean;
}> = ({ day, checkedItems, onToggle, isInitiallyOpen }) => {
    const [isOpen, setIsOpen] = useState(isInitiallyOpen);

    const completedExercises = useMemo(() => day.exercises.filter(ex => checkedItems[`${day.day}-${ex.name}`]).length, [day, checkedItems]);
    const totalExercises = day.exercises.length;
    const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    if (day.exercises.length === 0) {
        return (
             <div className="bg-surface rounded-xl p-6 border border-border-color">
                <h3 className="text-xl font-bold text-text-primary">{day.day}</h3>
                <p className="text-text-secondary mt-1">{day.focus}</p>
            </div>
        )
    }

    return (
        <div className="bg-surface rounded-xl border border-border-color overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-6 text-left hover:bg-surface-light/50 transition-colors"
                aria-expanded={isOpen}
            >
                <div>
                    <h3 className="text-xl font-bold text-text-primary">{day.day}</h3>
                    <p className="text-primary font-semibold text-sm mt-1">{day.focus}</p>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1500px]' : 'max-h-0'}`}>
                <div className="px-6 pb-6 space-y-3">
                    <div className="w-full bg-surface-light rounded-full h-2.5 my-2 overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    {day.exercises.map((exercise, index) => (
                        <ExerciseItem
                            key={index}
                            exercise={exercise}
                            dayIdentifier={day.day}
                            isChecked={!!checkedItems[`${day.day}-${exercise.name}`]}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};


const BottomNav: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Missions', icon: ClipboardDocumentListIcon },
        { path: '/workouts', label: 'Workouts', icon: DumbbellIcon },
        { path: '/stats', label: 'Stats', icon: ChartBarIcon },
        { path: '/profile', label: 'Profile', icon: UserIcon },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm border-t border-border-color z-10">
            <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
                {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <NavLink 
                            key={item.path}
                            to={item.path}
                            end // important for the root route
                            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors relative ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                             {/* FIX: The `isActive` variable is only available within a render prop for NavLink's children. */}
                             {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute top-0 h-1 w-12 bg-primary rounded-b-full"></div>}
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                                </>
                             )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

const WorkoutView: React.FC<{
    checkedItems: Record<string, boolean>;
    handleToggleCheck: (id: string, xp: number, name: string) => void;
}> = ({ checkedItems, handleToggleCheck }) => (
    <div>
        <h2 className="text-3xl font-extrabold text-text-primary mb-6 px-2">Seu Plano Semanal</h2>
        <div className="space-y-4">
            {workoutPlan.weekly_plan[0].days.map((day, index) => (
                <DayView 
                    key={index} 
                    day={day} 
                    checkedItems={checkedItems} 
                    onToggle={handleToggleCheck} 
                    isInitiallyOpen={index === 0}
                />
            ))}
        </div>
    </div>
);

const MissionItem: React.FC<{
    mission: DailyMission;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ mission, onToggle, onDelete }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const update = () => mission.createdAt + MISSION_DURATION - Date.now();
        setTimeLeft(update());

        if (mission.completed) {
            return; // Stop and don't start a new timer if completed
        }

        const timerId = setInterval(() => {
            const newTimeLeft = update();
            if (newTimeLeft > 0) {
                setTimeLeft(newTimeLeft);
            } else {
                setTimeLeft(0);
                clearInterval(timerId);
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [mission.id, mission.completed, mission.createdAt]);

    const hoursLeft = timeLeft / (1000 * 60 * 60);

    const missionStatusClass = useMemo(() => {
        if (mission.completed) return 'bg-accent-green/10 border-accent-green';
        if (hoursLeft <= 4) return 'bg-red-500/10 border-red-500';
        if (hoursLeft <= 12) return 'bg-yellow-500/10 border-yellow-500';
        return 'bg-surface-light border-transparent hover:border-primary/50';
    }, [mission.completed, hoursLeft]);

    return (
        <div
            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 border-2 ${missionStatusClass}`}
        >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <button 
                    onClick={() => onToggle(mission.id)} 
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-transform hover:scale-110 ${mission.completed ? 'bg-accent-green border-accent-green' : 'border-text-secondary'}`} 
                    aria-checked={mission.completed} 
                    disabled={timeLeft <= 0 && !mission.completed}
                >
                    {mission.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                    <p className={`truncate ${mission.completed || timeLeft <= 0 ? 'text-text-secondary line-through' : 'text-text-primary'}`}>{mission.text}</p>
                    <div className="flex items-center text-xs text-text-secondary mt-1 font-mono bg-surface px-2 py-1 rounded-full w-fit">
                        <ClockIcon className="w-4 h-4 mr-1.5"/>
                        <span>{formatTimeLeft(timeLeft)}</span>
                    </div>
                </div>
                <span className="bg-secondary/20 text-secondary text-xs font-bold px-2.5 py-1 rounded-full">{mission.xp} XP</span>
            </div>
            <button onClick={() => onDelete(mission.id)} className="ml-4 p-2 rounded-full text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors">
                 <TrashIcon className="w-5 h-5"/>
            </button>
        </div>
    );
};


const MissionsView: React.FC<{
    missions: DailyMission[];
    onAddMission: (mission: Omit<DailyMission, 'id' | 'completed' | 'createdAt'>) => void;
    onToggleMission: (id: string) => void;
    onDeleteMission: (id: string) => void;
}> = ({ missions, onAddMission, onToggleMission, onDeleteMission }) => {
    const [text, setText] = useState('');
    const [xp, setXp] = useState(MISSION_XP_AMOUNTS[1]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onAddMission({ text: text.trim(), xp });
            setText('');
            setXp(MISSION_XP_AMOUNTS[1]);
        }
    };
    
    const sortedMissions = useMemo(() => {
        return [...missions].sort((a, b) => (a.createdAt + MISSION_DURATION) - (b.createdAt + MISSION_DURATION));
    }, [missions]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-text-primary px-2">Missões Diárias</h2>
            <form onSubmit={handleSubmit} className="bg-surface p-4 rounded-xl space-y-4 border border-border-color shadow-sm">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nova missão (duração de 24h)..."
                    className="w-full bg-surface-light border-border-color border rounded-md p-3 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                         <span className="text-text-secondary text-sm font-medium">XP:</span>
                        {MISSION_XP_AMOUNTS.map(amount => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => setXp(amount)}
                                className={`px-3 py-1 text-sm rounded-full font-bold transition-all duration-200 ${xp === amount ? 'bg-secondary text-white scale-110' : 'bg-surface-light text-text-secondary hover:scale-105'}`}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center space-x-2 ml-4">
                        <PlusIcon className="w-5 h-5" />
                        <span>Adicionar</span>
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {sortedMissions.map(mission => (
                    <MissionItem
                        key={mission.id}
                        mission={mission}
                        onToggle={onToggleMission}
                        onDelete={onDeleteMission}
                    />
                ))}
                 {missions.length === 0 && <p className="text-center text-text-secondary py-8">Adicione sua primeira missão diária!</p>}
            </div>
        </div>
    );
};


const StatsView: React.FC<{ level: number, xp: number, xpForNextLevel: number, history: XpHistory[] }> = ({ level, xp, xpForNextLevel, history }) => {
    const weeklyProgress = useMemo(() => {
        const data = [];
        const today = new Date();
        const todayDateString = getTodaysDateString();
        const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // pt-BR: Domingo, Segunda, Terça...

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const historyEntry = history.find(h => h.date === dateString);
            data.push({
                name: dayNames[date.getDay()],
                xp: historyEntry ? historyEntry.xp : 0,
                isToday: dateString === todayDateString
            });
        }
        return data;
    }, [history]);

    const [chartData, setChartData] = useState(() => weeklyProgress.map(d => ({ ...d, xp: 0 })));

    useEffect(() => {
        const timer = setTimeout(() => {
            setChartData(weeklyProgress);
        }, 100);
        return () => clearTimeout(timer);
    }, [weeklyProgress]);
    
    const maxWeeklyXp = Math.max(100, ...weeklyProgress.map(d => d.xp));
    const totalWeeklyXp = weeklyProgress.reduce((sum, day) => sum + day.xp, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-text-primary px-2">Suas Estatísticas</h2>
            <div className="bg-gradient-to-br from-surface to-background p-6 rounded-xl border border-border-color text-center shadow-lg shadow-primary/10">
                 <div className="flex items-center justify-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-text-secondary" />
                    <p className="text-sm text-text-secondary font-medium">Seu Nível Atual</p>
                 </div>
                 <p className="text-8xl font-extrabold text-primary my-2" style={{ textShadow: '0 0 15px var(--color-primary)' }}>{level}</p>
                 <p className="font-mono text-text-primary">{xp} / {xpForNextLevel} XP para o próximo nível</p>
                 <div className="w-full bg-surface-light rounded-full h-3.5 mt-4 overflow-hidden">
                    <div 
                        className="bg-primary h-3.5 rounded-full transition-all duration-500 shadow-[0_0_10px_theme(colors.primary)]" 
                        style={{ width: `${xpForNextLevel > 0 ? (xp/xpForNextLevel)*100 : 0}%` }}
                    ></div>
                </div>
            </div>
            
            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-sm">
                <div className="flex justify-between items-baseline mb-6">
                    <h3 className="text-lg font-bold text-text-primary">Progresso Semanal</h3>
                    <p className="text-sm text-text-secondary font-mono">Total: <span className="text-secondary font-bold text-base">{totalWeeklyXp} XP</span></p>
                </div>
                <div className="relative pl-8"> {/* Space for Y-axis labels */}
                    <div className="flex justify-between items-end h-56 space-x-2">
                        {chartData.map((day, i) => {
                            const barHeight = (day.xp / maxWeeklyXp) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${day.name}: ${day.xp} XP`}>
                                    <span className="text-xs text-text-primary font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:-translate-y-1">{day.xp > 0 ? day.xp : ''}</span>
                                    <div 
                                        className={`w-full rounded-t-md relative transition-all duration-700 ease-out ${day.isToday ? 'bg-secondary' : 'bg-primary group-hover:bg-primary-hover'}`}
                                        style={{ height: `${barHeight}%`}}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-md"></div>
                                    </div>
                                    <p className={`text-sm mt-2 font-medium ${day.isToday ? 'text-secondary font-bold' : 'text-text-secondary'}`}>{day.name}</p>
                                </div>
                            );
                        })}
                    </div>
                    {/* Y-axis labels for context */}
                    <div className="absolute left-0 top-0 h-[calc(100%-1.5rem)] flex flex-col justify-between text-xs text-text-secondary font-mono">
                         <span>{maxWeeklyXp}</span>
                         <span>{Math.round(maxWeeklyXp/2)}</span>
                         <span>0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileView: React.FC<{
    level: number;
    activityLog: ActivityLogItem[];
    dailyQuote: string;
    onReset: () => void;
}> = ({ level, activityLog, dailyQuote, onReset }) => {
    const sortedLog = useMemo(() => [...activityLog].reverse(), [activityLog]);
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-text-primary px-2">Seu Perfil</h2>
            
            <div className="bg-surface p-6 rounded-xl border border-border-color text-center italic border-l-4 border-secondary">
                <SparklesIcon className="w-6 h-6 mx-auto text-secondary mb-3" />
                <p className="text-text-primary">"{dailyQuote}"</p>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-4">Seus Títulos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLAYER_TITLES.map((title, index) => {
                        const isUnlocked = level >= title.level;
                        return (
                            <div key={index} className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-br from-surface-light to-surface border border-secondary/50' : 'bg-surface/50 grayscale opacity-60'}`}>
                                {isUnlocked ? <TrophyIcon className="w-8 h-8 text-secondary flex-shrink-0" /> : <LockClosedIcon className="w-8 h-8 text-text-secondary flex-shrink-0" />}
                                <div>
                                    <p className={`font-bold text-lg ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>{title.name}</p>
                                    <p className="text-sm text-text-secondary">Desbloqueado no Nível {title.level}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-surface p-6 rounded-xl border border-border-color shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-4">Histórico de Atividades</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {sortedLog.length > 0 ? sortedLog.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm p-3 rounded-lg hover:bg-surface-light/50">
                           <div className="flex items-center space-x-3">
                                {item.type === 'exercise' ? <DumbbellIcon className="w-5 h-5 text-primary"/> : <ClipboardDocumentListIcon className="w-5 h-5 text-accent-green" />}
                                <div>
                                    <p className="text-text-primary font-medium">{item.text}</p>
                                    <p className="text-xs text-text-secondary">{timeAgo(item.completedAt)}</p>
                                </div>
                           </div>
                           <span className="font-bold text-secondary">+{item.xp} XP</span>
                        </div>
                    )) : <p className="text-text-secondary text-center py-4">Nenhuma atividade registrada ainda. Complete um exercício ou missão!</p>}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={onReset}
                    className="w-full bg-red-600/20 text-red-400 font-bold py-3 px-6 rounded-lg hover:bg-red-600/40 hover:text-red-300 transition-colors flex items-center justify-center space-x-2 border border-red-500/50 hover:border-red-500">
                    <TrashIcon className="w-5 h-5" />
                    <span>Resetar Todo o Progresso</span>
                </button>
            </div>
        </div>
    );
}

const AvatarModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    avatars: string[];
    currentAvatar: string;
    onSelectAvatar: (url: string) => void;
    onUploadClick: () => void;
}> = ({ isOpen, onClose, avatars, currentAvatar, onSelectAvatar, onUploadClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface rounded-xl p-6 w-full max-w-md border border-border-color shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-text-primary mb-4">Escolha seu Avatar</h3>
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {avatars.map(avatar => (
                        <img
                            key={avatar}
                            src={avatar}
                            alt="Avatar option"
                            className={`w-20 h-20 rounded-full cursor-pointer transition-all duration-200 border-4 ${currentAvatar === avatar ? 'border-primary scale-105' : 'border-transparent hover:border-primary-hover hover:scale-105'}`}
                            onClick={() => onSelectAvatar(avatar)}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center">
                     <button 
                        onClick={onUploadClick}
                        className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors">
                        Carregar Imagem
                    </button>
                    <button 
                        onClick={onClose}
                        className="bg-surface-light text-text-primary font-bold py-2 px-6 rounded-lg hover:bg-surface-light/80 transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

const LevelUpModal: React.FC<{
    info: LevelUpInfo;
    onClose: () => void;
}> = ({ info, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 10); // Delay for transition
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
    };
    
    return (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
            <div 
                className={`bg-surface rounded-2xl p-8 w-full max-w-sm border-2 border-primary shadow-2xl shadow-primary/20 text-center transform transition-all duration-300 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <ShieldCheckIcon className="w-20 h-20 text-secondary mx-auto -mt-20 bg-surface rounded-full p-2 border-4 border-surface" />
                <h2 className="text-4xl font-extrabold text-secondary mt-4">LEVEL UP!</h2>
                <p className="text-text-primary text-lg mt-2">Parabéns! Você alcançou o nível {info.level}.</p>
                <p className="text-text-secondary text-2xl font-bold mt-4">Agora você é um <span className="text-primary">{info.name}</span>!</p>
                <button 
                    onClick={handleClose}
                    className="mt-8 bg-primary text-white font-bold py-3 px-10 rounded-lg hover:bg-primary-hover transition-colors w-full">
                    Continuar Jornada
                </button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, boolean>>('workout-progress', initialCheckedItems);
    const [avatarUrl, setAvatarUrl] = useLocalStorage<string>('user-avatar', defaultAvatar);
    const [level, setLevel] = useLocalStorage<number>('player-level', 1);
    const [xp, setXp] = useLocalStorage<number>('player-xp', 0);
    const [xpHistory, setXpHistory] = useLocalStorage<XpHistory[]>('player-xp-history', []);
    const [missions, setMissions] = useLocalStorage<DailyMission[]>('player-missions', []);
    const [activityLog, setActivityLog] = useLocalStorage<ActivityLogItem[]>('activity-log', []);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const xpForNextLevel = useMemo(() => calculateXpForNextLevel(level), [level]);
    const playerTitle = useMemo(() => getPlayerTitle(level), [level]);
    
    // Daily quote logic
    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
    }, []);

    // Mission expiration logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const activeMissions = missions.filter(m => now < m.createdAt + MISSION_DURATION);
            if (activeMissions.length !== missions.length) {
                setMissions(activeMissions);
            }
        }, 60000); // Check for expired missions every minute
        return () => clearInterval(interval);
    }, [missions, setMissions]);


    // --- AUDIO LOGIC ---
    const playSound = (type: 'complete' | 'levelUp' | 'add' | 'delete') => {
        if (!audioCtxRef.current) {
             audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        
        try {
            if (type === 'complete') {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.3, now);
                oscillator.frequency.setValueAtTime(600, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
                
                oscillator.start(now);
                oscillator.stop(now + 0.15);
            } else if (type === 'levelUp') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(freq, now + i * 0.1);
                    gainNode.gain.setValueAtTime(0.4, now + i * 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + (i + 1) * 0.1);
                    
                    oscillator.start(now + i * 0.1);
                    oscillator.stop(now + (i + 1) * 0.1);
                });
            } else if (type === 'add') {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523, now);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

                oscillator.start(now);
                oscillator.stop(now + 0.2);

            } else if (type === 'delete') {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, now);
                gainNode.gain.setValueAtTime(0.3, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

                oscillator.start(now);
                oscillator.stop(now + 0.2);
            }
        } catch (error) {
            console.error("Failed to play sound:", error);
        }
    };


    // --- CORE LOGIC ---
    const addXp = (amount: number) => {
        let newXp = xp + amount;
        let newLevel = level;
        const originalLevel = level;
        let requiredXp = calculateXpForNextLevel(newLevel);
        let leveledUp = false;

        while (newXp >= requiredXp) {
            newXp -= requiredXp;
            newLevel++;
            leveledUp = true;
            requiredXp = calculateXpForNextLevel(newLevel);
        }
        
        if (leveledUp) {
            playSound('levelUp');
            const newTitle = [...PLAYER_TITLES]
                .reverse()
                .find(title => newLevel >= title.level && originalLevel < title.level);
            
            if (newTitle) {
                setLevelUpInfo(newTitle);
            }
        }

        setXp(newXp);
        setLevel(newLevel);

        // Update XP history for today
        const today = getTodaysDateString();
        setXpHistory(prev => {
            const todayEntry = prev.find(entry => entry.date === today);
            if (todayEntry) {
                return prev.map(entry => 
                    entry.date === today 
                    ? { ...entry, xp: Math.max(0, entry.xp + amount) } 
                    : entry
                );
            } else {
                return [...prev, { date: today, xp: Math.max(0, amount) }];
            }
        });
    };

    const handleToggleCheck = (id: string, xpAmount: number, name: string) => {
        const isChecked = !checkedItems[id];
        if (isChecked) {
            playSound('complete');
            setActivityLog(prev => [...prev, { id: `exercise-${id}`, text: name, xp: xpAmount, type: 'exercise', completedAt: Date.now() }]);
        } else {
            setActivityLog(prev => prev.filter(item => item.id !== `exercise-${id}`));
        }
        addXp(isChecked ? xpAmount : -xpAmount);
        setCheckedItems(prev => ({ ...prev, [id]: isChecked }));
    };
    
    const resetProgress = () => {
      if(window.confirm('Tem certeza de que deseja zerar todo o seu progresso? Isso inclui níveis, XP, missões e histórico.')) {
        setCheckedItems(initialCheckedItems);
        setLevel(1);
        setXp(0);
        setMissions([]);
        setXpHistory([]);
        setActivityLog([]);
      }
    };
    
    // --- AVATAR LOGIC ---
    const handleAvatarClick = () => setIsAvatarModalOpen(true);
    
    const handleSelectAvatar = (url: string) => {
        setAvatarUrl(url);
        setIsAvatarModalOpen(false);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
        setIsAvatarModalOpen(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result;
                if (typeof result === 'string') setAvatarUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- MISSION LOGIC ---
    const addMission = (mission: Omit<DailyMission, 'id' | 'completed' | 'createdAt'>) => {
        const newMission: DailyMission = {
            ...mission,
            id: crypto.randomUUID(),
            completed: false,
            createdAt: Date.now(),
        };
        setMissions(prev => [...prev, newMission]);
        playSound('add');
    };
    
    const toggleMissionCompletion = (id: string) => {
        let xpAmount = 0;
        let missionJustCompleted = false;
        const newMissions = missions.map(mission => {
            if (mission.id === id) {
                const isNowCompleted = !mission.completed;
                if (isNowCompleted) {
                    missionJustCompleted = true;
                    setActivityLog(prev => [...prev, { id: `mission-${id}`, text: mission.text, xp: mission.xp, type: 'mission', completedAt: Date.now() }]);
                } else {
                    setActivityLog(prev => prev.filter(item => item.id !== `mission-${id}`));
                }
                xpAmount = isNowCompleted ? mission.xp : -mission.xp;
                return { ...mission, completed: isNowCompleted };
            }
            return mission;
        });
        
        if(missionJustCompleted) {
            playSound('complete');
        }

        setMissions(newMissions);
        if (xpAmount !== 0) addXp(xpAmount);
    };

    const deleteMission = (id: string) => {
        playSound('delete');
        const missionToDelete = missions.find(m => m.id === id);
        if(missionToDelete) {
             if(missionToDelete.completed) {
                addXp(-missionToDelete.xp);
            }
            setActivityLog(prev => prev.filter(item => item.id !== `mission-${id}`));
        }
        setMissions(prev => prev.filter(mission => mission.id !== id));
    };

    return (
        <div className="min-h-screen bg-background font-sans pb-24 pt-28">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <AvatarModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                avatars={PREDEFINED_AVATARS}
                currentAvatar={avatarUrl}
                onSelectAvatar={handleSelectAvatar}
                onUploadClick={handleUploadClick}
            />
             {levelUpInfo && <LevelUpModal info={levelUpInfo} onClose={() => setLevelUpInfo(null)} />}
            <Header 
                avatarUrl={avatarUrl} 
                onAvatarClick={handleAvatarClick}
                level={level}
                title={playerTitle}
                xp={xp}
                xpForNextLevel={xpForNextLevel}
            />
            <div className="max-w-4xl mx-auto p-4">
                <main>
                    <Routes>
                        <Route path="/" element={<MissionsView missions={missions} onAddMission={addMission} onToggleMission={toggleMissionCompletion} onDeleteMission={deleteMission} />} />
                        <Route path="/workouts" element={<WorkoutView checkedItems={checkedItems} handleToggleCheck={handleToggleCheck} />} />
                        <Route path="/stats" element={<StatsView level={level} xp={xp} xpForNextLevel={xpForNextLevel} history={xpHistory} />} />
                        <Route path="/profile" element={<ProfileView level={level} activityLog={activityLog} dailyQuote={dailyQuote} onReset={resetProgress} />} />
                    </Routes>
                </main>
            </div>
            <BottomNav />
        </div>
    );
};

export default App;
