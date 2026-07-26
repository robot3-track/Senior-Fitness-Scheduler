export interface Exercise {
  id: string;
  name: string;
  description: string;
  minutes: number;
  category: 'aerobic' | 'strength' | 'flexibility' | 'balance';
  targetMuscles: string[];
  instructions: string[];
  imageUrl: string;
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
    description: 'A gentle, low-impact exercise to lift your heart rate safely while staying comfortably seated in a sturdy chair.',
    minutes: 10,
    category: 'aerobic',
    targetMuscles: ['Legs', 'Core'],
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Sit tall in a solid chair that won\'t slide, keeping your feet flat on the ground.',
      'Grip the sides of your seat if you want extra balance.',
      'Lift your right knee up toward your chest as high as feels good, then put it back down.',
      'Switch to your left leg and keep alternating like you\'re marching in place.',
      'Find a steady breathing rhythm—you should still be able to hold a conversation while doing this.'
    ]
  },
  {
    id: 'ex_2',
    name: 'Wall Push-Ups',
    description: 'A friendly upper-body move that uses a plain wall to build strength in your arms, chest, and shoulders.',
    minutes: 5,
    category: 'strength',
    targetMuscles: ['Arms', 'Chest', 'Shoulders'],
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Face a clear wall and stand a little bit further than an arm\'s length away.',
      'Put your hands flat against the wall right around shoulder height.',
      'Bend your elbows slowly to bring your body closer to the wall, keeping your heels down if you can.',
      'Push gently back out until your arms are straight again, but don\'t lock your elbows.',
      'Aim for 8 to 10 reps, taking a short breather whenever you need to.'
    ]
  },
  {
    id: 'ex_3',
    name: 'Chair Sit-to-Stand',
    description: 'One of the best practical leg exercises to make getting up out of chairs, cars, and couches much easier.',
    minutes: 8,
    category: 'strength',
    targetMuscles: ['Legs', 'Core'],
    imageUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Sit near the front edge of a sturdy chair with your feet shoulder-width apart.',
      'Lean your upper body slightly forward over your knees.',
      'Push down through your heels and use your leg muscles to stand all the way up.',
      'Pause for a second at the top, then slowly lower yourself back into the chair—try not to just plop down.',
      'Do about 8 to 10 stand-ups at a calm, controlled pace.'
    ]
  },
  {
    id: 'ex_4',
    name: 'Heel Raises',
    description: 'Builds up calf strength and ankle stability, which helps you stay steady on your feet throughout the day.',
    minutes: 5,
    category: 'strength',
    targetMuscles: ['Legs'],
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Stand behind a sturdy chair or kitchen counter and lightly rest your fingers on top for balance.',
      'Keep your back straight and push up onto the balls of your feet, lifting your heels off the floor.',
      'Hold at the top for a quick count of one.',
      'Slowly lower your heels back down flat onto the floor.',
      'Try doing this 10 to 12 times.'
    ]
  },
  {
    id: 'ex_5',
    name: 'Tandem (Heel-to-Toe) Stand',
    description: 'A classic fall-prevention exercise that challenges your balance by narrowing your stance.',
    minutes: 5,
    category: 'balance',
    targetMuscles: ['Legs', 'Core'],
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Stand right next to a counter or chair back so you have something to grab if you wobble.',
      'Place one foot directly in front of the other, with the heel of your front foot touching the toes of your back foot.',
      'Look straight ahead at a fixed point on the wall to help keep your focus.',
      'Try to hold your balance here for 10 to 15 seconds.',
      'Switch which foot is in front and do it again.'
    ]
  },
  {
    id: 'ex_6',
    name: 'Single-Leg Balance Hold',
    description: 'Simple one-leg standing practice that reinforces hip and core stability for safer walking.',
    minutes: 5,
    category: 'balance',
    targetMuscles: ['Legs', 'Core'],
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Stand next to a solid chair or wall with one hand resting gently on it.',
      'Shift your weight onto your inside leg and lift your outside foot just a few inches off the floor.',
      'Hold yourself tall and keep your standing knee slightly relaxed, not locked stiff.',
      'Try holding for 10 seconds before putting your foot down.',
      'Turn around and repeat on the other side.'
    ]
  },
  {
    id: 'ex_7',
    name: 'Seated Torso Twists',
    description: 'A gentle stretching exercise to keep your spine relaxed and flexible when turning or reaching.',
    minutes: 5,
    category: 'flexibility',
    targetMuscles: ['Core', 'Back'],
    imageUrl: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80',
    instructions: [
      'Sit up tall in your chair with your feet flat on the floor.',
      'Rest your hands on your thighs or fold your arms comfortably across your chest.',
      'Gently turn your head and shoulders to the right as far as comfortable without straining.',
      'Hold the stretch while taking a calm breath, then turn back to the middle.',
      'Do the same thing toward the left side, repeating about 5 times each way.'
    ]
  }
];

export function getWeekDates() {
  const dates = [];
  const today = new Date();
  
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayOfMonth: d.getDate(),
      isToday: i === 0
    });
  }
  
  return dates;
}