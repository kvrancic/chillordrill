const mottos = [
  "Some courses are like Swiss cheese – they have holes, but you still want to try them.",
  "Learn or burn – the choice is yours.",
  "Success doesn’t wait for slow loaders.",
  "Your GPA won’t carry itself – start hustling.",
  "Innovate or evaporate.",
  "If failure is the best teacher, why not ace the next test?",
  "Knowledge is power – ignorance is expensive.",
  "Every click is a step closer to domination.",
  "Take the course, not the shortcut.",
  "Great minds don't procrastinate – much.",
];

export function randomMotto() {
  return mottos[Math.floor(Math.random() * mottos.length)];
}
