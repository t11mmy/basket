import { getPlayerJoints, GROUND_Y, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from './physicsEngine';
import { BallEntity, HoopEntity, PlayerEntity, RoundModifier, WorldState } from './types';

const PIXEL = 4;

function snap(val: number): number {
  return Math.round(val / PIXEL) * PIXEL;
}

export function renderWorld(ctx: CanvasRenderingContext2D, world: WorldState) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (world.screenShake > 0.2) {
    const sx = (Math.random() - 0.5) * world.screenShake * 1.3;
    const sy = (Math.random() - 0.5) * world.screenShake * 1.3;
    ctx.translate(snap(sx), snap(sy));
  }

  // 1. Sky & Pixel Clouds
  drawSkyAndClouds(ctx, world.modifier);

  // 2. City Skyline Silhouette
  drawCitySkyline(ctx, world.modifier);

  // 3. Wooden Picket Fence & Stepped Pixel Bushes
  drawFenceAndBushes(ctx, world.modifier);

  // 4. Asphalt Court & Perspective White Court Lines
  drawAsphaltCourt(ctx, world);

  // 5. Shadows & Ball-Holder Indicator Ring on the Court
  drawCourtShadows(ctx, world);

  // 6. Basketball Hoops (Back layer: Pole, Backboard, Back Rim)
  for (const hoop of world.hoops) {
    drawHoopBack(ctx, hoop);
  }

  // 7. Ball Flight Trajectory Arc & Motion Trail
  drawBallFlightEffects(ctx, world.ball);

  // 8. Players (Tall athletic pixel bodies)
  for (const player of world.players) {
    drawPixelPlayer(ctx, player, world.modifier);
  }

  // 9. Basketball
  drawPixelBall(ctx, world.ball, world.modifier);

  // 10. Foreground Articulated Arms (drawn over ball/torso so raised hands look crisp)
  for (const player of world.players) {
    drawPlayerArm(ctx, player, world.modifier);
  }

  // 11. Basketball Hoops (Front Rim & Dynamic Spring Net)
  for (const hoop of world.hoops) {
    drawHoopFrontAndNet(ctx, hoop);
  }

  // 12. Particles & Score Popups
  drawParticlesAndPopups(ctx, world);

  // 13. On-Court Hold Control Indicators ("HOLD (W)" and "HOLD (↑)")
  drawOnCourtHoldPrompts(ctx, world);

  ctx.restore();
}

function drawSkyAndClouds(ctx: CanvasRenderingContext2D, modifier: RoundModifier) {
  let topColor = '#FFCF8B';
  let midColor = '#FFE1AE';
  let lowColor = '#FFEDCC';

  if (modifier.skyTheme === 'DUSK') {
    topColor = '#B388EB';
    midColor = '#F7A072';
    lowColor = '#FFD6A5';
  } else if (modifier.skyTheme === 'WINTER') {
    topColor = '#90CAF9';
    midColor = '#BBDEFB';
    lowColor = '#E3F2FD';
  } else if (modifier.skyTheme === 'GOLDEN') {
    topColor = '#FFB74D';
    midColor = '#FFD54F';
    lowColor = '#FFF176';
  }

  ctx.fillStyle = topColor;
  ctx.fillRect(0, 0, VIRTUAL_WIDTH, 280);

  ctx.fillStyle = midColor;
  ctx.fillRect(0, 56, VIRTUAL_WIDTH, 224);

  const cloudPuffs1 = [
    [0, 28, 120, 40],
    [180, 36, 96, 32],
    [320, 12, 160, 56],
    [480, 0, 290, 68],
    [770, 20, 180, 48],
    [980, 32, 140, 36],
    [1140, 16, 140, 52],
  ];
  for (const [x, y, w, h] of cloudPuffs1) {
    ctx.fillRect(x, y, w, h);
  }

  ctx.fillStyle = lowColor;
  ctx.fillRect(0, 96, VIRTUAL_WIDTH, 184);

  const cloudPuffs2 = [
    [24, 68, 92, 36],
    [210, 76, 110, 28],
    [360, 48, 140, 52],
    [516, 28, 220, 72],
    [736, 56, 160, 44],
    [920, 68, 120, 32],
    [1080, 52, 180, 48],
  ];
  for (const [x, y, w, h] of cloudPuffs2) {
    ctx.fillRect(x, y, w, h);
  }
}

