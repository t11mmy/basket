import { soundEngine } from '../audio/soundEngine';
import {
  BallEntity,
  GameMode,
  HoopEntity,
  PlayerEntity,
  PlayerSkin,
  ROUND_MODIFIERS,
  RoundModifier,
  RoundModifierId,
  WorldState,
} from './types';

export const VIRTUAL_WIDTH = 1280;
export const VIRTUAL_HEIGHT = 720;
export const GROUND_Y = 548;

const BASE_GRAVITY = 1320;
const PLAYER_GRAVITY = 1380;
const BASE_BALL_RADIUS = 22;

const SKINS: [PlayerSkin, PlayerSkin, PlayerSkin, PlayerSkin] = [
  // Team 1 Guard (Left-most Yellow player from screenshot)
  {
    skinColor: '#C98A5B',
    skinShadow: '#A66C43',
    hairColor: '#181818',
    hairStyle: 'SHORT_DARK',
    jerseyColor: '#F7B519',
    jerseyTrim: '#7B3FE4',
    shortsColor: '#F7B519',
  },
  // Team 1 Forward (Inner Yellow player from screenshot)
  {
    skinColor: '#F2B88B',
    skinShadow: '#D6996C',
    hairColor: '#69361A',
    hairStyle: 'SPIKY_BROWN',
    jerseyColor: '#F7B519',
    jerseyTrim: '#7B3FE4',
    shortsColor: '#F7B519',
  },
  // Team 2 Forward (Inner Blue player from screenshot - bald)
  {
    skinColor: '#F5C49E',
    skinShadow: '#D8A27A',
    hairColor: '#F5C49E',
    hairStyle: 'BALD',
    jerseyColor: '#0080FF',
    jerseyTrim: '#F4F6F8',
    shortsColor: '#0068D6',
  },
  // Team 2 Guard (Right-most Blue player from screenshot)
  {
    skinColor: '#C68659',
    skinShadow: '#A36A42',
    hairColor: '#1E1E1E',
    hairStyle: 'TIED_DARK',
    jerseyColor: '#0080FF',
    jerseyTrim: '#F4F6F8',
    shortsColor: '#0068D6',
  },
];

const MODIFIER_POOL: RoundModifierId[] = [
  'CLASSIC',
  'GIANT_HOOPS',
  'LONG_ARMS',
  'HEAVY_BALL',
  'LIGHT_BALL',
  'ICY_COURT',
  'MOON_GRAVITY',
  'SMALL_HOOPS',
];

export function createHoops(modifier: RoundModifier): [HoopEntity, HoopEntity] {
  const rimWidth = Math.round(82 * modifier.hoopScale);
  const rimY = 252;
  const backboardTopY = 112;
  const backboardBottomY = 278;

  const leftBackboardX = 244;
  const rightBackboardX = VIRTUAL_WIDTH - 244;

  return [
    {
      teamOwner: 1,
      poleX: 162,
      groundY: GROUND_Y,
      rimY,
      rimBackX: leftBackboardX + 8,
      rimFrontX: leftBackboardX + 8 + rimWidth,
      backboardX: leftBackboardX,
      backboardTopY,
      backboardBottomY,
      netSway: 0,
      netStretch: 0,
      netVel: 0,
    },
    {
      teamOwner: 2,
      poleX: VIRTUAL_WIDTH - 162,
      groundY: GROUND_Y,
      rimY,
      rimBackX: rightBackboardX - 8,
      rimFrontX: rightBackboardX - 8 - rimWidth,
      backboardX: rightBackboardX,
      backboardTopY,
      backboardBottomY,
      netSway: 0,
      netStretch: 0,
      netVel: 0,
    },
  ];
}

