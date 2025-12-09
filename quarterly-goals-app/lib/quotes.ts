export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  // Stoic Philosophy
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "He who fears death will never do anything worth of a man who is alive.", author: "Seneca" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "If it is not right, do not do it. If it is not true, do not say it.", author: "Marcus Aurelius" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },

  // James Clear
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.", author: "James Clear" },
  { text: "You should be far more concerned with your current trajectory than with your current results.", author: "James Clear" },
  { text: "Success is the product of daily habits—not once-in-a-lifetime transformations.", author: "James Clear" },
  { text: "Goals are good for setting a direction, but systems are best for making progress.", author: "James Clear" },
  { text: "The greatest threat to success is not failure but boredom.", author: "James Clear" },
  { text: "Be patient. Get 1% better each day.", author: "James Clear" },
  { text: "Professionals stick to the schedule; amateurs let life get in the way.", author: "James Clear" },
  { text: "Motivation is overrated. Environment often matters more.", author: "James Clear" },
  { text: "Does this behavior help me become the type of person I wish to be?", author: "James Clear" },

  // BJ Fogg
  { text: "The best way to change your behavior is to change your environment.", author: "BJ Fogg" },
  { text: "Make it easy. The easier a behavior is to do, the more likely it is to become a habit.", author: "BJ Fogg" },
  { text: "Celebrate small wins. Emotions create habits.", author: "BJ Fogg" },

  // Charles Duhigg
  { text: "Change might not be fast and it isn't always easy. But with time and effort, almost any habit can be reshaped.", author: "Charles Duhigg" },
  { text: "Champions don't do extraordinary things. They do ordinary things, but they do them without thinking, too fast for the other team to react.", author: "Charles Duhigg" },

  // Stephen Covey
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey" },
  { text: "Begin with the end in mind.", author: "Stephen Covey" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },

  // Gretchen Rubin
  { text: "What we do every day matters more than what we do once in a while.", author: "Gretchen Rubin" },
  { text: "The things that go wrong often make the best memories.", author: "Gretchen Rubin" },

  // Additional Stoic
  { text: "He who laughs at himself never runs out of things to laugh at.", author: "Epictetus" },
  { text: "How long are you going to wait before you demand the best for yourself?", author: "Epictetus" },
  { text: "The chief task in life is simply this: to identify and separate matters so that I can say clearly to myself which are externals not under my control, and which have to do with the choices I actually control.", author: "Epictetus" },
  { text: "True happiness is to enjoy the present, without anxious dependence upon the future.", author: "Seneca" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" }
];

export function getRandomQuote(): Quote {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
}