function drawCitySkyline(ctx: CanvasRenderingContext2D, modifier: RoundModifier) {
  const backBuildingColor = modifier.skyTheme === 'WINTER' ? '#90A4AE' : '#FFB067';
  const frontBuildingColor = modifier.skyTheme === 'WINTER' ? '#78909C' : '#F59B4C';
  const windowColor = modifier.skyTheme === 'WINTER' ? '#E3F2FD' : '#FFE8C2';

  ctx.fillStyle = backBuildingColor;
  const backBuildings = [
    [8, 100, 128, 180],
    [188, 36, 96, 244],
    [308, 136, 68, 144],
    [412, 68, 92, 212],
    [504, 184, 140, 96],
    [644, 96, 96, 184],
    [744, 120, 116, 160],
    [956, 80, 92, 200],
    [1048, 132, 112, 148],
    [1164, 96, 108, 184],
  ];
  for (const [x, y, w, h] of backBuildings) {
    ctx.fillRect(x, y, w, h);
  }

  ctx.fillRect(220, 16, 32, 24);
  ctx.fillRect(232, 4, 8, 16);

  ctx.fillStyle = frontBuildingColor;
  const frontBuildings = [
    [64, 176, 116, 104],
    [264, 164, 92, 116],
    [364, 116, 96, 164],
    [516, 200, 124, 80],
    [688, 140, 116, 140],
    [820, 168, 128, 112],
    [988, 148, 108, 132],
    [1120, 160, 120, 120],
  ];
  for (const [x, y, w, h] of frontBuildings) {
    ctx.fillRect(x, y, w, h);
  }

  ctx.fillStyle = windowColor;
  const windows = [
    [24, 112, 36, 6],
    [204, 52, 44, 6],
    [428, 84, 32, 6],
    [524, 212, 48, 6],
    [660, 112, 28, 6],
    [972, 92, 40, 6],
    [1180, 112, 40, 6],
  ];
  for (const [x, y, w, h] of windows) {
    ctx.fillRect(x, y, w, h);
  }
}

function drawFenceAndBushes(ctx: CanvasRenderingContext2D, modifier: RoundModifier) {
  const fenceTopY = 270;
  const courtTopY = 404;
  const plankWidth = 36;

  for (let x = 0; x < VIRTUAL_WIDTH; x += plankWidth) {
    ctx.fillStyle = '#6E4B34';
    ctx.fillRect(x, fenceTopY + 4, plankWidth, courtTopY - fenceTopY);
    ctx.fillRect(x + 4, fenceTopY, plankWidth - 8, 8);

    ctx.fillStyle = '#96694C';
    ctx.fillRect(x + 4, fenceTopY + 4, plankWidth - 8, courtTopY - fenceTopY - 4);

    ctx.fillStyle = '#A37455';
    ctx.fillRect(x + 4, fenceTopY + 8, 4, courtTopY - fenceTopY - 12);
  }

  const bushMain = modifier.skyTheme === 'WINTER' ? '#B0BEC5' : '#93C842';
  const bushDark = modifier.skyTheme === 'WINTER' ? '#78909C' : '#7AB02E';
  const bushOutline = modifier.skyTheme === 'WINTER' ? '#455A64' : '#4B6B22';

  const stepWidth = 16;
  const totalSteps = Math.ceil(VIRTUAL_WIDTH / stepWidth);

  for (let i = 0; i < totalSteps; i++) {
    const x = i * stepWidth;
    const wave =
      Math.sin(i * 0.28) * 18 +
      Math.cos(i * 0.65) * 10 +
      Math.sin(i * 0.12) * 12;
    const bushHeight = Math.max(20, snap(44 + wave));
    const topY = courtTopY - bushHeight;

    ctx.fillStyle = bushOutline;
    ctx.fillRect(x, topY - PIXEL, stepWidth, PIXEL * 2);

    ctx.fillStyle = bushMain;
    ctx.fillRect(x, topY + PIXEL, stepWidth, bushHeight - PIXEL);

    ctx.fillStyle = bushDark;
    ctx.fillRect(x, courtTopY - PIXEL * 3, stepWidth, PIXEL * 3);
  }

  ctx.fillStyle = '#38393B';
  ctx.fillRect(0, courtTopY - PIXEL, VIRTUAL_WIDTH, PIXEL);
}