export function createPlayers(): PlayerEntity[] {
  return [
    {
      id: 0,
      team: 1,
      role: 'GUARD',
      x: 370,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      angle: 0.18,
      angularVel: 0,
      wobblePhase: 0.1,
      wobbleSpeed: 4.6,
      wobbleAmplitude: 0.56,
      armAngle: 0,
      armAngularVel: 0,
      onGround: true,
      jumpSquash: 0,
      skin: SKINS[0],
      facing: 1,
    },
    {
      id: 1,
      team: 1,
      role: 'FORWARD',
      x: 548,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      angle: -0.22,
      angularVel: 0,
      wobblePhase: 1.35,
      wobbleSpeed: 4.95,
      wobbleAmplitude: 0.6,
      armAngle: 0,
      armAngularVel: 0,
      onGround: true,
      jumpSquash: 0,
      skin: SKINS[1],
      facing: 1,
    },
    {
      id: 2,
      team: 2,
      role: 'FORWARD',
      x: VIRTUAL_WIDTH - 548,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      angle: 0.22,
      angularVel: 0,
      wobblePhase: 0.85,
      wobbleSpeed: 4.85,
      wobbleAmplitude: 0.6,
      armAngle: 0,
      armAngularVel: 0,
      onGround: true,
      jumpSquash: 0,
      skin: SKINS[2],
      facing: -1,
    },
    {
      id: 3,
      team: 2,
      role: 'GUARD',
      x: VIRTUAL_WIDTH - 370,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      angle: -0.18,
      angularVel: 0,
      wobblePhase: 2.15,
      wobbleSpeed: 4.55,
      wobbleAmplitude: 0.56,
      armAngle: 0,
      armAngularVel: 0,
      onGround: true,
      jumpSquash: 0,
      skin: SKINS[3],
      facing: -1,
    },
  ];
}

export function createBall(modifier: RoundModifier): BallEntity {
  return {
    x: VIRTUAL_WIDTH * 0.5,
    y: 380,
    vx: (Math.random() - 0.5) * 45,
    vy: -180,
    radius: Math.round(BASE_BALL_RADIUS * modifier.ballRadiusScale),
    rotation: 0,
    spin: 0,
    holderId: null,
    lastTouchTeam: null,
    lastShooterId: null,
    shotStartX: null,
    pickupCooldown: 0.18,
    stealCooldown: 0,
    trail: [],
    predictedArc: [],
  };
}

export function createInitialWorld(enableRandomModifiers: boolean = true): WorldState {
  const modifier = ROUND_MODIFIERS.CLASSIC;
  return {
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    groundY: GROUND_Y,
    players: createPlayers(),
    ball: createBall(modifier),
    hoops: createHoops(modifier),
    particles: [],
    popups: [],
    team1Hold: false,
    team2Hold: false,
    score1: 0,
    score2: 0,
    winningScore: 5,
    roundNumber: 1,
    modifier,
    enableRandomModifiers,
    roundBannerTimer: 2.0,
    goalCelebrationTimer: 0,
    lastScorerTeam: null,
    screenShake: 0,
    hitstopTimer: 0,
    stats: {
      shotsTeam1: 0,
      shotsTeam2: 0,
      stealsTeam1: 0,
      stealsTeam2: 0,
      blocksTeam1: 0,
      blocksTeam2: 0,
      dunksOrCloseTeam1: 0,
      dunksOrCloseTeam2: 0,
    },
  };
}

export function getPlayerJoints(player: PlayerEntity, modifier: RoundModifier) {
  const sinA = Math.sin(player.angle);
  const cosA = Math.cos(player.angle);

  // Taller, cleaner proportions (~162px total height)
  const hipDist = 66;
  const shoulderDist = 122;
  const headDist = 148;
  const armLength = 64 * modifier.armScale;

  const hipX = player.x + sinA * hipDist;
  const hipY = player.y - cosA * hipDist;

  const shoulderX = player.x + sinA * shoulderDist;
  const shoulderY = player.y - cosA * shoulderDist;

  const headX = player.x + sinA * headDist;
  const headY = player.y - cosA * shoulderDist - 26 * cosA;

  // When armAngle === 0, arm hangs down along the torso toward the hip.
  // When armAngle increases (up to ~0.92 * PI), arm swings forward and high overhead!
  const worldArmAngle = player.angle + Math.PI - player.facing * player.armAngle;
  const handX = shoulderX + Math.sin(worldArmAngle) * armLength;
  const handY = shoulderY - Math.cos(worldArmAngle) * armLength;

  const elbowX = (shoulderX + handX) * 0.5;
  const elbowY = (shoulderY + handY) * 0.5;

  return {
    footX: player.x,
    footY: player.y,
    hipX,
    hipY,
    shoulderX,
    shoulderY,
    headX,
    headY,
    elbowX,
    elbowY,
    handX,
    handY,
    worldArmAngle,
  };
}

