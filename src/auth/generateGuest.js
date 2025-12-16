export function generateGuestProfile() {
  const adjectives = ["blue", "gold", "silent", "wild", "rapid"];
  const animals = ["wolf", "tiger", "panda", "hawk", "lion"];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(Math.random() * 900 + 100);

  const username = `evolve_${adj}_${animal}_${num}`;
  const avatar_url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${username}`;

  return { username, avatar_url };
}