function drawAsphaltCourt(ctx: CanvasRenderingContext2D, world: WorldState) {
  const courtTopY = 404;
  const isIcy = world.modifier.id === 'ICY_COURT';

  ctx.fillStyle = isIcy ? '#5C6F7E' : '#4A4B4D';
  ctx.fillRect(0, courtTopY, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - courtTopY);

  ctx.fillStyle = isIcy ? '#6D8294' : '#424345';
  for (let i = 0; i < 85; i++) {
    const sx = ((i * 173 + 41) % (VIRTUAL_WIDTH - 40)) + 20;
    const sy = courtTopY + 12 + ((i * 97 + 19) % (VIRTUAL_HEIGHT - courtTopY - 24));
    ctx.fillRect(snap(sx), snap(sy), PIXEL, PIXEL);
  }

  ctx.fillStyle = isIcy ? '#7E95A8' : '#535457';
  for (let i = 0; i < 55; i++) {
    const sx = ((i * 227 + 83) % (VIRTUAL_WIDTH - 40)) + 20;
    const sy = courtTopY + 16 + ((i * 131 + 53) % (VIRTUAL_HEIGHT - courtTopY - 28));
    ctx.fillRect(snap(sx), snap(sy), PIXEL, PIXEL);
  }

  const lineColor = isIcy ? '#B3E5FC' : '#8C8D90';
  ctx.fillStyle = lineColor;

  const topY = 434;
  const botY = 612;
  const topLeftX = 264;
  const topRightX = VIRTUAL_WIDTH - 264;
  const botLeftX = 182;
  const botRightX = VIRTUAL_WIDTH - 182;

  ctx.fillRect(topLeftX, topY, topRightX - topLeftX, 8);
  ctx.fillRect(botLeftX, botY, botRightX - botLeftX, 8);

  drawPixelLine(ctx, topLeftX, topY, botLeftX, botY, 10, lineColor);
  drawPixelLine(ctx, topRightX, topY, botRightX, botY, 10, lineColor);

  const leftKeyTopY = 486;
  const leftKeyBotY = 560;
  const leftKeyOuterTopX = Math.round(
    topLeftX + ((leftKeyTopY - topY) / (botY - topY)) * (botLeftX - topLeftX)
  );
  const leftKeyOuterBotX = Math.round(
    topLeftX + ((leftKeyBotY - topY) / (botY - topY)) * (botLeftX - topLeftX)
  );
  const leftKeyInnerTopX = leftKeyOuterTopX + 114;
  const leftKeyInnerBotX = leftKeyOuterBotX + 114;

  ctx.fillRect(leftKeyOuterTopX, leftKeyTopY, leftKeyInnerTopX - leftKeyOuterTopX, 6);
  ctx.fillRect(leftKeyOuterBotX, leftKeyBotY, leftKeyInnerBotX - leftKeyOuterBotX, 6);
  drawPixelLine(ctx, leftKeyInnerTopX, leftKeyTopY, leftKeyInnerBotX, leftKeyBotY, 8, lineColor);

  const rightKeyOuterTopX = VIRTUAL_WIDTH - leftKeyOuterTopX;
  const rightKeyOuterBotX = VIRTUAL_WIDTH - leftKeyOuterBotX;
  const rightKeyInnerTopX = rightKeyOuterTopX - 114;
  const rightKeyInnerBotX = rightKeyOuterBotX - 114;

  ctx.fillRect(rightKeyInnerTopX, leftKeyTopY, rightKeyOuterTopX - rightKeyInnerTopX, 6);
  ctx.fillRect(rightKeyInnerBotX, leftKeyBotY, rightKeyOuterBotX - rightKeyInnerBotX, 6);
  drawPixelLine(ctx, rightKeyInnerTopX, leftKeyTopY, rightKeyInnerBotX, leftKeyBotY, 8, lineColor);
}

function drawPixelLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
  color: string
) {
  ctx.fillStyle = color;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / PIXEL;
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = snap(x0 + (x1 - x0) * t);
    const y = snap(y0 + (y1 - y0) * t);
    ctx.fillRect(x - snap(thickness / 2), y, snap(thickness), PIXEL * 2);
  }
}

function drawCourtShadows(ctx: CanvasRenderingContext2D, world: WorldState) {
  ctx.fillStyle = 'rgba(20, 20, 22, 0.42)';

  for (const hoop of world.hoops) {
    ctx.fillRect(hoop.poleX - 24, GROUND_Y - 4, 48, 14);
  }

  for (const p of world.players) {
    const heightAboveGround = Math.max(0, GROUND_Y - p.y);
    const scale = Math.max(0.4, 1 - heightAboveGround / 380);
    const sw = snap(52 * scale);
    const sh = snap(12 * scale);

    // Subtle team ring under the active ball-holder so possession is crystal clear
    if (world.ball.holderId === p.id) {
      ctx.fillStyle = p.team === 1 ? 'rgba(247, 181, 25, 0.55)' : 'rgba(0, 128, 255, 0.55)';
      ctx.fillRect(snap(p.x) - sw / 2 - 8, GROUND_Y - sh / 2, sw + 16, sh + 8);
    }

    ctx.fillStyle = 'rgba(20, 20, 22, 0.45)';
    ctx.fillRect(snap(p.x) - sw / 2, GROUND_Y - sh / 2 + 4, sw, sh);
  }

  const ball = world.ball;
  const ballHeight = Math.max(0, GROUND_Y - (ball.y + ball.radius));
  const bScale = Math.max(0.35, 1 - ballHeight / 440);
  const bw = snap(ball.radius * 1.9 * bScale);
  const bh = snap(10 * bScale);
  ctx.fillStyle = 'rgba(20, 20, 22, 0.55)';
  ctx.fillRect(snap(ball.x) - bw / 2, GROUND_Y - bh / 2 + 4, bw, bh);
}

function drawHoopBack(ctx: CanvasRenderingContext2D, hoop: HoopEntity) {
  const isLeft = hoop.teamOwner === 1;
  const dir = isLeft ? 1 : -1;
  const poleX = hoop.poleX;
  const boardX = hoop.backboardX;

  const poleW = 24;
  const poleTopY = 238;
  ctx.fillStyle = '#000000';
  ctx.fillRect(
    poleX - poleW / 2 - PIXEL,
    poleTopY - PIXEL,
    poleW + PIXEL * 2,
    GROUND_Y - poleTopY + PIXEL * 2
  );

  ctx.fillStyle = '#E6E7E8';
  ctx.fillRect(poleX - poleW / 2, poleTopY, poleW, GROUND_Y - poleTopY);

  ctx.fillStyle = '#C2C4C6';
  ctx.fillRect(isLeft ? poleX + 2 : poleX - poleW / 2, poleTopY, 6, GROUND_Y - poleTopY);

  drawOutlinedBeam(
    ctx,
    poleX,
    poleTopY + 8,
    boardX - dir * 8,
    hoop.backboardTopY + 56,
    18
  );
  drawOutlinedBeam(
    ctx,
    poleX,
    poleTopY + 12,
    boardX - dir * 8,
    poleTopY + 12,
    18
  );

  const boardW = 16;
  const bx = isLeft ? boardX - boardW : boardX;
  const by = hoop.backboardTopY;
  const bh = hoop.backboardBottomY - hoop.backboardTopY;

  ctx.fillStyle = '#000000';
  ctx.fillRect(bx - PIXEL, by - PIXEL, boardW + PIXEL * 2, bh + PIXEL * 2);
  ctx.fillStyle = '#F2F3F4';
  ctx.fillRect(bx, by, boardW, bh);
  ctx.fillStyle = '#C8CACD';
  ctx.fillRect(bx + (isLeft ? 0 : boardW - 6), by, 6, bh);

  const minRimX = Math.min(hoop.rimBackX, hoop.rimFrontX);
  const maxRimX = Math.max(hoop.rimBackX, hoop.rimFrontX);
  const rimW = maxRimX - minRimX;
  const rimY = hoop.rimY;

  ctx.fillStyle = '#000000';
  ctx.fillRect(isLeft ? boardX : minRimX - 8, rimY - 6, 14, 16);
  ctx.fillStyle = '#E52521';
  ctx.fillRect(isLeft ? boardX : minRimX - 4, rimY - 2, 10, 8);

  ctx.fillStyle = '#000000';
  ctx.fillRect(minRimX - PIXEL, rimY - 10, rimW + PIXEL * 2, 20);
  ctx.fillStyle = '#E52521';
  ctx.fillRect(minRimX, rimY - 6, rimW, 12);
  ctx.fillStyle = '#FF7B78';
  ctx.fillRect(minRimX + 8, rimY - 2, rimW - 16, 4);
}