export function spawnParticles(
  world: WorldState,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number = 220
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const mag = (0.3 + Math.random() * 0.7) * speed;
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * mag,
      vy: Math.sin(angle) * mag - 60,
      size: 4 + Math.floor(Math.random() * 5),
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.32 + Math.random() * 0.4,
    });
  }
}

export function setupNextRound(world: WorldState) {
  world.roundNumber += 1;
  if (world.enableRandomModifiers) {
    const candidates = MODIFIER_POOL.filter((id) => id !== world.modifier.id);
    const chosenId = candidates[Math.floor(Math.random() * candidates.length)] || 'CLASSIC';
    world.modifier = ROUND_MODIFIERS[chosenId];
  } else {
    world.modifier = ROUND_MODIFIERS.CLASSIC;
  }

  world.players = createPlayers();
  world.hoops = createHoops(world.modifier);
  world.ball = createBall(world.modifier);
  world.roundBannerTimer = 2.0;
  world.goalCelebrationTimer = 0;
  soundEngine.playWhistle();
}

export function triggerTeamPress(world: WorldState, team: 1 | 2) {
  if (team === 1) {
    world.team1Hold = true;
  } else {
    world.team2Hold = true;
  }

  let anyJumped = false;
  for (const p of world.players) {
    if (p.team !== team) continue;
    if (p.onGround) {
      p.onGround = false;
      const jumpPower = 735 * world.modifier.jumpForceScale;

      // Symmetrical jump vector along the character's current wobble lean angle!
      // Leaning left jumps left, leaning right jumps right — giving high mobility & preventing center pileups.
      const effectiveAngle = Math.max(-0.78, Math.min(0.78, p.angle));
      p.vx = p.vx * 0.25 + Math.sin(effectiveAngle) * jumpPower * 0.96;
      p.vy = -Math.cos(effectiveAngle * 0.52) * jumpPower;

      // Expressive mid-air tilt momentum so characters land at interesting angles
      p.angularVel = effectiveAngle * 3.1 + (Math.random() - 0.5) * 1.3;
      p.jumpSquash = 0.26;
      anyJumped = true;
      spawnParticles(world, p.x, GROUND_Y, '#D4D4D8', 5, 120);
    }
  }

  if (anyJumped) {
    soundEngine.playJump(team);
  }
}

export function triggerTeamRelease(world: WorldState, team: 1 | 2) {
  if (team === 1) {
    world.team1Hold = false;
  } else {
    world.team2Hold = false;
  }

  // Check if a player on this team is holding the ball; if so, throw it toward opponent hoop!
  const ball = world.ball;
  if (ball.holderId !== null) {
    const holder = world.players.find((p) => p.id === ball.holderId);
    if (holder && holder.team === team) {
      releaseShot(world, holder);
    }
  }
}

function computeShotVelocity(world: WorldState, shooter: PlayerEntity) {
  const targetHoop = shooter.team === 1 ? world.hoops[1] : world.hoops[0];
  const targetX = (targetHoop.rimFrontX + targetHoop.rimBackX) * 0.5;
  const targetY = targetHoop.rimY - 12;

  const joints = getPlayerJoints(shooter, world.modifier);
  const startX = joints.handX + shooter.facing * 10;
  const startY = joints.handY - 10;

  const dx = targetX - startX;
  const dy = targetY - startY;
  const dist = Math.abs(dx);

  const g = BASE_GRAVITY * world.modifier.ballGravityScale;

  // High, clean basketball arc scaled by distance to hoop
  const flightTime = Math.max(0.54, Math.min(1.04, 0.44 + dist / 1180));

  // Subtle influence from shooter's lean angle & vertical momentum
  const leanOffset = shooter.angle * 95;

  let vx = dx / flightTime + leanOffset + shooter.vx * 0.14;
  let vy = (dy - 0.5 * g * flightTime * flightTime) / flightTime + shooter.vy * 0.1;

  const maxVx = 1020;
  vx = Math.max(-maxVx, Math.min(maxVx, vx));
  vy = Math.max(-1120, Math.min(-300, vy));

  return { startX, startY, vx, vy, g };
}

