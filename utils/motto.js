const mottos = [
    "Your future starts here.",
    "Unlock your potential.",
    "Secure your dreams.",
    "Empower your ambitions.",
    "Innovation starts with you.",
    "Shape your destiny.",
    "Dream. Plan. Achieve.",
    "One step closer to success.",
    "Believe in the process.",
    "Strive for excellence.",
  ];
  
  export function randomMotto() {
    return mottos[Math.floor(Math.random() * mottos.length)];
  }
  