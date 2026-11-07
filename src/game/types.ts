export type GameScreenState = 'TITLE_SCREEN' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type GameMode = '2P' | '1P_AI';

export type RoundModifierId =
  | 'CLASSIC'
  | 'GIANT_HOOPS'
  | 'SMALL_HOOPS'
  | 'LONG_ARMS'
  | 'HEAVY_BALL'
  | 'LIGHT_BALL'
  | 'ICY_COURT'
  | 'MOON_GRAVITY';

export interface RoundModifier {
  id: RoundModifierId;
  nameRu: string;
  subtitleRu: string;
  hoopScale: number;
  armScale: number;
  ballGravityScale: number;
  ballBounce: number;
  ballRadiusScale: number;
  courtFriction: number;
  jumpForceScale: number;
  skyTheme: 'SUNSET' | 'DUSK' | 'WINTER' | 'GOLDEN';
  ballStyle: 'ORANGE' | 'IRON' | 'BEACH';
}

export const ROUND_MODIFIERS: Record<RoundModifierId, RoundModifier> = {
  CLASSIC: {
    id: 'CLASSIC',
    nameRu: 'КЛАССИЧЕСКАЯ ПЛОЩАДКА',
    subtitleRu: 'Стандартные правила уличного баскетбола',
    hoopScale: 1.0,
    armScale: 1.0,
    ballGravityScale: 1.0,
    ballBounce: 0.74,
    ballRadiusScale: 1.0,
    courtFriction: 0.88,
    jumpForceScale: 1.0,
    skyTheme: 'SUNSET',
    ballStyle: 'ORANGE',
  },
  GIANT_HOOPS: {
    id: 'GIANT_HOOPS',
    nameRu: 'ОГРОМНЫЕ КОЛЬЦА',
    subtitleRu: 'Кольца увеличены в полтора раза — бросай издалека!',
    hoopScale: 1.48,
    armScale: 1.0,
    ballGravityScale: 1.0,
    ballBounce: 0.75,
    ballRadiusScale: 1.0,
    courtFriction: 0.88,
    jumpForceScale: 1.05,
    skyTheme: 'GOLDEN',
    ballStyle: 'ORANGE',
  },
  LONG_ARMS: {
    id: 'LONG_ARMS',
    nameRu: 'ДЛИННЫЕ РУКИ',
    subtitleRu: 'Супер-блокшоты и перехваты под самым кольцом',
    hoopScale: 1.05,
    armScale: 1.65,
    ballGravityScale: 1.0,
    ballBounce: 0.74,
    ballRadiusScale: 1.0,
    courtFriction: 0.88,
    jumpForceScale: 1.0,
    skyTheme: 'SUNSET',
    ballStyle: 'ORANGE',
  },
  HEAVY_BALL: {
    id: 'HEAVY_BALL',
    nameRu: 'ТЯЖЕЛЫЙ ЖЕЛЕЗНЫЙ МЯЧ',
    subtitleRu: 'Низкий отскок и крутая траектория',
    hoopScale: 1.1,
    armScale: 1.0,
    ballGravityScale: 1.32,
    ballBounce: 0.52,
    ballRadiusScale: 1.06,
    courtFriction: 0.88,
    jumpForceScale: 1.06,
    skyTheme: 'DUSK',
    ballStyle: 'IRON',
  },
  LIGHT_BALL: {
    id: 'LIGHT_BALL',
    nameRu: 'ПЛЯЖНЫЙ ПРЫГУЧИЙ МЯЧ',
    subtitleRu: 'Высокий отскок и плавный полет',
    hoopScale: 1.1,
    armScale: 1.0,
    ballGravityScale: 0.76,
    ballBounce: 0.88,
    ballRadiusScale: 1.12,
    courtFriction: 0.88,
    jumpForceScale: 1.0,
    skyTheme: 'GOLDEN',
    ballStyle: 'BEACH',
  },
  ICY_COURT: {
    id: 'ICY_COURT',
    nameRu: 'СКОЛЬЗКИЙ ПАРКЕТ',
    subtitleRu: 'Игроки скользят после каждого приземления',
    hoopScale: 1.05,
    armScale: 1.05,
    ballGravityScale: 1.0,
    ballBounce: 0.78,
    ballRadiusScale: 1.0,
    courtFriction: 0.975,
    jumpForceScale: 1.05,
    skyTheme: 'WINTER',
    ballStyle: 'ORANGE',
  },
  MOON_GRAVITY: {
    id: 'MOON_GRAVITY',
    nameRu: 'ВЫСОКИЙ ПРЫЖОК',
    subtitleRu: 'Акробатические полеты над кольцом',
    hoopScale: 1.08,
    armScale: 1.1,
    ballGravityScale: 0.86,
    ballBounce: 0.78,
    ballRadiusScale: 1.0,
    courtFriction: 0.9,
    jumpForceScale: 1.24,
    skyTheme: 'DUSK',
    ballStyle: 'ORANGE',
  },
  SMALL_HOOPS: {
    id: 'SMALL_HOOPS',
    nameRu: 'СНАЙПЕРСКИЕ КОЛЬЦА',
    subtitleRu: 'Узкие кольца требуют идеальной дуги броска',
    hoopScale: 0.84,
    armScale: 1.0,
    ballGravityScale: 0.96,
    ballBounce: 0.74,
    ballRadiusScale: 0.92,
    courtFriction: 0.88,
    jumpForceScale: 1.05,
    skyTheme: 'SUNSET',
    ballStyle: 'ORANGE',
  },
};