function releaseShot(world: WorldState, shooter: PlayerEntity) {
  const ball = world.ball;
  const { startX, startY, vx, vy, g } = computeShotVelocity(world, shooter);

  ball.holderId = null;
  ball.lastTouchTeam = shooter.team;
  ball.lastShooterId = shooter.id;
  ball.shotStartX = startX;
  ball.x = startX;
  ball.y = startY;
  ball.vx = vx;
  ball.vy = vy;
  ball.spin = -shooter.facing * 12.5;
  ball.pickupCooldown = 0.32;

  if (shooter.team === 1) {
    world.stats.shotsTeam1 += 1;
  } else {
    world.stats.shotsTeam2 += 1;
  }

  ball.predictedArc = [];
  for (let i = 1; i <= 12; i++) {
    const t = i * 0.055;
    ball.predictedArc.push({
      x: startX + vx * t,
      y: startY + vy * t + 0.5 * g * t * t,
    });
  }

  soundEngine.playThrow();
}

export function updateAIController(world: WorldState, dt: number) {
  const ball = world.ball;
  const team2Players = world.players.filter((p) => p.team === 2);
  const holder = ball.holderId !== null ? world.players.find((p) => p.id === ball.holderId) : null;

  if (holder && holder.team === 2) {
    // AI holds the ball: wait until leaning slightly toward left hoop or jump and release near apex
    if (!world.team2Hold && holder.onGround && holder.angle < 0.15) {
      triggerTeamPress(world, 2);
    } else if (world.team2Hold) {
      if ((!holder.onGround && holder.vy > -180) || holder.armAngle > 2.2) {
        triggerTeamRelease(world, 2);
      }
    }
    return;
  }

  let shouldHold = false;
  for (const p of team2Players) {
    const dx = ball.x - p.x;
    const dy = ball.y - (p.y - 110);
    const dist = Math.hypot(dx, dy);

    const leaningTowardBall = (dx < -20 && p.angle < -0.08) || (dx > 20 && p.angle > 0.08);
    if (dist < 280 && leaningTowardBall) {
      shouldHold = true;
    }
    if (ball.holderId === null && ball.vx > 200 && ball.x > 640 && p.angle < 0.2) {
      shouldHold = true;
    }
  }

  if (shouldHold && !world.team2Hold && Math.random() < dt * 7.5) {
    triggerTeamPress(world, 2);
  } else if (!shouldHold && world.team2Hold && Math.random() < dt * 6.5) {
    triggerTeamRelease(world, 2);
  }
}

