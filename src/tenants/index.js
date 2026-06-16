import evolve from "./evolve";
import anant from "./anant";

const TENANT_MAP = {
  "evolvedesign.academy": evolve,
  "www.evolvedesign.academy": evolve,
  "dev.evolvedesign.academy": evolve,
  "anu.evolvedesign.academy": anant,
  localhost: anant,
  // localhost: evolve,
  "127.0.0.1": evolve
};

const hostname =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const tenant = TENANT_MAP[hostname] ?? evolve;

export const isAnant = tenant.id === "anant";
export const isEvolve = tenant.id === "evolve";
