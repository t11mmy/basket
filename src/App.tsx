/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import {
  createInitialWorld,
  stepWorld,
  triggerTeamPress,
  triggerTeamRelease,
  updateAIController,
  VIRTUAL_HEIGHT,
  VIRTUAL_WIDTH,
} from './game/physicsEngine';
import { renderWorld } from './game/pixelRenderer';
import { GameMode, GameScreenState, MatchStats, RoundModifier } from './game/types';

interface HudSnapshot {
  score1: number;
  score2: number;
  roundNumber: number;
  modifier: RoundModifier;
  roundBannerTimer: number;
  lastScorerTeam: 1 | 2 | null;
  goalCelebrationTimer: number;
  team1Hold: boolean;
  team2Hold: boolean;
  stats: MatchStats;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef(createInitialWorld(true));

  const [screenState, setScreenState] = useState<GameScreenState>('TITLE_SCREEN');
  const [gameMode, setGameMode] = useState<GameMode>('2P');
  const [randomModifiers, setRandomModifiers] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);

  const screenStateRef = useRef<GameScreenState>(screenState);
  const gameModeRef = useRef<GameMode>(gameMode);
  const randomModifiersRef = useRef<boolean>(randomModifiers);

  useEffect(() => {
    screenStateRef.current = screenState;
  }, [screenState]);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  useEffect(() => {
    randomModifiersRef.current = randomModifiers;
    worldRef.current.enableRandomModifiers = randomModifiers;
  }, [randomModifiers]);

  const [hud, setHud] = useState<HudSnapshot>(() => ({
    score1: 0,
    score2: 0,
    roundNumber: 1,
    modifier: worldRef.current.modifier,
    roundBannerTimer: 0,
    lastScorerTeam: null,
    goalCelebrationTimer: 0,
    team1Hold: false,
    team2Hold: false,
    stats: { ...worldRef.current.stats },
  }));

  const syncHudFromWorld = useCallback(() => {
    const w = worldRef.current;
    setHud((prev) => {
      if (
        prev.score1 === w.score1 &&
        prev.score2 === w.score2 &&
        prev.roundNumber === w.roundNumber &&
        prev.modifier.id === w.modifier.id &&
        Math.abs(prev.roundBannerTimer - w.roundBannerTimer) < 0.1 &&
        Math.abs(prev.goalCelebrationTimer - w.goalCelebrationTimer) < 0.1 &&
        prev.team1Hold === w.team1Hold &&
        prev.team2Hold === w.team2Hold
      ) {
        return prev;
      }
      return {
        score1: w.score1,
        score2: w.score2,
        roundNumber: w.roundNumber,
        modifier: w.modifier,
        roundBannerTimer: w.roundBannerTimer,
        lastScorerTeam: w.lastScorerTeam,
        goalCelebrationTimer: w.goalCelebrationTimer,
        team1Hold: w.team1Hold,
        team2Hold: w.team2Hold,
        stats: { ...w.stats },
      };
    });
  }, []);

  const startNewMatch = useCallback(
    (selectedMode?: GameMode) => {
      const modeToUse = selectedMode ?? gameModeRef.current;
      if (selectedMode) {
        setGameMode(selectedMode);
        gameModeRef.current = selectedMode;
      }
      worldRef.current = createInitialWorld(randomModifiersRef.current);
      setScreenState('PLAYING');
      screenStateRef.current = 'PLAYING';
      soundEngine.playWhistle();
      syncHudFromWorld();
    },
    [syncHudFromWorld]
  );

  const toggleMute = useCallback(() => {
    soundEngine.muted = !soundEngine.muted;
    setMuted(soundEngine.muted);
  }, []);

  const togglePause = useCallback(() => {
    setScreenState((prev) => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, []);

  // Keyboard Input Handling (Separate continuous held states & edge-triggered actions + blur reset)
  useEffect(() => {
    const heldCodes = new Set<string>();

    const isTeam1Code = (code: string) => code === 'KeyW' || code === 'Space';
    const isTeam2Code = (code: string) => code === 'ArrowUp';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault();
      }

      if (e.code === 'Escape') {
        if (screenStateRef.current === 'PLAYING' || screenStateRef.current === 'PAUSED') {
          togglePause();
        }
        return;
      }

      if (screenStateRef.current === 'TITLE_SCREEN') {
        if (e.code === 'Enter' || e.code === 'Space') {
          startNewMatch();
        }
        return;
      }

      if (screenStateRef.current === 'GAME_OVER') {
        if (e.code === 'Enter' || e.code === 'Space') {
          startNewMatch();
        }
        return;
      }

      if (screenStateRef.current !== 'PLAYING') return;

      if (heldCodes.has(e.code)) return;
      heldCodes.add(e.code);

      if (isTeam1Code(e.code)) {
        triggerTeamPress(worldRef.current, 1);
        syncHudFromWorld();
      } else if (isTeam2Code(e.code) && gameModeRef.current === '2P') {
        triggerTeamPress(worldRef.current, 2);
        syncHudFromWorld();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldCodes.delete(e.code);
      if (screenStateRef.current !== 'PLAYING') return;

      if (isTeam1Code(e.code)) {
        // Only release if neither KeyW nor Space is still held
        if (!heldCodes.has('KeyW') && !heldCodes.has('Space')) {
          triggerTeamRelease(worldRef.current, 1);
          syncHudFromWorld();
        }
      } else if (isTeam2Code(e.code) && gameModeRef.current === '2P') {
        triggerTeamRelease(worldRef.current, 2);
        syncHudFromWorld();
      }
    };

    const handleWindowBlur = () => {
      heldCodes.clear();
      if (worldRef.current.team1Hold) {
        triggerTeamRelease(worldRef.current, 1);
      }
      if (worldRef.current.team2Hold) {
        triggerTeamRelease(worldRef.current, 2);
      }
      syncHudFromWorld();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [startNewMatch, syncHudFromWorld, togglePause]);

  // Isolated 60FPS Canvas Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const state = screenStateRef.current;
          const world = worldRef.current;

          if (state === 'TITLE_SCREEN') {
            // Live background street court simulation on Title Screen
            updateAIController(world, Math.min(rawDt, 0.05));
            stepWorld(world, rawDt, '1P_AI');
            if (world.score1 >= 4 || world.score2 >= 4) {
              world.score1 = 0;
              world.score2 = 0;
            }
          } else if (state === 'PLAYING') {
            const { matchEnded } = stepWorld(world, rawDt, gameModeRef.current);
            syncHudFromWorld();
            if (matchEnded) {
              setScreenState('GAME_OVER');
              screenStateRef.current = 'GAME_OVER';
              setHud({
                score1: world.score1,
                score2: world.score2,
                roundNumber: world.roundNumber,
                modifier: world.modifier,
                roundBannerTimer: world.roundBannerTimer,
                lastScorerTeam: world.lastScorerTeam,
                goalCelebrationTimer: world.goalCelebrationTimer,
                team1Hold: world.team1Hold,
                team2Hold: world.team2Hold,
                stats: { ...world.stats },
              });
            }
          }

          renderWorld(ctx, world);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [syncHudFromWorld]);

  const winnerTeam = hud.score1 >= 5 ? 1 : hud.score2 >= 5 ? 2 : null;

  return (
    <div className="relative w-screen h-screen bg-[#18191B] overflow-hidden flex items-center justify-center select-none">
      {/* Aspect-Ratio Preserving Pixel Canvas Viewport */}
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={VIRTUAL_WIDTH}
          height={VIRTUAL_HEIGHT}
          className="w-full h-full object-contain pixelated"
        />
      </div>

      {/* =====================================================================
          PLAYING HUD OVERLAY (Clean, Unobtrusive, >92% Playfield Open)
      ====================================================================== */}
      {screenState !== 'TITLE_SCREEN' && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-5">
          {/* Top Perimeter Bar: Compact Center Scoreboard & Top-Right Pause/Mute */}
          <div className="relative flex items-start justify-center w-full">
            {/* Center Arcade Scoreboard */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-5 bg-[#1E1F22] border-4 border-black px-5 py-2 shadow-[5px_5px_0px_#000]">
                {/* Team 1 (Yellow) */}
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline text-[11px] font-bold tracking-wider text-[#F7B519] uppercase">
                    Желтые
                  </span>
                  <div className="hidden md:flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((pip) => (
                      <div
                        key={pip}
                        className={`w-2.5 h-2.5 border-2 border-black ${
                          hud.score1 > pip ? 'bg-[#F7B519]' : 'bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className="font-pixel text-2xl text-[#F7B519]"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {hud.score1}
                  </span>
                </div>

                <span className="font-pixel text-base text-neutral-500">:</span>

                {/* Team 2 (Blue) */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="font-pixel text-2xl text-[#3399FF]"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {hud.score2}
                  </span>
                  <div className="hidden md:flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((pip) => (
                      <div
                        key={pip}
                        className={`w-2.5 h-2.5 border-2 border-black ${
                          hud.score2 > pip ? 'bg-[#0080FF]' : 'bg-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="hidden sm:inline text-[11px] font-bold tracking-wider text-[#3399FF] uppercase">
                    {gameMode === '2P' ? 'Синие' : 'Бот'}
                  </span>
                </div>
              </div>

              {/* Quiet Round & Modifier Line */}
              <div className="mt-1.5 px-3 py-0.5 bg-black/75 text-[11px] font-semibold tracking-wide text-amber-200">
                <span>Раунд {hud.roundNumber}</span>
                <span className="mx-1.5 text-neutral-400">·</span>
                <span>{hud.modifier.nameRu}</span>
              </div>

              {/* Compact Top Banner on New Round (never blocks the court center) */}
              {hud.roundBannerTimer > 0 && hud.roundNumber > 1 && (
                <div className="mt-2 bg-[#1E1F22] border-3 border-black px-5 py-2 shadow-[4px_4px_0px_#000] text-center">
                  <div className="font-pixel text-xs text-amber-400">
                    {hud.modifier.nameRu}
                  </div>
                  <div className="text-[11px] text-neutral-300 mt-0.5">
                    {hud.modifier.subtitleRu}
                  </div>
                </div>
              )}
            </div>

            {/* Top-Right Pixel Mute & Pause Buttons (Matching Screenshot) */}
            <div className=" (absolute) absolute right-0 top-0 flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleMute}
                title={muted ? 'Включить звук' : 'Выключить звук'}
                className="pointer-events-auto w-11 h-11 bg-white text-black border-4 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-100 active:translate-y-0.5 flex items-center justify-center cursor-pointer"
              >
                {muted ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={togglePause}
                title="Пауза (Esc)"
                className="pointer-events-auto w-11 h-11 bg-white text-black border-4 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-100 active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="w-2 h-5 bg-black block" />
                <span className="w-2 h-5 bg-black block" />
              </button>
            </div>
          </div>

          {/* Bottom Interactive Touch / Pointer Hold Zones */}
          <div className="flex items-end justify-between w-full">
            <button
              type="button"
              onPointerDown={() => {
                if (screenState === 'PLAYING') {
                  triggerTeamPress(worldRef.current, 1);
                  syncHudFromWorld();
                }
              }}
              onPointerUp={() => {
                if (screenState === 'PLAYING') {
                  triggerTeamRelease(worldRef.current, 1);
                  syncHudFromWorld();
                }
              }}
              onPointerLeave={() => {
                if (screenState === 'PLAYING' && worldRef.current.team1Hold) {
                  triggerTeamRelease(worldRef.current, 1);
                  syncHudFromWorld();
                }
              }}
              className="pointer-events-auto px-4 py-2 bg-black/50 hover:bg-black/75 text-neutral-200 text-xs font-semibold border-2 border-black/80 cursor-pointer whitespace-nowrap shrink-0"
            >
              Зажать: W / Пробел
            </button>

            {gameMode === '2P' && (
              <button
                type="button"
                onPointerDown={() => {
                  if (screenState === 'PLAYING') {
                    triggerTeamPress(worldRef.current, 2);
                    syncHudFromWorld();
                  }
                }}
                onPointerUp={() => {
                  if (screenState === 'PLAYING') {
                    triggerTeamRelease(worldRef.current, 2);
                    syncHudFromWorld();
                  }
                }}
                onPointerLeave={() => {
                  if (screenState === 'PLAYING' && worldRef.current.team2Hold) {
                    triggerTeamRelease(worldRef.current, 2);
                    syncHudFromWorld();
                  }
                }}
                className="pointer-events-auto px-4 py-2 bg-black/50 hover:bg-black/75 text-neutral-200 text-xs font-semibold border-2 border-black/80 cursor-pointer whitespace-nowrap shrink-0"
              >
                Зажать: ↑ Стрелка
              </button>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TITLE SCREEN OVERLAY (Over Live Pixel-Art Street Court Simulation)
      ====================================================================== */}
      {screenState === 'TITLE_SCREEN' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25 flex flex-col items-center justify-between p-6 md:p-10">
          {/* Top Utility Strip */}
          <div className="w-full max-w-5xl flex items-center justify-between">
            <div className="text-xs font-semibold tracking-wider text-amber-200 uppercase">
              Pixel Ragdoll Street Basketball · 2 на 2
            </div>
            <button
              type="button"
              onClick={toggleMute}
              className="px-3.5 py-2 bg-[#1E1F22] text-white text-xs font-semibold border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-neutral-800 cursor-pointer whitespace-nowrap shrink-0"
            >
              {muted ? 'Звук: ВЫКЛ' : 'Звук: ВКЛ'}
            </button>
          </div>

          {/* Hero Centerpiece Lockup */}
          <div className="flex flex-col items-center text-center max-w-2xl my-auto">
            {/* Bespoke Inline SVG Pixel Basketball Emblem & Title Lockup */}
            <svg
              className="w-20 h-20 mb-4 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              viewBox="0 0 64 64"
              fill="none"
            >
              <rect x="8" y="8" width="48" height="48" fill="#000000" />
              <rect x="12" y="12" width="40" height="40" fill="#FF981A" />
              <rect x="16" y="16" width="16" height="8" fill="#FFCC4D" />
              <rect x="12" y="44" width="40" height="8" fill="#D96B00" />
              <rect x="12" y="30" width="40" height="4" fill="#181818" />
              <rect x="30" y="12" width="4" height="40" fill="#181818" />
            </svg>

            <h1 className="font-pixel text-3xl sm:text-5xl text-white tracking-tight drop-shadow-[5px_5px_0px_#000] mb-3">
              BASKET RANDOM
            </h1>
            <p className="text-sm sm:text-base text-amber-100 max-w-lg mb-8 leading-relaxed">
              Зажимай клавишу, чтобы оба твоих баскетболиста прыгнули в сторону наклона и подняли
              руки. Отпускай в прыжке — чтобы отправить мяч точно в кольцо!
            </p>

            {/* Mode & Random Modifier Controls */}
            <div className="bg-[#1E1F22] border-4 border-black p-5 shadow-[8px_8px_0px_#000] w-full max-w-md space-y-4">
              {/* Game Mode Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGameMode('2P')}
                  className={`py-3 px-4 font-bold text-sm border-3 border-black cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    gameMode === '2P'
                      ? 'bg-[#F7B519] text-black shadow-[3px_3px_0px_#000]'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  2 Игрока (На одном ПК)
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode('1P_AI')}
                  className={`py-3 px-4 font-bold text-sm border-3 border-black cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                    gameMode === '1P_AI'
                      ? 'bg-[#0080FF] text-white shadow-[3px_3px_0px_#000]'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  1 Игрок против Бота
                </button>
              </div>

              {/* Random Modifiers Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-900 border-2 border-black text-xs">
                <span className="text-neutral-200 font-medium">
                  Случайные события после гола:
                </span>
                <button
                  type="button"
                  onClick={() => setRandomModifiers((prev) => !prev)}
                  className={`px-3 py-1 font-bold border-2 border-black cursor-pointer whitespace-nowrap shrink-0 ${
                    randomModifiers
                      ? 'bg-emerald-400 text-black'
                      : 'bg-neutral-700 text-neutral-200'
                  }`}
                >
                  {randomModifiers ? 'ВКЛЮЧЕНЫ' : 'ТОЛЬКО КЛАССИКА'}
                </button>
              </div>

              {/* Primary Start CTA */}
              <button
                type="button"
                onClick={() => startNewMatch()}
                className="w-full py-4 px-6 bg-[#E52521] hover:bg-[#F43632] active:translate-y-0.5 text-white font-pixel text-base sm:text-lg border-4 border-black shadow-[5px_5px_0px_#000] cursor-pointer whitespace-nowrap shrink-0"
              >
                НАЧАТЬ МАТЧ
              </button>
            </div>
          </div>

          {/* Single Flat Control-Hint Line */}
          <div className="px-4 py-2 bg-black/80 border-2 border-black text-xs sm:text-sm text-neutral-200 text-center">
            Игрок 1 (Желтые): <strong className="text-[#F7B519]">W</strong> или{' '}
            <strong className="text-[#F7B519]">Пробел</strong> · Игрок 2 (Синие):{' '}
            <strong className="text-[#3399FF]">Стрелка вверх (↑)</strong> · Пауза:{' '}
            <strong className="text-white">Esc</strong>
          </div>
        </div>
      )}

      {/* =====================================================================
          PAUSE MODAL
      ====================================================================== */}
      {screenState === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1E1F22] border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_#000] max-w-md w-full text-center space-y-5">
            <h2 className="font-pixel text-2xl text-white">ПАУЗА</h2>

            <div className="text-xs text-neutral-300 space-y-1.5 bg-neutral-900 p-4 border-2 border-black text-left">
              <div>
                <span className="text-[#F7B519] font-bold">Игрок 1 (Слева):</span> зажать{' '}
                <code className="text-white">W</code> или <code className="text-white">Пробел</code>{' '}
                — прыжок и подъем рук; отпустить — бросок в кольцо.
              </div>
              <div>
                <span className="text-[#3399FF] font-bold">Игрок 2 (Справа):</span> зажать{' '}
                <code className="text-white">Стрелку вверх (↑)</code> — прыжок и подъем рук;
                отпустить — бросок.
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-2 border-black text-xs">
              <span className="text-neutral-300">Случайные модификаторы:</span>
              <button
                type="button"
                onClick={() => setRandomModifiers((prev) => !prev)}
                className={`px-3 py-1 font-bold border-2 border-black cursor-pointer whitespace-nowrap shrink-0 ${
                  randomModifiers ? 'bg-emerald-400 text-black' : 'bg-neutral-700 text-white'
                }`}
              >
                {randomModifiers ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={togglePause}
                className="w-full py-3.5 px-6 bg-[#F7B519] hover:bg-amber-400 text-black font-pixel text-sm border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer whitespace-nowrap shrink-0"
              >
                ПРОДОЛЖИТЬ ИГРУ
              </button>
              <button
                type="button"
                onClick={() => startNewMatch()}
                className="w-full py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border-3 border-black cursor-pointer whitespace-nowrap shrink-0"
              >
                Начать заново
              </button>
              <button
                type="button"
                onClick={() => setScreenState('TITLE_SCREEN')}
                className="w-full py-2.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border-2 border-black cursor-pointer whitespace-nowrap shrink-0"
              >
                Выйти в главное меню
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VICTORY / GAME OVER MODAL (First to 5 Points)
      ====================================================================== */}
      {screenState === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#1E1F22] border-4 border-black p-6 sm:p-8 shadow-[10px_10px_0px_#000] max-w-lg w-full text-center space-y-6">
            <div className="inline-block px-3 py-1 bg-black text-amber-300 font-pixel text-xs">
              МАТЧ ОКОНЧЕН
            </div>

            <h2
              className={`font-pixel text-2xl sm:text-3xl leading-snug ${
                winnerTeam === 1 ? 'text-[#F7B519]' : 'text-[#3399FF]'
              }`}
            >
              {winnerTeam === 1
                ? 'ПОБЕДА ИГРОКА 1 (ЖЕЛТЫЕ)!'
                : gameMode === '2P'
                ? 'ПОБЕДА ИГРОКА 2 (СИНИЕ)!'
                : 'ПОБЕДА СИНEЙ КОМАНДЫ!'}
            </h2>

            {/* Final Score Display */}
            <div
              className="flex items-center justify-center gap-6 py-4 bg-neutral-900 border-3 border-black"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              <div className="text-center">
                <div className="text-xs text-neutral-400 mb-1">Желтые</div>
                <div className="font-pixel text-4xl text-[#F7B519]">{hud.score1}</div>
              </div>
              <div className="font-pixel text-2xl text-neutral-500">:</div>
              <div className="text-center">
                <div className="text-xs text-neutral-400 mb-1">Синие</div>
                <div className="font-pixel text-4xl text-[#3399FF]">{hud.score2}</div>
              </div>
            </div>

            {/* Match Statistics Table */}
            <div
              className="bg-neutral-900 border-2 border-black p-4 text-xs space-y-2"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              <div className="grid grid-cols-3 text-neutral-400 font-semibold pb-1 border-b border-neutral-800">
                <span className="text-left text-[#F7B519]">Игрок 1</span>
                <span className="text-center">Статистика</span>
                <span className="text-right text-[#3399FF]">
                  {gameMode === '2P' ? 'Игрок 2' : 'Бот'}
                </span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-left font-bold text-white">{hud.stats.shotsTeam1}</span>
                <span className="text-center text-neutral-400">Броски по кольцу</span>
                <span className="text-right font-bold text-white">{hud.stats.shotsTeam2}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-left font-bold text-white">{hud.stats.stealsTeam1}</span>
                <span className="text-center text-neutral-400">Перехваты мяча</span>
                <span className="text-right font-bold text-white">{hud.stats.stealsTeam2}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-left font-bold text-white">{hud.stats.blocksTeam1}</span>
                <span className="text-center text-neutral-400">Блок-шоты в прыжке</span>
                <span className="text-right font-bold text-white">{hud.stats.blocksTeam2}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => startNewMatch()}
                className="flex-1 py-4 px-6 bg-[#E52521] hover:bg-[#F43632] text-white font-pixel text-sm border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer whitespace-nowrap shrink-0"
              >
                РЕВАНШ (ENTER)
              </button>
              <button
                type="button"
                onClick={() => setScreenState('TITLE_SCREEN')}
                className="py-4 px-5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer whitespace-nowrap shrink-0"
              >
                Меню
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