export function stepWorld(world: WorldState, rawDt: number, mode: GameMode): { matchEnded: boolean } {
  const dt = Math.min(rawDt, 0.05);

  if (world.screenShake > 0) {
    world.screenShake = Math.max(0, world.screenShake - dt * 28);
  }

  if (world.roundBannerTimer > 0) {
    world.roundBannerTimer = Math.max(0, world.roundBannerTimer - dt);
  }

  if (world.hitstopTimer > 0) {
    world.hitstopTimer = Math.max(0, world.hitstopTimer - dt);
    return { matchEnded: false };
  }

  if (mode === '1P_AI' && world.goalCelebrationTimer <= 0) {
    updateAIController(world, dt);
  }

  if (world.goalCelebrationTimer > 0) {
    world.goalCelebrationTimer -= dt;
    if (world.goalCelebrationTimer <= 0) {
      if (world.score1 >= world.winningScore || world.score2 >= world.winningScore) {
        soundEngine.playVictory();
        return { matchEnded: true };
      }
      setupNextRound(world);
      return { matchEnded: false };
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const pt = world.particles[i];
    pt.life += dt;
    if (pt.life >= pt.maxLife) {
      world.particles.splice(i, 1);
      continue;
    }
    pt.vy += 520 * dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.alpha = 1 - pt.life / pt.maxLife;
  }

  for (let i = world.popups.length - 1; i >= 0; i--) {
    const pop = world.popups[i];
    pop.timer -= dt;
    pop.y -= 34 * dt;
    if (pop.timer <= 0) {
      world.popups.splice(i, 1);
    }
  }

  for (const hoop of world.hoops) {
    const springK = 140;
    const damping = 9.5;
    const accel = -springK * hoop.netStretch - damping * hoop.netVel;
    hoop.netVel += accel * dt;
    hoop.netStretch += hoop.netVel * dt;
    hoop.netSway *= Math.pow(0.08, dt);
  }

  updatePlayers(world, dt);

  const subSteps = 6;
  const subDt = dt / subSteps;
  for (let s = 0; s < subSteps; s++) {
    stepBallPhysics(world, subDt);
  }

  const ball = world.ball;
  if (ball.holderId === null && Math.hypot(ball.vx, ball.vy) > 240) {
    ball.trail.unshift({
      x: ball.x,
      y: ball.y,
      alpha: 0.5,
      rotation: ball.rotation,
    });
    if (ball.trail.length > 8) {
      ball.trail.pop();
    }
  } else if (ball.trail.length > 0) {
    ball.trail.pop();
  }

  for (let i = 0; i < ball.trail.length; i++) {
    ball.trail[i].alpha *= 0.86;
  }

  return { matchEnded: false };
}

function updatePlayers(world: WorldState, dt: number) {
  const minX = 258;
  const maxX = VIRTUAL_WIDTH - 258;

  for (const p of world.players) {
    const isHoldingKey = p.team === 1 ? world.team1Hold : world.team2Hold;

    // Responsive arm raising / lowering
    const targetArm = isHoldingKey ? Math.PI * 0.88 : 0.03;
    const armDiff = targetArm - p.armAngle;
    p.armAngularVel = armDiff * 20;
    p.armAngle += p.armAngularVel * dt;
    p.armAngle = Math.max(0, Math.min(Math.PI * 0.94, p.armAngle));

    p.jumpSquash *= Math.pow(0.01, dt);

    if (p.onGround) {
      // Wide, lively inverted-pendulum wobble on ground!
      // Characters swing both left and right across a generous ±35° arc, so timing your jump
      // lets you leap purposefully forward OR backward across the court.
      p.wobblePhase += p.wobbleSpeed * dt;

      // Subtle tactical zone bias only if a player gets pinned too close to a hoop
      let zoneBias = 0;
      if (p.x < 310) zoneBias = 0.14;
      else if (p.x > VIRTUAL_WIDTH - 310) zoneBias = -0.14;

      const targetAngle =
        zoneBias +
        Math.sin(p.wobblePhase) * p.wobbleAmplitude +
        Math.sin(p.wobblePhase * 0.47 + p.id) * 0.14;

      const springTorque = (targetAngle - p.angle) * 48;
      p.angularVel += springTorque * dt;
      p.angularVel *= Math.pow(0.05, dt);
      p.angle += p.angularVel * dt;

      // Ground horizontal sliding friction + lively foot pivot shuffle
      const frictionFactor = world.modifier.id === 'ICY_COURT' ? 0.985 : 0.88;
      p.vx *= Math.pow(frictionFactor, dt * 10);
      p.x += (p.vx + Math.sin(p.angle) * 28) * dt;

      if (isHoldingKey) {
        triggerTeamPress(world, p.team);
      }
    } else {
      // Mid-air flight physics
      p.vy += PLAYER_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Expressive mid-air wobble & rotation so landing posture is always fresh and dynamic
      p.wobblePhase += p.wobbleSpeed * 0.75 * dt;
      const airWobbleTarget = Math.sin(p.wobblePhase) * 0.38;
      const airRestoring = (airWobbleTarget - p.angle) * 8.5;
      p.angularVel += airRestoring * dt;
      p.angularVel *= Math.pow(0.55, dt);
      p.angle += p.angularVel * dt;
      p.angle = Math.max(-1.05, Math.min(1.05, p.angle));

      if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        p.onGround = true;
        // Landing glide proportional to tilt angle gives smooth horizontal mobility
        p.vx = p.vx * 0.58 + Math.sin(p.angle) * 195;
        p.vy = 0;
        p.jumpSquash = -0.22;
        soundEngine.playBounce(0.32);
      }
    }

    if (p.x < minX) {
      p.x = minX;
      p.vx = Math.abs(p.vx) * 0.6;
    } else if (p.x > maxX) {
      p.x = maxX;
      p.vx = -Math.abs(p.vx) * 0.6;
    }
  }

  // Anti-moshpit spacing:
  // 1. Teammates maintain comfortable tactical spacing (Guard vs Forward) so they don't stack on top of each other.
  // 2. Opponents have clean elastic separation so players don't get tangled in a 4-person pileup.
  for (let i = 0; i < world.players.length; i++) {
    for (let j = i + 1; j < world.players.length; j++) {
      const a = world.players[i];
      const b = world.players[j];
      const sameTeam = a.team === b.team;
      const minDist = sameTeam ? 105 : 68;
      const dx = b.x - a.x;
      const dy = b.y - a.y;

      if (Math.abs(dx) < minDist && Math.abs(dy) < 130) {
        const overlap = minDist - Math.abs(dx);
        // Preserve natural left-to-right ordering for teammates, or push apart based on relative position
        let dir = dx >= 0 ? 1 : -1;
        if (sameTeam) {
          dir = a.role === 'GUARD' && a.team === 1 ? 1 : a.role === 'FORWARD' && a.team === 2 ? 1 : -1;
        }
        const pushStrength = sameTeam ? 0.35 : 0.65;
        a.x -= dir * overlap * pushStrength * 0.5;
        b.x += dir * overlap * pushStrength * 0.5;
        a.vx -= dir * 95 * dt;
        b.vx += dir * 95 * dt;
      }
    }
  }
}

