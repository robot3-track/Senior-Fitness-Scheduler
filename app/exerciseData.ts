export interface Exercise {
  id: string;
  name: string;
  description: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'flexibility' | 'balance';
  targetMuscles: string[];
  instructions: string[];
}

export const MUSCLE_GROUPS = [
  'Legs', 
  'Arms', 
  'Core', 
  'Back', 
  'Shoulders', 
  'Chest'
];

export const EXERCISES_DB: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Seated Marching',
    description: 'A gentle aerobic exercise to get your heart rate up while safely seated.',
    minutes: 10,
    category: 'aerobic',
    targetMuscles: ['Legs', 'Core'],
    instructions: [
      'Sit up straight in a sturdy chair with your feet flat on the floor.',
      'Hold the edges of the chair for support if needed.',
      'Lift your right knee up as high as is comfortable, then lower it.',
      'Alternate with your left knee, marching in place.',
      'Keep a steady, comfortable pace and breathe normally.'
    ]
  },
  {
    id: 'ex_2',
    name: 'Wall Push-Ups',
    description: 'Build upper body strength safely using a wall for support.',
    minutes: 5,
    category: 'strength',
    targetMuscles: ['Arms', 'Chest', 'Shoulders'],
    instructions: [
      'Stand facing a sturdy wall, about arm\'s length away.',
      'Place your hands flat against the wall at shoulder height and width.',
      'Slowly bend your elbows and lean your body toward the wall.',
      'Push back slowly until your arms are straight.',
      'Repeat 10 times, taking breaks if you feel tired.'
    ]
  },
  {
    id: 'ex_3',
    name: 'Heel Raises',
    description: 'Strengthens your calves and helps improve balance.',
    minutes: 5,
    category: 'strength',
    targetMuscles: ['Legs'],
    instructions: [
      'Stand behind a sturdy chair and hold the back for balance.',
      'Slowly lift your heels off the floor so you are standing on your toes.',
      'Hold the position for one second.',
      'Slowly lower your heels back to the floor.',
      'Repeat 10 to 15 times.'
    ]
  },
  {
    id: 'ex_4',
    name: 'Seated Torso Twists',
    description: 'Improves core flexibility and reduces back stiffness.',
    minutes: 5,
    category: 'flexibility',
    targetMuscles: ['Core', 'Back'],
    instructions: [
      'Sit upright in a chair with your feet flat on the floor.',
      'Place your hands comfortably on your thighs.',
      'Slowly turn your upper body to the right, looking over your right shoulder.',
      'Hold for 5 seconds, then slowly return to the center.',
      'Repeat on the left side. Do 5 twists per side.'
    ]
  }
];

// Helper function to generate a simple sliding window of dates for the UI calendar
export function getWeekDates() {
  const dates = [];
  const today = new Date();
  
  // Get 3 days before, today, and 3 days after
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateString: d.toISOString().split('T')[0], // Format: YYYY-MM-DD
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), // Format: Mon, Tue
      dayOfMonth: d.getDate(),
      isToday: i === 0
    });
  }
  
  return dates;
}