function drawHoopFrontAndNet(ctx: CanvasRenderingContext2D, hoop: HoopEntity) {
  const minRimX = Math.min(hoop.rimBackX, hoop.rimFrontX);
  const maxRimX = Math.max(hoop.rimBackX, hoop.rimFrontX);
  const rimW = maxRimX - minRimX;
  const rimY = hoop.rimY;

  const netTopY = rimY + 8;
  const netHeight = Math.round(56 + hoop.netStretch);
  const sway = snap(hoop.netSway);

  const topLeft = minRimX + 8;
  const topRight = maxRimX - 8;
  const botLeft = minRimX + 16 + sway;
  const botRight = maxRimX - 16 + sway;

  const strands = 5;
  for (let i = 0; i <= strands; i++) {
    const t = i / strands;
    const tx = topLeft + (topRight - topLeft) * t;
    const bx = botLeft + (botRight - botLeft) * t;

    drawPixelLine(ctx, tx, netTopY, bx, netTopY + netHeight, 4, '#FFFFFF');
    if (i < strands) {
      const nextTx = topLeft + (topRight - topLeft) * ((i + 1) / strands);
      const midX = (tx + nextTx) * 0.5 + sway * 0.4;
      drawPixelLine(ctx, tx, netTopY, midX, netTopY + netHeight * 0.5, 4, '#E0E0E0');
      drawPixelLine(ctx, nextTx, netTopY, midX, netTopY + netHeight * 0.5, 4, '#E0E0E0');
      drawPixelLine(ctx, midX, netTopY + netHeight * 0.5, bx, netTopY + netHeight, 4, '#FFFFFF');
    }
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(minRimX - PIXEL, rimY + 2, rimW + PIXEL * 2, 10);
  ctx.fillStyle = '#D32F2F';
  ctx.fillRect(minRimX, rimY + 2, rimW, 6);
}

function drawOutlinedBeam(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number
) {
  drawPixelLine(ctx, x0, y0, x1, y1, thickness + PIXEL * 2, '#000000');
  drawPixelLine(ctx, x0, y0, x1, y1, thickness, '#E6E7E8');
}

function drawPixelPlayer(
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity,
  modifier: RoundModifier
) {
  ctx.save();
  ctx.translate(snap(player.x), snap(player.y));
  ctx.rotate(player.angle);

  const scaleY = 1 + player.jumpSquash;
  const scaleX = 1 - player.jumpSquash * 0.45;
  ctx.scale(player.facing * scaleX, scaleY);

  const skin = player.skin;

  // Taller, cleaner ~164px basketball player geometry (relative to feet at 0,0)
  // 1. Sneakers
  ctx.fillStyle = '#000000';
  ctx.fillRect(-16, -16, 38, 16);
  ctx.fillStyle = '#222222';
  ctx.fillRect(-12, -12, 30, 8);

  // 2. Tall White Crew Socks & Long Athletic Lower Legs
  ctx.fillStyle = '#000000';
  ctx.fillRect(-14, -64, 28, 50);
  // White socks
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-10, -38, 20, 22);
  // Skin calves/knees
  ctx.fillStyle = skin.skinColor;
  ctx.fillRect(-10, -64, 20, 26);

  // 3. Tall Shorts & Jersey Torso (with crisp 4px black outline)
  ctx.fillStyle = '#000000';
  ctx.fillRect(-16, -134, 32, 72);

  // Basketball Shorts
  ctx.fillStyle = skin.shortsColor;
  ctx.fillRect(-12, -88, 24, 24);
  ctx.fillStyle = skin.jerseyTrim;
  ctx.fillRect(-4, -88, 4, 24);

  // Jersey Torso
  ctx.fillStyle = skin.jerseyColor;
  ctx.fillRect(-12, -130, 24, 42);

  // V-neck & Armhole Trim matching screenshot
  ctx.fillStyle = skin.jerseyTrim;
  ctx.fillRect(0, -130, 12, 10);
  ctx.fillRect(4, -120, 8, 6);

  // 4. Neck & Head (tilted forward slightly like in Basket Random)
  ctx.save();
  ctx.translate(2, -134);
  ctx.rotate(0.18);

  ctx.fillStyle = '#000000';
  ctx.fillRect(-14, -34, 30, 34);

  ctx.fillStyle = skin.skinColor;
  ctx.fillRect(-10, -30, 22, 26);

  ctx.fillStyle = skin.skinShadow;
  ctx.fillRect(-10, -8, 18, 4);

  // Pixel Eye
  ctx.fillStyle = '#000000';
  ctx.fillRect(4, -20, 4, 4);

  // Hairstyles
  if (skin.hairStyle === 'SHORT_DARK') {
    ctx.fillStyle = skin.hairColor;
    ctx.fillRect(-14, -36, 28, 8);
    ctx.fillRect(-14, -30, 10, 18);
  } else if (skin.hairStyle === 'SPIKY_BROWN') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(-16, -40, 34, 12);
    ctx.fillStyle = skin.hairColor;
    ctx.fillRect(-12, -36, 28, 8);
    ctx.fillRect(8, -40, 10, 8);
    ctx.fillRect(-12, -30, 8, 14);
  } else if (skin.hairStyle === 'BALD') {
    ctx.fillStyle = '#FFE0C2';
    ctx.fillRect(-6, -30, 12, 4);
  } else if (skin.hairStyle === 'TIED_DARK') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(-18, -36, 30, 10);
    ctx.fillRect(-22, -28, 8, 10);
    ctx.fillStyle = skin.hairColor;
    ctx.fillRect(-14, -32, 24, 6);
    ctx.fillRect(-14, -28, 8, 16);
  }

  ctx.restore();
  ctx.restore();
  void modifier;
}