function stepBallPhysics(world: WorldState, dt: number) {
  const ball = world.ball;
  ball.radius = Math.round(BASE_BALL_RADIUS * world.modifier.ballRadiusScale);

  if (ball.pickupCooldown > 0) {
    ball.pickupCooldown = Math.max(0, ball.pickupCooldown - dt);
  }
  if (ball.stealCooldown > 0) {
    ball.stealCooldown = Math.max(0, ball.stealCooldown - dt);
  }

  if (ball.holderId !== null) {
    const holder = world.players.find((p) => p.id === ball.holderId);
    if (holder) {
      const joints = getPlayerJoints(holder, world.modifier);
      const holdOffsetAngle = joints.worldArmAngle;
      ball.x = joints.handX + Math.sin(holdOffsetAngle) * 12 + holder.facing * 10;
      ball.y = joints.handY - Math.cos(holdOffsetAngle) * 12;
      ball.vx = holder.vx;
      ball.vy = holder.vy;
      ball.rotation += holder.vx * 0.015 * dt;
      ball.predictedArc = [];

      // Clean, fair steal logic: requires opponent to jump or actively reach with raised arm,
      // and has a longer cooldown so it never turns into a chaotic tug-of-war moshpit.
      if (ball.stealCooldown <= 0) {
        for (const other of world.players) {
          if (other.team === holder.team) continue;
          const otherJoints = getPlayerJoints(other, world.modifier);
          const handDist = Math.hypot(ball.x - otherJoints.handX, ball.y - otherJoints.handY);
          const isContesting = !other.onGround || other.armAngle > 0.7;

          if (isContesting && handDist < ball.radius + 20) {
            ball.holderId = other.id;
            ball.lastTouchTeam = other.team;
            ball.stealCooldown = 0.72;
            ball.pickupCooldown = 0.3;

            // Give both players a crisp separation impulse on steal so play opens up immediately!
            holder.vx -= other.facing * 140;
            other.vx += other.facing * 90;

            if (other.team === 1) {
              world.stats.stealsTeam1 += 1;
            } else {
              world.stats.stealsTeam2 += 1;
            }
            spawnParticles(world, ball.x, ball.y, '#FFFFFF', 7, 180);
            soundEngine.playBounce(0.85);
            break;
          }
        }
      }
      return;
    } else {
      ball.holderId = null;
    }
  }

  const prevX = ball.x;
  const prevY = ball.y;

  const gravity = BASE_GRAVITY * world.modifier.ballGravityScale;
  ball.vy += gravity * dt;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.rotation += ball.spin * dt;

  if (ball.predictedArc.length > 0 && ball.vy > 140) {
    ball.predictedArc.shift();
  }

  if (ball.y + ball.radius >= GROUND_Y) {
    ball.y = GROUND_Y - ball.radius;
    if (ball.vy > 0) {
      const impact = Math.abs(ball.vy) / 550;
      ball.vy = -ball.vy * world.modifier.ballBounce;
      ball.vx *= 0.93;
      ball.spin = ball.vx * 0.035;
      ball.predictedArc = [];
      if (impact > 0.12) {
        soundEngine.playBounce(impact);
        spawnParticles(world, ball.x, GROUND_Y, '#9E9E9E', 4, 90);
      }
      if (Math.abs(ball.vy) < 65) {
        ball.vy = 0;
      }
    }
  }

  if (ball.x - ball.radius < 40) {
    ball.x = 40 + ball.radius;
    ball.vx = Math.abs(ball.vx) * 0.78;
    soundEngine.playBounce(0.5);
  } else if (ball.x + ball.radius > VIRTUAL_WIDTH - 40) {
    ball.x = VIRTUAL_WIDTH - 40 - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 0.78;
    soundEngine.playBounce(0.5);
  }

  if (ball.y - ball.radius < 20) {
    ball.y = 20 + ball.radius;
    ball.vy = Math.abs(ball.vy) * 0.7;
  }

  for (const hoop of world.hoops) {
    collideBallWithHoop(world, hoop, prevX, prevY);
  }

  for (const player of world.players) {
    collideBallWithPlayer(world, player);
  }
}

