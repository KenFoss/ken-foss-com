import type { PlanetSpec, StationSpec } from '../pixel/pixelArt';

export type SiteMode = 'profile' | 'publications';

/** A social link rendered as a pixel planet orbiting the home world. */
export interface OrbitBody {
  id: string;
  label: string;
  url: string;
  /** Short readout shown when the body is selected. */
  classification: string;
  /** Orbit slot, 0 = innermost. */
  orbit: number;
  /** Starting position on the orbit, in turns. */
  phase: number;
  /** Seconds per revolution at 1x time. */
  period: number;
  sprite: PlanetSpec;
}

/** A publication rendered as a station in low orbit over the home world. */
export interface Publication {
  id: string;
  /** Short station designation shown under the sprite. */
  code: string;
  title: string;
  url: string;
  /** Station ring, 0 = closer to the planet. */
  ring: number;
  phase: number;
  period: number;
  sprite: StationSpec;
}

export const OWNER_NAME = 'Ken Foss';
export const OWNER_TITLE = 'FULL-STACK WEB ENGINEER';
export const MEDIUM_PROFILE_URL = 'https://medium.com/@kenfoss0715';

const EM_DASH = '\u2014';
const DOT = '\u00B7';

export const BIO_SHORT =
  'Full-stack web engineer building subscription and content platforms with React/TypeScript ' +
  'front ends and Go and Java services. Works hands-on across the AWS infrastructure those ' +
  `systems run on ${EM_DASH} auditing, optimizing, and right-sizing for reliability and cost ` +
  `${EM_DASH} while leading cross-org launches and mentoring junior engineers.`;

export const BIO_EXPANDED =
  'Previously built experience in embedded systems, Linux, Python, Git, and DevOps at General ' +
  'Dynamics Electric Boat. Today the focus is web platforms at scale: React/TypeScript UIs, Go ' +
  `and Java services, and the AWS footprint underneath ${EM_DASH} with a side habit of writing ` +
  'for late-beginner to intermediate engineers on Medium.';

/** The central world that carries the bio. */
export const HOME_SPRITE: PlanetSpec = {
  size: 46,
  kind: 'terran',
  seed: 1841,
  seaLevel: 0.47,
  caps: true,
  atmosphere: '#5d8478',
  palette: ['#0b1410', '#1d3524', '#2c4f2e', '#3f6b39', '#6d8a4a', '#9aa96b'],
  sea: ['#0a1218', '#102634', '#173d52', '#215a72', '#3b8093'],
};

export const orbitBodies: OrbitBody[] = [
  {
    id: 'github',
    label: 'GITHUB',
    url: 'https://github.com/KenFoss',
    classification: `IRON MOONLET ${DOT} SOURCE VAULTS`,
    orbit: 0,
    phase: 0.12,
    period: 30,
    sprite: {
      size: 15,
      kind: 'rock',
      seed: 91,
      palette: ['#15181c', '#2c343b', '#4a565f', '#6e7d86', '#98a6ad'],
    },
  },
  {
    id: 'gitlab',
    label: 'GITLAB',
    url: 'https://gitlab.com/KenFoss',
    classification: `ARID WORLD ${DOT} PIPELINE FOUNDRIES`,
    orbit: 1,
    phase: 0.64,
    period: 44,
    sprite: {
      size: 18,
      kind: 'volcanic',
      seed: 307,
      accent: '#d98b3c',
      palette: ['#1a100a', '#3b2214', '#5e3620', '#82502c', '#a8703f'],
    },
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    url: 'https://www.linkedin.com/in/kenneth-foss-933048200/',
    classification: `OCEANIC WORLD ${DOT} TRADE NETWORK`,
    orbit: 2,
    phase: 0.3,
    period: 58,
    sprite: {
      size: 17,
      kind: 'terran',
      seed: 523,
      seaLevel: 0.68,
      caps: true,
      palette: ['#0d1418', '#24382f', '#37543c', '#4d6f4a', '#78905a'],
      sea: ['#091319', '#12303f', '#1b4a60', '#276b83', '#4a91a4'],
    },
  },
  {
    id: 'medium',
    label: 'MEDIUM',
    url: 'https://medium.com/@kenfoss0715',
    classification: `GAS GIANT ${DOT} ARCHIVE STACKS`,
    orbit: 3,
    phase: 0.86,
    period: 74,
    sprite: {
      size: 21,
      kind: 'gas',
      seed: 733,
      palette: ['#1c1913', '#3d3529', '#615540', '#8b7c5f', '#bdae8b'],
    },
  },
  {
    id: 'ieee',
    label: 'IEEE',
    url: 'https://ieeexplore.ieee.org/document/9744045',
    classification: `RINGED WORLD ${DOT} RESEARCH RELAY`,
    orbit: 4,
    phase: 0.46,
    period: 96,
    sprite: {
      size: 16,
      kind: 'ice',
      seed: 977,
      caps: true,
      palette: ['#141119', '#2b2436', '#453a52', '#63566f', '#8c7f96'],
      ring: {
        palette: ['#241f2b', '#3d3547', '#5b5068', '#847795'],
        inner: 1.35,
        outer: 2.05,
      },
    },
  },
];