function drawPlayerArm(
  ctx: CanvasRenderingContext2D,
  player: PlayerEntity,
  modifier: RoundModifier
) {
  const joints = getPlayerJoints(player, modifier);
  const armLength = Math.round(64 * modifier.armScale);

  ctx.save();
  ctx.translate(snap(joints.shoulderX), snap(joints.shoulderY));
  ctx.rotate(joints.worldArmAngle);

  const armW = 14;

  ctx.fillStyle = '#000000';
  ctx.fillRect(-armW / 2 - PIXEL, -armLength - PIXEL, armW + PIXEL * 2, armLength + PIXEL * 2);

  ctx.fillStyle = player.skin.skinColor;
  ctx.fillRect(-armW / 2, -armLength, armW, armLength);

  ctx.fillStyle = player.skin.skinShadow;
  ctx.fillRect(-armW / 2, -armLength, 4, armLength);

  ctx.restore();
}

function drawBallFlightEffects(ctx: CanvasRenderingContext2D, ball: BallEntity) {
  if (ball.holderId === null && ball.predictedArc.length > 0) {
    for (let i = 0; i < ball.predictedArc.length; i++) {
      const pt = ball.predictedArc[i];
      if (pt.y > GROUND_Y) continue;
      const alpha = Math.max(0.1, 0.5 - i * 0.038);
      ctx.fillStyle = `rgba(255, 240, 185, ${alpha})`;
      ctx.fillRect(snap(pt.x) - 4, snap(pt.y) - 4, 8, 8);
    }
  }

  for (let i = 0; i < ball.trail.length; i++) {
    const t = ball.trail[i];
    const r = Math.max(6, snap(ball.radius * (1 - i * 0.08)));
    ctx.fillStyle = `rgba(255, 165, 36, ${t.alpha * 0.34})`;
    ctx.fillRect(snap(t.x) - r, snap(t.y) - r, r * 2, r * 2);
  }
}