function collideBallWithCircle(
  ball: BallEntity,
  cx: number,
  cy: number,
  cr: number,
  restitution: number,
  isRim: boolean = false
): boolean {
  const dx = ball.x - cx;
  const dy = ball.y - cy;
  const dist = Math.hypot(dx, dy);
  const minDist = ball.radius + cr;

  if (dist < minDist && dist > 0.0001) {
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const relVel = ball.vx * nx + ball.vy * ny;
    if (relVel < 0) {
      const impulse = -(1 + restitution) * relVel;
      ball.vx += nx * impulse;
      ball.vy += ny * impulse;
      ball.spin += (nx * ball.vy - ny * ball.vx) * 0.012;
      ball.predictedArc = [];

      const intensity = Math.min(1.2, Math.abs(relVel) / 450);
      if (intensity > 0.14) {
        if (isRim) {
          soundEngine.playRimHit(intensity);
        } else {
          soundEngine.playBounce(intensity * 0.8);
        }
      }
      return true;
    }
  }
  return false;
}

function collideBallWithHoop(world: WorldState, hoop: HoopEntity, _prevX: number, prevY: number) {
  const ball = world.ball;
  const bounce = world.modifier.ballBounce;

  const boardHalfThick = 7;
  if (
    ball.y + ball.radius > hoop.backboardTopY &&
    ball.y - ball.radius < hoop.backboardBottomY
  ) {
    const dx = ball.x - hoop.backboardX;
    const minDist = ball.radius + boardHalfThick;
    if (Math.abs(dx) < minDist) {
      const sign = dx >= 0 ? 1 : -1;
      ball.x = hoop.backboardX + sign * minDist;
      if (ball.vx * sign < 0) {
        const impact = Math.abs(ball.vx) / 480;
        ball.vx = -ball.vx * bounce * 0.82;
        ball.predictedArc = [];
        if (impact > 0.12) {
          soundEngine.playRimHit(impact * 0.75);
          spawnParticles(world, hoop.backboardX, ball.y, '#FFFFFF', 4, 110);
        }
      }
    }
  }

  collideBallWithCircle(ball, hoop.backboardX, hoop.backboardTopY, boardHalfThick, bounce, true);
  collideBallWithCircle(ball, hoop.backboardX, hoop.backboardBottomY, boardHalfThick, bounce, true);

  const rimRadius = 5;
  const hitBack = collideBallWithCircle(ball, hoop.rimBackX, hoop.rimY, rimRadius, bounce * 0.88, true);
  const hitFront = collideBallWithCircle(ball, hoop.rimFrontX, hoop.rimY, rimRadius, bounce * 0.88, true);
  if (hitBack || hitFront) {
    hoop.netVel += 120;
    hoop.netSway += (ball.vx > 0 ? 1 : -1) * 6;
  }

  if (world.goalCelebrationTimer <= 0 && prevY <= hoop.rimY && ball.y > hoop.rimY && ball.vy > 0) {
    const minRimX = Math.min(hoop.rimBackX, hoop.rimFrontX) + 5;
    const maxRimX = Math.max(hoop.rimBackX, hoop.rimFrontX) - 5;

    if (ball.x >= minRimX && ball.x <= maxRimX) {
      const scoringTeam: 1 | 2 = hoop.teamOwner === 1 ? 2 : 1;

      if (scoringTeam === 1) {
        world.score1 += 1;
      } else {
        world.score2 += 1;
      }

      if (ball.shotStartX !== null && Math.abs(ball.shotStartX - ball.x) < 230) {
        if (scoringTeam === 1) world.stats.dunksOrCloseTeam1 += 1;
        else world.stats.dunksOrCloseTeam2 += 1;
      }

      world.lastScorerTeam = scoringTeam;
      world.goalCelebrationTimer = 1.75;
      world.screenShake = 10;

      hoop.netStretch = 24;
      hoop.netVel = 190;
      hoop.netSway = ball.vx * 0.04;

      ball.vx *= 0.35;
      ball.vy *= 0.55;
      ball.pickupCooldown = 2.0;

      const teamColor = scoringTeam === 1 ? '#F7B519' : '#0080FF';
      spawnParticles(world, ball.x, hoop.rimY + 18, teamColor, 26, 340);
      spawnParticles(world, ball.x, hoop.rimY + 18, '#FFFFFF', 14, 250);

      world.popups.push({
        x: (hoop.rimFrontX + hoop.rimBackX) * 0.5,
        y: hoop.rimY - 36,
        text: '+1 ОЧКО!',
        subtext: scoringTeam === 1 ? 'ЖЕЛТЫЕ ЗАБИВАЮТ!' : 'СИНИЕ ЗАБИВАЮТ!',
        color: teamColor,
        timer: 1.5,
      });

      soundEngine.playGoal();
    }
  }
}

