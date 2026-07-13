export interface Exercise {
  id: string;
  name: string;
  category: 'aerobic' | 'strength' | 'balance' | 'stretch';
  minutes: number;
  description: string;
  instructions: string[];
  safetyTip: string;
  targetMuscles: string[];
}

export const EXERCISES_DB: Exercise[] = [
  {
    id: 'brisk-walk',
    name: 'Brisk Walking',
    category: 'aerobic',
    minutes: 30,
    description: 'A gentle but active walk. Move at a pace where you can comfortably talk, but not sing.',
    instructions: [
      'Put on comfortable, supportive walking shoes.',
      'Hold your head up high, look forward, and relax your shoulders and neck.',
      'Swing your arms freely with a slight bend in your elbows.',
      'Walk smoothly, letting your foot roll gently from heel to toe.'
    ],
    safetyTip: 'Walk on level, well-lit pathways. Bring water along, and slow down if you feel out of breath.',
    targetMuscles: ['Heart', 'Calves', 'Thighs']
  },
  {
    id: 'chair-stand',
    name: 'Sit-to-Stand (Chair Stands)',
    category: 'strength',
    minutes: 10,
    description: 'Strengthens your legs, thighs, and hips, making it easier to stand up from chairs or cars.',
    instructions: [
      'Find a sturdy, armless chair. Place its back securely against a flat wall.',
      'Sit toward the front of the seat, with your feet flat on the floor, hip-width apart.',
      'Fold your arms across your chest, or hold them straight out parallel to the floor.',
      'Lean forward slightly from your hips, and stand up slowly using only your leg strength.'
    ],
    safetyTip: 'Never use a chair with wheels. Keep your knees aligned over your ankles as you rise.',
    targetMuscles: ['Thighs', 'Hips', 'Glutes']
  },
  {
    id: 'wall-pushup',
    name: 'Wall Push-Ups',
    category: 'strength',
    minutes: 10,
    description: 'Builds vital upper-body strength in your chest, shoulders, and arms without straining your lower back.',
    instructions: [
      'Stand upright about arm\'s length facing a solid, flat wall.',
      'Place your palms flat against the wall at shoulder height and shoulder-width apart.',
      'Keep your body straight. Slowly bend your elbows and lean your face in toward the wall.'
    ],
    safetyTip: 'Make sure your shoes have good traction and the floor is dry and clean.',
    targetMuscles: ['Chest', 'Shoulders', 'Arms']
  },
  {
    id: 'single-leg',
    name: 'Single-Leg Stand',
    category: 'balance',
    minutes: 5,
    description: 'Excellent for boosting balance and foot-ankle stability, reducing the risk of slips or falls.',
    instructions: [
      'Stand beside a sturdy chair, heavy counter, or wall. Place one hand on it for support.',
      'Slowly lift one foot slightly off the floor, balancing entirely on your other leg.',
      'Try to hold this balanced posture for 15 to 30 seconds.'
    ],
    safetyTip: 'Always keep your hands within an inch of your support source in case you wobble.',
    targetMuscles: ['Ankles', 'Calves', 'Core']
  }
];

export const MUSCLE_GROUPS = ['Heart', 'Calves', 'Thighs', 'Hips', 'Glutes', 'Chest', 'Shoulders', 'Arms', 'Ankles', 'Core'];

export function getWeekDates() {
  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dates = [];
  const todayStr = today.toISOString().split('T')[0];
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    dates.push({
      dateString: dayDate.toISOString().split('T')[0],
      dayName: dayNames[i],
      dayOfMonth: dayDate.getDate(),
      monthLabel: dayDate.toLocaleDateString('en-US', { month: 'short' }),
      isToday: todayStr === dayDate.toISOString().split('T')[0]
    });
  }
  return dates;
}