/** Station ring radii as fractions of the outermost publication ring. */
export const STATION_RINGS = [0.78, 1];

const STEEL_STATION = {
  hull: ['#12151a', '#333b44', '#4f5a64', '#707d87', '#9aa6ae'],
  panel: ['#101821', '#1c3346', '#2b5570', '#4d829f'],
  beacon: '#e0b355',
  window: '#f0e0aa',
};

const RUST_STATION = {
  hull: ['#180f0a', '#3a2416', '#5c3a22', '#7f5533', '#a4784a'],
  panel: ['#141014', '#2c2438', '#463a58', '#6f5d88'],
  beacon: '#d9643c',
  window: '#f2ddaa',
};

const OLIVE_STATION = {
  hull: ['#101410', '#293220', '#414c33', '#5e6b46', '#84915d'],
  panel: ['#0f1a14', '#1c3a2a', '#2c5a40', '#4d8964'],
  beacon: '#8fd06a',
  window: '#e8f0b8',
};

export const publications: Publication[] = [
  {
    id: 'csrf',
    code: 'CSRF-01',
    title: 'CSRF Forgery Defense with Spring Security',
    url: 'https://medium.com/devops-dev/dive-into-csrf-defense-real-attack-demonstrations-safeguards-with-spring-security-69c22b25c322',
    ring: 0,
    phase: 0.08,
    period: 54,
    sprite: { seed: 12, ...STEEL_STATION },
  },
  {
    id: 'docker',
    code: 'DOCKER-02',
    title: 'Local Web Development Setup with Docker',
    url: 'https://medium.com/devops-dev/local-web-development-setup-with-docker-c666905223c3',
    ring: 0,
    phase: 0.42,
    period: 54,
    sprite: { seed: 77, ...OLIVE_STATION },
  },
  {
    id: 'oauth',
    code: 'OAUTH-03',
    title: "Let's Get Authenticated - Google Sign In",
    url: 'https://medium.com/javarevisited/lets-get-authenticated-google-sign-in-d4f4d7606ba3',
    ring: 0,
    phase: 0.75,
    period: 54,
    sprite: { seed: 143, ...RUST_STATION },
  },
  {
    id: 'git-assets',
    code: 'ASSETS-04',
    title: 'Stop Committing Your Images to Git!',
    url: 'https://medium.com/gitconnected/stop-committing-your-images-to-git-4f5148416c55',
    ring: 1,
    phase: 0.24,
    period: 78,
    sprite: { seed: 208, ...RUST_STATION },
  },
  {
    id: 'compose',
    code: 'COMPOSE-05',
    title: 'Docker Compose Setup for a MicroServices Architecture',
    url: 'https://medium.com/gitconnected/docker-compose-setup-for-a-microservices-architecture-f47902dadcae',
    ring: 1,
    phase: 0.58,
    period: 78,
    sprite: { seed: 291, ...STEEL_STATION },
  },
  {
    id: 'kafka',
    code: 'KAFKA-06',
    title: 'Keeping Your Microservices in Sync with Apache Kafka and Friends',
    url: 'https://medium.com/gitconnected/keeping-your-microservices-in-sync-with-apache-kafka-and-friends-82c502575828',
    ring: 1,
    phase: 0.91,
    period: 78,
    sprite: { seed: 356, ...OLIVE_STATION },
  },
];