function collideBallWithPlayer(world: WorldState, player: PlayerEntity) {
  const ball = world.ball;
  if (ball.holderId !== null) return;

  const joints = getPlayerJoints(player, world.modifier);
  const isHoldingKey = player.team === 1 ? world.team1Hold : world.team2Hold;

  const canPickup =
    ball.pickupCooldown <= 0 ||
    (ball.lastShooterId !== null && ball.lastShooterId !== player.id);

  const handDist = Math.hypot(ball.x - joints.handX, ball.y - joints.handY);
  const chestDist = Math.hypot(ball.x - joints.shoulderX, ball.y - joints.shoulderY);
  const headDist = Math.hypot(ball.x - joints.headX, ball.y - joints.headY);

  const ballSpeed = Math.hypot(ball.vx, ball.vy);
  if (
    canPickup &&
    ball.lastTouchTeam !== null &&
    ball.lastTouchTeam !== player.team &&
    isHoldingKey &&
    player.armAngle > 1.15 &&
    handDist < ball.radius + 24 &&
    ball.y < GROUND_Y - 140 &&
    ballSpeed > 400
  ) {
    ball.vx = player.facing * Math.max(380, Math.abs(ball.vx) * 0.85);
    ball.vy = -260;
    ball.lastTouchTeam = player.team;
    ball.lastShooterId = player.id;
    ball.pickupCooldown = 0.25;
    ball.predictedArc = [];

    if (player.team === 1) world.stats.blocksTeam1 += 1;
    else world.stats.blocksTeam2 += 1;

    world.screenShake = 7;
    world.hitstopTimer = 0.04;
    spawnParticles(world, joints.handX, joints.handY, '#FFD700', 14, 260);
    world.popups.push({
      x: joints.handX,
      y: joints.handY - 24,
      text: 'БЛОК-ШОТ!',
      subtext: '',
      color: '#FFD700',
      timer: 1.0,
    });
    soundEngine.playRimHit(1.0);
    return;
  }

  if (canPickup && (handDist < ball.radius + 24 || chestDist < ball.radius + 26)) {
    ball.holderId = player.id;
    ball.lastTouchTeam = player.team;
    ball.stealCooldown = 0.65;
    ball.predictedArc = [];
    soundEngine.playBounce(0.5);
    return;
  }

  if (headDist < ball.radius + 18) {
    collideBallWithCircle(ball, joints.headX, joints.headY, 18, 0.74, false);
    ball.vx += player.vx * 0.35;
    ball.vy += player.vy * 0.35;
  } else {
    const hipDist = Math.hypot(ball.x - joints.hipX, ball.y - joints.hipY);
    if (hipDist < ball.radius + 20) {
      collideBallWithCircle(ball, joints.hipX, joints.hipY, 20, 0.68, false);
    }
  }
}
