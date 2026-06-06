import type { SimulatedMatch, SimulationTeam } from "@/lib/simulation/types";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function poisson(lambda: number) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count += 1;
    product *= Math.random();
  } while (product > limit);

  return count - 1;
}

function expectedGoals(attacking: SimulationTeam, defending: SimulationTeam, homeAdvantage: number) {
  const qualityEdge = (attacking.attack - defending.defense) / 18;
  const gameNoise = (Math.random() - 0.5) * 0.5;

  return clamp(1.18 + qualityEdge + homeAdvantage + gameNoise, 0.18, 3.35);
}

export function simulateMatch(homeTeam: SimulationTeam, awayTeam: SimulationTeam): SimulatedMatch {
  const homeExpected = expectedGoals(homeTeam, awayTeam, 0.22);
  const awayExpected = expectedGoals(awayTeam, homeTeam, -0.05);
  const homeGoals = clamp(poisson(homeExpected), 0, 6);
  const awayGoals = clamp(poisson(awayExpected), 0, 6);

  return {
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    homeGoals,
    awayGoals
  };
}