export interface PlayerSkin {
  skinColor: string;
  skinShadow: string;
  hairColor: string;
  hairStyle: 'SHORT_DARK' | 'SPIKY_BROWN' | 'BALD' | 'TIED_DARK';
  jerseyColor: string;
  jerseyTrim: string;
  shortsColor: string;
}

export interface PlayerEntity {
  id: number;
  team: 1 | 2;
  role: 'GUARD' | 'FORWARD';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // Lean angle in radians (0 = upright, + = leaning right, - = leaning left)
  angularVel: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmplitude: number;
  armAngle: number; // 0 = arm down at side, Math.PI * 0.88 = raised high overhead
  armAngularVel: number;
  onGround: boolean;
  jumpSquash: number; // Visual squash & stretch factor
  skin: PlayerSkin;
  facing: 1 | -1; // 1 = facing right (Team 1), -1 = facing left (Team 2)
}

export interface BallTrailPoint {
  x: number;
  y: number;
  alpha: number;
  rotation: number;
}

export interface BallEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  spin: number;
  holderId: number | null;
  lastTouchTeam: 1 | 2 | null;
  lastShooterId: number | null;
  shotStartX: number | null;
  pickupCooldown: number;
  stealCooldown: number;
  trail: BallTrailPoint[];
  predictedArc: { x: number; y: number }[];
}

export interface HoopEntity {
  teamOwner: 1 | 2; // 1 = Left hoop (defended by Team 1, scored on by Team 2), 2 = Right hoop
  poleX: number;
  groundY: number;
  rimY: number;
  rimFrontX: number;
  rimBackX: number;
  backboardX: number;
  backboardTopY: number;
  backboardBottomY: number;
  netSway: number;
  netStretch: number;
  netVel: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  subtext: string;
  color: string;
  timer: number;
}

export interface MatchStats {
  shotsTeam1: number;
  shotsTeam2: number;
  stealsTeam1: number;
  stealsTeam2: number;
  blocksTeam1: number;
  blocksTeam2: number;
  dunksOrCloseTeam1: number;
  dunksOrCloseTeam2: number;
}

export interface WorldState {
  width: number;
  height: number;
  groundY: number;
  players: PlayerEntity[];
  ball: BallEntity;
  hoops: [HoopEntity, HoopEntity];
  particles: Particle[];
  popups: ScorePopup[];
  team1Hold: boolean;
  team2Hold: boolean;
  score1: number;
  score2: number;
  winningScore: number;
  roundNumber: number;
  modifier: RoundModifier;
  enableRandomModifiers: boolean;
  roundBannerTimer: number;
  goalCelebrationTimer: number;
  lastScorerTeam: 1 | 2 | null;
  screenShake: number;
  hitstopTimer: number;
  stats: MatchStats;
}