function drawPixelBall(
  ctx: CanvasRenderingContext2D,
  ball: BallEntity,
  modifier: RoundModifier
) {
  ctx.save();
  ctx.translate(snap(ball.x), snap(ball.y));
  ctx.rotate(ball.rotation);

  const r = snap(ball.radius);

  let mainColor = '#FF981A';
  let darkColor = '#D96B00';
  let lightColor = '#FFCC4D';

  if (modifier.ballStyle === 'IRON') {
    mainColor = '#78909C';
    darkColor = '#455A64';
    lightColor = '#CFD8DC';
  } else if (modifier.ballStyle === 'BEACH') {
    mainColor = '#FF5252';
    darkColor = '#1976D2';
    lightColor = '#FFEB3B';
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(-r, -r + 4, r * 2, r * 2 - 8);
  ctx.fillRect(-r + 4, -r, r * 2 - 8, r * 2);

  ctx.fillStyle = mainColor;
  ctx.fillRect(-r + 4, -r + 4, r * 2 - 8, r * 2 - 8);

  ctx.fillStyle = darkColor;
  ctx.fillRect(-r + 4, r - 10, r * 2 - 8, 6);

  ctx.fillStyle = lightColor;
  ctx.fillRect(-r + 8, -r + 8, r - 4, 6);

  ctx.fillStyle = '#1E1E1E';
  ctx.fillRect(-r + 4, -2, r * 2 - 8, 4);
  ctx.fillRect(-2, -r + 4, 4, r * 2 - 8);

  ctx.restore();
}

function drawParticlesAndPopups(ctx: CanvasRenderingContext2D, world: WorldState) {
  for (const pt of world.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pt.alpha);
    ctx.fillStyle = pt.color;
    const s = snap(pt.size);
    ctx.fillRect(snap(pt.x) - s / 2, snap(pt.y) - s / 2, s, s);
    ctx.restore();
  }

  for (const pop of world.popups) {
    ctx.save();
    ctx.font = 'bold 20px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#000000';
    ctx.fillText(pop.text, snap(pop.x) + 3, snap(pop.y) + 3);
    ctx.fillStyle = pop.color;
    ctx.fillText(pop.text, snap(pop.x), snap(pop.y));

    if (pop.subtext) {
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.fillStyle = '#000000';
      ctx.fillText(pop.subtext, snap(pop.x) + 2, snap(pop.y) + 26);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(pop.subtext, snap(pop.x), snap(pop.y) + 24);
    }
    ctx.restore();
  }
}

function drawOnCourtHoldPrompts(ctx: CanvasRenderingContext2D, world: WorldState) {
  ctx.save();
  ctx.font = 'bold 34px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillStyle = world.team1Hold ? '#F7B519' : '#000000';
  ctx.fillText('HOLD(W)', 114, 672);

  ctx.textAlign = 'right';
  ctx.fillStyle = world.team2Hold ? '#0080FF' : '#000000';
  ctx.fillText('HOLD(↑)', VIRTUAL_WIDTH - 92, 672);

  ctx.restore();
}
