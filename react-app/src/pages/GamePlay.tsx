/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Trophy,
  Zap,
  Target,
  Crown,
  Monitor,
  Settings,
  Pause,
  Play,
  Volume2,
  VolumeX,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useRound } from "@/hooks/useRounds";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { InstructorDialog } from "@/components/InstructorDialog";
import { RewardedAdDialog } from "@/components/RewardedAdDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type:
    | "trash"
    | "bottle"
    | "can"
    | "tree"
    | "bus"
    | "car"
    | "building"
    | "lamp"
    | "plant-spot"
    | "bad-citizen";
  collected?: boolean;
  planted?: boolean;
  variant?: number; // For visual variety
  windowStates?: boolean[][]; // For building windows
  direction?: "left" | "right"; // For bad citizens
  targetX?: number; // For bad citizens movement
  targetY?: number; // For bad citizens movement
  alive?: boolean; // For bad citizens
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: "left" | "right";
  score: number;
  swordActive?: boolean;
  swordCooldown?: number;
}

type GameLevel = "easy" | "medium" | "hard";

// Mission instructions for different scenes and game modes
const CLEANUP_INSTRUCTIONS: Record<number, string[]> = {
  1: [
    "This is your moment to be a savvy eco-fighter! Give it all you have...",
    "Use arrow keys or WASD to move your character around the city.",
    "Collect ALL trash before time runs out! Press SPACE to use your sword!",
    "Eliminate bad citizens who throw trash back. Complete the mission to win!",
  ],
  2: [
    "Great job warrior! Ready for the next challenge?",
    "This time, you have less time. Stay focused and keep collecting!",
    "Use your sword (SPACE) to stop bad citizens from polluting. Collect all trash to win!",
  ],
  3: [
    "You're on fire! The planet needs heroes like you.",
    "Each scene gets tougher, but so do you!",
    "Show everyone who the real eco-champion is!",
  ],
};

const TREE_PLANTING_INSTRUCTIONS: Record<number, string[]> = {
  1: [
    "Welcome to the Tree Planting Challenge! Time to make the planet greener!",
    "Use arrow keys or WASD to move to planting spots marked on the ground.",
    "Plant ALL trees before time runs out! Press SPACE to use your sword!",
    "Bad citizens will cut down your trees - eliminate them with your sword!",
  ],
  2: [
    "Excellent work! Ready to plant more trees?",
    "The clock is ticking faster, but every tree counts!",
    "Protect your trees from bad citizens using your sword (SPACE)!",
  ],
  3: [
    "You're becoming a master tree planter!",
    "Speed and precision - that's what it takes!",
    "Complete all tree plantings to win the scene!",
  ],
};

const GamePlay = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<GameLevel>("medium");
  const [playerWon, setPlayerWon] = useState(false);
  const [gameMode, setGameMode] = useState<"cleanup" | "planting">("cleanup");

  // Multi-scene states
  const [currentScene, setCurrentScene] = useState(1);
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [showInstructor, setShowInstructor] = useState(true);
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  // Game control states
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Tree planting state - track which spot player is standing on and for how long
  const standingOnSpotRef = useRef<{
    spot: GameObject | null;
    startTime: number | null;
  }>({
    spot: null,
    startTime: null,
  });

  const { accountId } = useApp();
  const { mutate: updateProfile } = useUpdateProfile();
  const { data: roundMetadata } = useRound(roundId ? parseInt(roundId) : 1);
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number>();
  const isMobile = useIsMobile();

  // Game sounds using Web Audio API
  const playGameSound = (type: "collect" | "win" | "lose") => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case "collect":
          oscillator.frequency.value = 800;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.1
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
          break;
        case "win":
          // Victory fanfare
          oscillator.frequency.value = 523.25; // C5
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.4
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);

          // Add second note
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.value = 659.25; // E5
          osc2.type = "sine";
          gain2.gain.setValueAtTime(0.4, audioContext.currentTime + 0.15);
          gain2.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.55
          );
          osc2.start(audioContext.currentTime + 0.15);
          osc2.stop(audioContext.currentTime + 0.55);
          break;
        case "lose":
          // Sad trombone effect
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(
            200,
            audioContext.currentTime + 0.5
          );
          oscillator.type = "sawtooth";
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;
      }
    } catch (error) {
      console.error("Error playing game sound:", error);
    }
  };

  const playerRef = useRef<Player>({
    x: 100,
    y: 400,
    width: 40,
    height: 60,
    speed: 6,
    direction: "right",
    score: 0,
  });

  const objectsRef = useRef<GameObject[]>([]);
  const opponentTargetRef = useRef<GameObject | null>(null);
  const cactiPositionsRef = useRef<{ x: number; y: number }[]>([]);
  const badCitizensSpawnedRef = useRef(0);
  const nextBadSpawnAtRef = useRef(0);

  // Set game mode based on round type
  useEffect(() => {
    if (roundMetadata?.type === "tree-planting") {
      setGameMode("planting");
    } else {
      setGameMode("cleanup");
    }
  }, [roundMetadata]);

  // Get level-based settings (made easier with more items)
  const getLevelSettings = (level: GameLevel, scene: number = 1) => {
    // Base speed increases gradually with scene number
    // Scene 1: slower AI, Scene 2: medium, Scene 3+: progressively faster
    const sceneSpeedMultiplier = 0.5 + scene * 0.3; // Scene 1: 0.8x, Scene 2: 1.1x, Scene 3: 1.4x, etc.

    let baseSpeed: number;
    switch (level) {
      case "easy":
        baseSpeed = 1.5;
        return {
          opponentSpeed: baseSpeed * sceneSpeedMultiplier,
          itemCount: 50,
          timeLimit: 180,
        };
      case "medium":
        baseSpeed = 1.8;
        return {
          opponentSpeed: baseSpeed * sceneSpeedMultiplier,
          itemCount: 60,
          timeLimit: 150,
        };
      case "hard":
        baseSpeed = 2.2;
        return {
          opponentSpeed: baseSpeed * sceneSpeedMultiplier,
          itemCount: 70,
          timeLimit: 120,
        };
    }
  };

  // Initialize game objects
  useEffect(() => {
    const settings = getLevelSettings(selectedLevel, currentScene);
    const objects: GameObject[] = [];

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight - 60;
    const roadY = canvasHeight - 120;
    const safeZoneTop = 50;
    const safeZoneBottom = roadY - 50;

    if (gameMode === "cleanup") {
      // Add trash items using scattered grid to prevent overlapping
      const trashTypes = ["trash", "bottle", "can"];
      const oceanStartX = canvasWidth * 0.7; // Ocean region starts at 70% of canvas width

      // Calculate grid dimensions for scattered placement
      const cellSize = 70; // Size of each grid cell (larger than trash items)
      const availableWidth = canvasWidth - 100; // Account for margins
      const availableHeight = safeZoneBottom - safeZoneTop;
      const cols = Math.floor(availableWidth / cellSize);
      const rows = Math.floor(availableHeight / cellSize);

      // Create array of all possible grid cells
      const gridCells: { x: number; y: number; isOcean: boolean }[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cellX = 50 + col * cellSize;
          const cellY = safeZoneTop + row * cellSize;
          const isInOcean = cellX > oceanStartX;
          gridCells.push({ x: cellX, y: cellY, isOcean: isInOcean });
        }
      }

      // Shuffle grid cells for random placement
      for (let i = gridCells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gridCells[i], gridCells[j]] = [gridCells[j], gridCells[i]];
      }

      // Distribute trash items: 60% ocean, 40% city
      const oceanCount = Math.floor(settings.itemCount * 0.6);
      const cityCount = settings.itemCount - oceanCount;

      const oceanCells = gridCells
        .filter((cell) => cell.isOcean)
        .slice(0, oceanCount);
      const cityCells = gridCells
        .filter((cell) => !cell.isOcean)
        .slice(0, cityCount);
      const selectedCells = [...oceanCells, ...cityCells];

      // Place trash items in selected cells with random offset
      selectedCells.forEach((cell) => {
        const type = trashTypes[Math.floor(Math.random() * trashTypes.length)];
        const randomOffsetX = Math.random() * (cellSize - 40); // Leave margin within cell
        const randomOffsetY = Math.random() * (cellSize - 40);

        objects.push({
          x: cell.x + randomOffsetX,
          y: cell.y + randomOffsetY,
          width: 30,
          height: 30,
          type: type as "trash" | "bottle" | "can",
          collected: false,
          variant: Math.floor(Math.random() * 3),
        });
      });
    } else {
      // Add planting spots for tree planting mode - in grid format
      const cols = 10;
      const rows = Math.ceil(settings.itemCount / cols);
      const spacing = 80;
      const startX = (canvasWidth - cols * spacing) / 2;
      const startY = safeZoneTop + 50;

      let spotIndex = 0;
      for (let row = 0; row < rows && spotIndex < settings.itemCount; row++) {
        for (let col = 0; col < cols && spotIndex < settings.itemCount; col++) {
          objects.push({
            x: startX + col * spacing,
            y: startY + row * spacing,
            width: 40,
            height: 40,
            type: "plant-spot",
            planted: false,
            variant: Math.floor(Math.random() * 3),
          });
          spotIndex++;
        }
      }

      // Generate cactus positions once for tree planting
      cactiPositionsRef.current = [];
      for (let i = 0; i < 5; i++) {
        cactiPositionsRef.current.push({
          x: Math.random() * canvasWidth,
          y: canvasHeight - 150 + Math.random() * 50,
        });
      }
    }

    // Add city objects with pre-generated window states
    const generateWindowStates = (rows: number, cols: number) => {
      const states: boolean[][] = [];
      for (let row = 0; row < rows; row++) {
        states[row] = [];
        for (let col = 0; col < cols; col++) {
          states[row][col] = Math.random() > 0.3;
        }
      }
      return states;
    };

    const building1Rows = Math.floor(250 / 40);
    const building1Cols = Math.floor(120 / 40);
    const building2Rows = Math.floor(300 / 40);
    const building2Cols = Math.floor(120 / 40);
    const building3Rows = Math.floor(200 / 40);
    const building3Cols = Math.floor(120 / 40);

    const cityObjects = [
      { x: 200, y: 350, width: 100, height: 150, type: "tree" as const },
      { x: 500, y: 250, width: 150, height: 100, type: "bus" as const },
      {
        x: 800,
        y: 150,
        width: 120,
        height: 250,
        type: "building" as const,
        windowStates: generateWindowStates(building1Rows, building1Cols),
      },
      { x: 100, y: 200, width: 100, height: 150, type: "tree" as const },
      { x: 1100, y: 300, width: 100, height: 150, type: "tree" as const },
      {
        x: 1400,
        y: 280,
        width: 180,
        height: 90,
        type: "car" as const,
        variant: 0,
      },
      {
        x: 1700,
        y: 100,
        width: 120,
        height: 300,
        type: "building" as const,
        windowStates: generateWindowStates(building2Rows, building2Cols),
      },
      {
        x: 350,
        y: 100,
        width: 120,
        height: 200,
        type: "building" as const,
        windowStates: generateWindowStates(building3Rows, building3Cols),
      },
      { x: 1300, y: 150, width: 100, height: 150, type: "tree" as const },
      { x: 650, y: 400, width: 100, height: 150, type: "tree" as const },
      {
        x: 950,
        y: 290,
        width: 180,
        height: 90,
        type: "car" as const,
        variant: 1,
      },
      { x: 300, y: roadY - 200, width: 30, height: 80, type: "lamp" as const },
      { x: 700, y: roadY - 200, width: 30, height: 80, type: "lamp" as const },
      { x: 1200, y: roadY - 200, width: 30, height: 80, type: "lamp" as const },
      { x: 1600, y: roadY - 200, width: 30, height: 80, type: "lamp" as const },
    ];

    objects.push(...cityObjects);
    objectsRef.current = objects;
  }, [selectedLevel, gameMode, currentScene]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, isPaused]);

  // Handle game over
  useEffect(() => {
    if (gameOver && gameStarted) {
      // Check if player completed all tasks
      setPlayerWon(playerWon);

      if (playerWon) {
        // Win: accumulate XP and offer to continue to next scene
        const sceneXP = playerRef.current.score * 2;
        const winBonus = Math.floor(sceneXP * 0.5);
        const totalSceneXP = sceneXP + winBonus;

        setAccumulatedXP((prev) => prev + totalSceneXP);

        playGameSound("win");
        toast.success(
          `Victory! Earned ${totalSceneXP} XP! Total: ${
            accumulatedXP + totalSceneXP
          } XP`
        );
      } else {
        // Loss: play sound, UI will show options
        playGameSound("lose");
        toast.error("Time ran out! Mission failed.");
      }
    }
  }, [gameOver, gameStarted, accumulatedXP, playerWon]);

  // Check if all items collected/planted (runs every frame via game loop)
  const checkGameComplete = () => {
    if (!gameStarted || gameOver) return;

    if (gameMode === "cleanup") {
      const trashItems = objectsRef.current.filter(
        (obj) =>
          obj.type === "trash" || obj.type === "bottle" || obj.type === "can"
      );

      if (trashItems.length > 0 && trashItems.every((obj) => obj.collected)) {
        setGameOver(true);
        setPlayerWon(true);
        playGameSound("win");
        toast.success("All trash collected! Mission complete!");
      }
    } else {
      const plantSpots = objectsRef.current.filter(
        (obj) => obj.type === "plant-spot"
      );

      if (plantSpots.length > 0 && plantSpots.every((obj) => obj.planted)) {
        setGameOver(true);
        setPlayerWon(true);
        playGameSound("win");
        toast.success("All trees planted! Mission complete!");
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "a",
          "d",
          "w",
          "s",
        ].includes(e.key)
      ) {
        e.preventDefault();
        keysPressed.current.add(e.key.toLowerCase());
      }

      // Sword attack with space key
      if (
        e.key === " " &&
        !playerRef.current.swordActive &&
        !playerRef.current.swordCooldown
      ) {
        e.preventDefault();
        playerRef.current.swordActive = true;
        playerRef.current.swordCooldown = Date.now() + 500; // 500ms cooldown

        // Auto deactivate sword after 200ms
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.swordActive = false;
          }
        }, 200);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Cache gradients outside draw loop for performance
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(1, "#B0E0E6");

    const groundGradient = ctx.createLinearGradient(
      0,
      canvas.height - 100,
      0,
      canvas.height
    );
    groundGradient.addColorStop(0, "#5A8F5A");
    groundGradient.addColorStop(1, "#4A7F4A");

    const draw = () => {
      if (gameMode === "planting") {
        // Desert background for tree planting
        // Sky gradient
        const desertSkyGradient = ctx.createLinearGradient(
          0,
          0,
          0,
          canvas.height
        );
        desertSkyGradient.addColorStop(0, "#FFD89B");
        desertSkyGradient.addColorStop(1, "#FFAA66");
        ctx.fillStyle = desertSkyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sand ground
        const sandGradient = ctx.createLinearGradient(
          0,
          canvas.height - 150,
          0,
          canvas.height
        );
        sandGradient.addColorStop(0, "#F4C27A");
        sandGradient.addColorStop(1, "#D4A86A");
        ctx.fillStyle = sandGradient;
        ctx.fillRect(0, canvas.height - 150, canvas.width, 150);

        // Sand dunes pattern
        ctx.fillStyle = "rgba(212, 168, 106, 0.3)";
        for (let i = 0; i < canvas.width; i += 150) {
          ctx.beginPath();
          ctx.ellipse(i + 75, canvas.height - 120, 100, 30, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add some cacti in the background (use cached positions)
        ctx.fillStyle = "#2D5016";
        cactiPositionsRef.current.forEach((cactus) => {
          ctx.fillRect(cactus.x, cactus.y, 8, 30);
          ctx.fillRect(cactus.x - 10, cactus.y + 10, 10, 3);
          ctx.fillRect(cactus.x + 8, cactus.y + 10, 10, 3);
        });
      } else {
        // City and ocean background for cleanup
        // Sky gradient
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ocean region (right 30% of canvas)
        const oceanStartX = canvas.width * 0.7;
        const oceanGradient = ctx.createLinearGradient(
          oceanStartX,
          0,
          canvas.width,
          canvas.height
        );
        oceanGradient.addColorStop(0, "#4A90E2");
        oceanGradient.addColorStop(0.5, "#357ABD");
        oceanGradient.addColorStop(1, "#2E5C8A");
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(oceanStartX, 0, canvas.width - oceanStartX, canvas.height);

        // Waves in ocean
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const waveY = 100 + i * 80;
          for (let x = oceanStartX; x < canvas.width; x += 30) {
            const y = waveY + Math.sin((x + Date.now() / 500) * 0.05) * 10;
            if (x === oceanStartX) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        // Beach/shore area
        ctx.fillStyle = "#F4C27A";
        ctx.beginPath();
        ctx.moveTo(oceanStartX - 50, canvas.height - 120);
        ctx.lineTo(oceanStartX + 50, canvas.height - 120);
        ctx.lineTo(oceanStartX + 100, canvas.height);
        ctx.lineTo(oceanStartX - 100, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Ground with texture for city area
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, canvas.height - 100, oceanStartX, 100);

        // Draw road
        ctx.fillStyle = "#4A4A4A";
        ctx.fillRect(0, canvas.height - 120, oceanStartX, 20);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 10]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 110);
        ctx.lineTo(oceanStartX, canvas.height - 110);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw city objects (not collectibles - they will be drawn last)
      objectsRef.current.forEach((obj) => {
        // Skip collectibles for now - we'll draw them on top later
        if (
          obj.type === "trash" ||
          obj.type === "bottle" ||
          obj.type === "can" ||
          obj.type === "plant-spot"
        ) {
          return;
        }

        if (obj.type === "tree") {
          // Enhanced tree
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
          ctx.shadowBlur = 10;

          const trunkGradient = ctx.createLinearGradient(
            obj.x + 35,
            0,
            obj.x + 65,
            0
          );
          trunkGradient.addColorStop(0, "#654321");
          trunkGradient.addColorStop(1, "#8B4513");
          ctx.fillStyle = trunkGradient;
          ctx.fillRect(obj.x + 35, obj.y + 80, 30, 70);

          const foliageGradient = ctx.createRadialGradient(
            obj.x + 50,
            obj.y + 60,
            0,
            obj.x + 50,
            obj.y + 60,
            50
          );
          foliageGradient.addColorStop(0, "#32CD32");
          foliageGradient.addColorStop(1, "#228B22");
          ctx.fillStyle = foliageGradient;

          ctx.beginPath();
          ctx.arc(obj.x + 50, obj.y + 60, 50, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + 30, obj.y + 70, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + 70, obj.y + 70, 35, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (obj.type === "bus") {
          // Enhanced bus
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 8;

          const busGradient = ctx.createLinearGradient(
            obj.x,
            0,
            obj.x + obj.width,
            0
          );
          busGradient.addColorStop(0, "#FFD700");
          busGradient.addColorStop(1, "#FFA500");
          ctx.fillStyle = busGradient;
          ctx.fillRect(obj.x, obj.y + 20, obj.width, 60);
          ctx.strokeStyle = "#CC8800";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y + 20, obj.width, 60);

          ctx.fillStyle = "#87CEEB";
          ctx.fillRect(obj.x + 10, obj.y + 30, 30, 25);
          ctx.fillRect(obj.x + 50, obj.y + 30, 30, 25);
          ctx.fillRect(obj.x + 90, obj.y + 30, 30, 25);
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x + 10, obj.y + 30, 30, 25);
          ctx.strokeRect(obj.x + 50, obj.y + 30, 30, 25);
          ctx.strokeRect(obj.x + 90, obj.y + 30, 30, 25);

          const wheelGradient = ctx.createRadialGradient(
            obj.x + 30,
            obj.y + 80,
            0,
            obj.x + 30,
            obj.y + 80,
            12
          );
          wheelGradient.addColorStop(0, "#555");
          wheelGradient.addColorStop(1, "#222");
          ctx.fillStyle = wheelGradient;
          ctx.beginPath();
          ctx.arc(obj.x + 30, obj.y + 80, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + 120, obj.y + 80, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#AAA";
          ctx.beginPath();
          ctx.arc(obj.x + 30, obj.y + 80, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + 120, obj.y + 80, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (obj.type === "car") {
          // Car
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 8;

          const carColors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"];
          const carColor = carColors[obj.variant || 0];

          const carGradient = ctx.createLinearGradient(
            obj.x,
            0,
            obj.x + obj.width,
            0
          );
          carGradient.addColorStop(0, carColor);
          carGradient.addColorStop(1, carColor + "CC");
          ctx.fillStyle = carGradient;
          ctx.fillRect(obj.x, obj.y + 40, obj.width, 50);
          ctx.fillRect(obj.x + 30, obj.y + 10, obj.width - 60, 40);

          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y + 40, obj.width, 50);
          ctx.strokeRect(obj.x + 30, obj.y + 10, obj.width - 60, 40);

          ctx.fillStyle = "#87CEEB";
          ctx.fillRect(obj.x + 40, obj.y + 15, 40, 30);
          ctx.fillRect(obj.x + 100, obj.y + 15, 40, 30);

          const carWheelGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
          carWheelGradient.addColorStop(0, "#333");
          carWheelGradient.addColorStop(1, "#111");
          ctx.fillStyle = carWheelGradient;
          ctx.beginPath();
          ctx.arc(obj.x + 40, obj.y + 90, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(obj.x + 140, obj.y + 90, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (obj.type === "lamp") {
          // Street lamp
          ctx.save();
          ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
          ctx.shadowBlur = 20;

          ctx.fillStyle = "#4A5568";
          ctx.fillRect(obj.x + 12, obj.y + 20, 6, obj.height - 20);

          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(obj.x + 15, obj.y + 15, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFF9C4";
          ctx.beginPath();
          ctx.arc(obj.x + 15, obj.y + 15, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (obj.type === "building") {
          // Building
          ctx.save();
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 15;

          const buildingGradient = ctx.createLinearGradient(
            obj.x,
            0,
            obj.x + obj.width,
            0
          );
          buildingGradient.addColorStop(0, "#A0A0A0");
          buildingGradient.addColorStop(1, "#707070");
          ctx.fillStyle = buildingGradient;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = "#505050";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

          // Use pre-generated window states to prevent flickering
          const rows = Math.floor(obj.height / 40);
          const cols = Math.floor(obj.width / 40);
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const lightOn = obj.windowStates?.[row]?.[col] ?? false;
              ctx.fillStyle = lightOn ? "#FFD700" : "#4A4A4A";
              ctx.fillRect(
                obj.x + col * 40 + 10,
                obj.y + row * 40 + 10,
                20,
                25
              );
              ctx.strokeStyle = "#333";
              ctx.strokeRect(
                obj.x + col * 40 + 10,
                obj.y + row * 40 + 10,
                20,
                25
              );
            }
          }

          ctx.fillStyle = "#8B0000";
          ctx.beginPath();
          ctx.moveTo(obj.x - 10, obj.y);
          ctx.lineTo(obj.x + obj.width / 2, obj.y - 20);
          ctx.lineTo(obj.x + obj.width + 10, obj.y);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw collectibles LAST so they're always on top
      objectsRef.current.forEach((obj) => {
        if (obj.type === "plant-spot") {
          if (!obj.planted) {
            // Unplanted spot - faded and with progress ring
            ctx.save();
            ctx.globalAlpha = 0.5; // Make it faded
            ctx.shadowColor = "rgba(139, 69, 19, 0.3)";
            ctx.shadowBlur = 5;

            // Check if player is standing on this spot
            const isPlayerStanding = standingOnSpotRef.current.spot === obj;
            const progress =
              isPlayerStanding && standingOnSpotRef.current.startTime
                ? Math.min(
                    1,
                    (Date.now() - standingOnSpotRef.current.startTime) / 500
                  )
                : 0;

            // Soil circle - glow if player is standing
            if (isPlayerStanding && progress > 0) {
              ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
              ctx.shadowBlur = 15;
              ctx.globalAlpha = 0.5 + progress * 0.5; // Gradually become more visible
            }

            ctx.fillStyle = "#8B4513";
            ctx.beginPath();
            ctx.arc(
              obj.x + obj.width / 2,
              obj.y + obj.height / 2,
              obj.width / 2,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Progress ring
            if (isPlayerStanding && progress > 0) {
              ctx.globalAlpha = 1; // Full opacity for progress ring
              ctx.strokeStyle = "#22C55E";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                obj.width / 2 + 5,
                -Math.PI / 2,
                -Math.PI / 2 + Math.PI * 2 * progress
              );
              ctx.stroke();
              ctx.globalAlpha = 0.5 + progress * 0.5; // Restore for other elements
            }

            // Inner lighter circle
            ctx.fillStyle = "#A0522D";
            ctx.beginPath();
            ctx.arc(
              obj.x + obj.width / 2,
              obj.y + obj.height / 2,
              obj.width / 3,
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Planting icon
            ctx.fillStyle = "#228B22";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              "🌱",
              obj.x + obj.width / 2,
              obj.y + obj.height / 2 + 8
            );

            ctx.restore();
          } else {
            // Planted tree - fully visible and vibrant
            ctx.save();
            ctx.globalAlpha = 1; // Full opacity for planted trees
            ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
            ctx.shadowBlur = 10;

            const treeX = obj.x + obj.width / 2 - 50;
            const treeY = obj.y + obj.height / 2 - 75;

            const trunkGradient = ctx.createLinearGradient(
              treeX + 35,
              0,
              treeX + 65,
              0
            );
            trunkGradient.addColorStop(0, "#654321");
            trunkGradient.addColorStop(1, "#8B4513");
            ctx.fillStyle = trunkGradient;
            ctx.fillRect(treeX + 35, treeY + 80, 30, 70);

            const foliageGradient = ctx.createRadialGradient(
              treeX + 50,
              treeY + 60,
              0,
              treeX + 50,
              treeY + 60,
              50
            );
            foliageGradient.addColorStop(0, "#32CD32");
            foliageGradient.addColorStop(1, "#228B22");
            ctx.fillStyle = foliageGradient;

            ctx.beginPath();
            ctx.arc(treeX + 50, treeY + 60, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(treeX + 30, treeY + 70, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(treeX + 70, treeY + 70, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (
          (obj.type === "trash" ||
            obj.type === "bottle" ||
            obj.type === "can") &&
          !obj.collected
        ) {
          ctx.save();

          // Check if player is standing on this trash item
          const isPlayerStanding = standingOnSpotRef.current.spot === obj;
          const progress =
            isPlayerStanding && standingOnSpotRef.current.startTime
              ? Math.min(
                  1,
                  (Date.now() - standingOnSpotRef.current.startTime) / 500
                )
              : 0;

          // Make trash faded initially, more visible as player stands
          ctx.globalAlpha = 0.6 + progress * 0.4;

          // Add glow effect when collecting
          if (isPlayerStanding && progress > 0) {
            ctx.shadowColor = "rgba(34, 197, 94, 0.6)";
            ctx.shadowBlur = 15 * progress;
          } else {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 5;
          }

          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          if (obj.type === "trash") {
            // Trash bag
            ctx.fillStyle = "#FF6B35";
            ctx.beginPath();
            ctx.ellipse(
              obj.x + obj.width / 2,
              obj.y + obj.height / 2,
              obj.width / 2,
              obj.height / 2,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = "#D94E2A";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.fillStyle = "#FFF";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
              "🗑️",
              obj.x + obj.width / 2,
              obj.y + obj.height / 2 + 7
            );
          } else if (obj.type === "bottle") {
            // Bottle
            ctx.fillStyle =
              obj.variant === 0
                ? "#4A90E2"
                : obj.variant === 1
                ? "#22C55E"
                : "#F59E0B";
            ctx.fillRect(obj.x + 8, obj.y, 14, obj.height);
            ctx.fillRect(obj.x + 6, obj.y + 5, 18, obj.height - 10);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x + 6, obj.y + 5, 18, obj.height - 10);
            // Cap
            ctx.fillStyle = "#333";
            ctx.fillRect(obj.x + 8, obj.y - 3, 14, 5);
          } else if (obj.type === "can") {
            // Can
            ctx.fillStyle =
              obj.variant === 0
                ? "#EF4444"
                : obj.variant === 1
                ? "#3B82F6"
                : "#8B5CF6";
            ctx.fillRect(obj.x + 2, obj.y + 5, obj.width - 4, obj.height - 10);
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.strokeRect(
              obj.x + 2,
              obj.y + 5,
              obj.width - 4,
              obj.height - 10
            );
            // Top/bottom
            ctx.fillStyle = "#D1D5DB";
            ctx.fillRect(obj.x, obj.y + 3, obj.width, 4);
            ctx.fillRect(obj.x, obj.y + obj.height - 7, obj.width, 4);
          }

          ctx.restore();
        }
      });

      // Update bad citizens (including spawning)
      const player = playerRef.current;

      // Clear sword cooldown if expired
      if (player.swordCooldown && Date.now() > player.swordCooldown) {
        player.swordCooldown = undefined;
      }

      if (
        keysPressed.current.has("arrowleft") ||
        keysPressed.current.has("a")
      ) {
        player.x = Math.max(0, player.x - player.speed);
        player.direction = "left";
      }
      if (
        keysPressed.current.has("arrowright") ||
        keysPressed.current.has("d")
      ) {
        player.x = Math.min(
          canvas.width - player.width,
          player.x + player.speed
        );
        player.direction = "right";
      }
      if (keysPressed.current.has("arrowup") || keysPressed.current.has("w")) {
        player.y = Math.max(0, player.y - player.speed);
      }
      if (
        keysPressed.current.has("arrowdown") ||
        keysPressed.current.has("s")
      ) {
        player.y = Math.min(
          canvas.height - player.height - 120,
          player.y + player.speed
        );
      }

      // Spawn bad citizens: 2 active max, 10 total per scene
      const now = Date.now();
      const activeCitizens = objectsRef.current.filter(
        (o) => o.type === "bad-citizen" && o.alive
      ).length;
      if (
        now >= nextBadSpawnAtRef.current &&
        activeCitizens < 2 &&
        badCitizensSpawnedRef.current < 10
      ) {
        const sources = objectsRef.current.filter(
          (o) => o.type === "building" || o.type === "car" || o.type === "bus"
        );
        if (sources.length > 0) {
          const source = sources[Math.floor(Math.random() * sources.length)];
          let spawnX = source.x + source.width / 2 - 10;
          let spawnY = source.y + source.height - 5;
          if (source.type === "car" || source.type === "bus") {
            const side = Math.random() > 0.5 ? "left" : "right";
            spawnX =
              side === "left" ? source.x - 10 : source.x + source.width + 10;
            spawnY = source.y + source.height - 20;
          }

          objectsRef.current.push({
            x: spawnX,
            y: spawnY,
            width: 30,
            height: 45,
            type: "bad-citizen",
            direction: Math.random() > 0.5 ? "right" : "left",
            targetX: spawnX + (Math.random() * 200 - 100),
            targetY: spawnY - 50 + Math.random() * 100,
            alive: true,
            variant: badCitizensSpawnedRef.current % 2,
          });
          badCitizensSpawnedRef.current += 1;
          nextBadSpawnAtRef.current = now + 3000;
        } else {
          nextBadSpawnAtRef.current = now + 1000;
        }
      }

      // Update bad citizens movement and behavior
      objectsRef.current.forEach((obj) => {
        if (obj.type === "bad-citizen" && obj.alive) {
          // Move towards target
          if (obj.targetX !== undefined && obj.targetY !== undefined) {
            const dx = obj.targetX - obj.x;
            const dy = obj.targetY - obj.y;
            const distance = Math.hypot(dx, dy);

            if (distance < 10) {
              // Reached target, pick new random target
              obj.targetX = Math.random() * (canvas.width - 200) + 100;
              obj.targetY = Math.random() * (canvas.height - 200) + 50;
            } else {
              // Move towards target
              const speed = 1.5;
              obj.x += (dx / distance) * speed;
              obj.y += (dy / distance) * speed;
              obj.direction = dx > 0 ? "right" : "left";
            }
          }

          // Random pollution behavior (every ~3 seconds per citizen)
          if (Math.random() < 0.005) {
            if (gameMode === "cleanup") {
              // Throw trash back - find a collected trash nearby
              const collectedTrash = objectsRef.current.filter(
                (item) =>
                  (item.type === "trash" ||
                    item.type === "bottle" ||
                    item.type === "can") &&
                  item.collected &&
                  Math.hypot(item.x - obj.x, item.y - obj.y) < 200
              );

              if (collectedTrash.length > 0) {
                const randomTrash =
                  collectedTrash[
                    Math.floor(Math.random() * collectedTrash.length)
                  ];
                randomTrash.collected = false;
                toast.error("Bad citizen threw trash back!", {
                  duration: 1000,
                });
              }
            } else {
              // Cut down planted trees - find a planted tree nearby
              const plantedTrees = objectsRef.current.filter(
                (item) =>
                  item.type === "plant-spot" &&
                  item.planted &&
                  Math.hypot(item.x - obj.x, item.y - obj.y) < 200
              );

              if (plantedTrees.length > 0) {
                const randomTree =
                  plantedTrees[Math.floor(Math.random() * plantedTrees.length)];
                randomTree.planted = false;
                toast.error("Bad citizen cut down a tree!", { duration: 1000 });
              }
            }
          }
        }
      });

      // Check sword collision with bad citizens
      if (player.swordActive) {
        const swordReach = 50;
        const swordX =
          player.direction === "right"
            ? player.x + player.width
            : player.x - swordReach;
        const swordY = player.y + player.height / 2 - 10;

        objectsRef.current.forEach((obj) => {
          if (obj.type === "bad-citizen" && obj.alive) {
            // Check if sword hits citizen
            const hit =
              swordX < obj.x + obj.width &&
              swordX + swordReach > obj.x &&
              swordY < obj.y + obj.height &&
              swordY + 20 > obj.y;

            if (hit) {
              obj.alive = false;
              toast.success("Bad citizen eliminated! 🗡️", { duration: 1000 });
              playGameSound("collect");
            }
          }
        });
      }

      // Draw player character with better design (optimized)
      const drawCharacter = (
        char: Player,
        color: string,
        isPlayer: boolean
      ) => {
        // Reduce shadow operations for performance
        ctx.save();

        // Add dancing animation for winner when game is over
        let bounceOffset = 0;
        let armWave = 0;
        if (gameOver) {
          const isWinner = (isPlayer && playerWon) || (!isPlayer && !playerWon);
          if (isWinner) {
            const time = Date.now() / 150; // Fast bounce
            bounceOffset = Math.sin(time) * 8; // Bounce up and down
            armWave = Math.sin(time * 2) * 15; // Wave arms
          }
        }

        // Body (simplified for performance)
        ctx.fillStyle = color;
        ctx.fillRect(
          char.x,
          char.y + 20 + bounceOffset,
          char.width,
          char.height - 20
        );
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          char.x,
          char.y + 20 + bounceOffset,
          char.width,
          char.height - 20
        );

        // Head
        ctx.fillStyle = "#FFE4B5";
        ctx.beginPath();
        ctx.arc(
          char.x + char.width / 2,
          char.y + 15 + bounceOffset,
          15,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(
          char.x + char.width / 2 - 5,
          char.y + 12 + bounceOffset,
          2,
          0,
          Math.PI * 2
        );
        ctx.arc(
          char.x + char.width / 2 + 5,
          char.y + 12 + bounceOffset,
          2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Smile (bigger if winner)
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        const smileRadius =
          gameOver && ((isPlayer && playerWon) || (!isPlayer && !playerWon))
            ? 10
            : 8;
        ctx.arc(
          char.x + char.width / 2,
          char.y + 15 + bounceOffset,
          smileRadius,
          0,
          Math.PI,
          false
        );
        ctx.stroke();

        // Arms (with wave animation for winner)
        ctx.fillStyle = color;
        ctx.fillRect(char.x - 8, char.y + 30 + bounceOffset + armWave, 8, 20);
        ctx.fillRect(
          char.x + char.width,
          char.y + 30 + bounceOffset - armWave,
          8,
          20
        );
        ctx.strokeRect(char.x - 8, char.y + 30 + bounceOffset + armWave, 8, 20);
        ctx.strokeRect(
          char.x + char.width,
          char.y + 30 + bounceOffset - armWave,
          8,
          20
        );

        // Score label
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.strokeText(
          char.score.toString(),
          char.x + char.width / 2,
          char.y - 5 + bounceOffset
        );
        ctx.fillText(
          char.score.toString(),
          char.x + char.width / 2,
          char.y - 5 + bounceOffset
        );

        ctx.restore();
      };

      drawCharacter(player, "#00CED1", true);

      // Draw bad citizens
      objectsRef.current.forEach((obj) => {
        if (obj.type === "bad-citizen" && obj.alive) {
          ctx.save();

          // Smaller character for bad citizens
          const citizenColor = obj.variant === 0 ? "#8B4513" : "#696969";

          // Body
          ctx.fillStyle = citizenColor;
          ctx.fillRect(obj.x, obj.y + 15, obj.width, obj.height - 15);
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.strokeRect(obj.x, obj.y + 15, obj.width, obj.height - 15);

          // Head
          ctx.fillStyle = "#FFE4B5";
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + 10, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Angry eyes
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2 - 4, obj.y + 8, 2, 0, Math.PI * 2);
          ctx.arc(obj.x + obj.width / 2 + 4, obj.y + 8, 2, 0, Math.PI * 2);
          ctx.fill();

          // Frown
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(obj.x + obj.width / 2, obj.y + 14, 5, Math.PI, 0, true);
          ctx.stroke();

          // Arms
          ctx.fillStyle = citizenColor;
          ctx.fillRect(obj.x - 6, obj.y + 22, 6, 15);
          ctx.fillRect(obj.x + obj.width, obj.y + 22, 6, 15);
          ctx.strokeRect(obj.x - 6, obj.y + 22, 6, 15);
          ctx.strokeRect(obj.x + obj.width, obj.y + 22, 6, 15);

          // "Bad" label
          ctx.fillStyle = "#FF0000";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 2;
          ctx.font = "bold 10px Arial";
          ctx.textAlign = "center";
          ctx.strokeText("BAD", obj.x + obj.width / 2, obj.y - 3);
          ctx.fillText("BAD", obj.x + obj.width / 2, obj.y - 3);

          ctx.restore();
        }
      });

      // Draw sword when active
      if (player.swordActive) {
        ctx.save();
        const swordReach = 50;
        const swordX =
          player.direction === "right"
            ? player.x + player.width
            : player.x - swordReach;
        const swordY = player.y + player.height / 2 - 10;

        // Sword blade
        const swordGradient = ctx.createLinearGradient(
          swordX,
          swordY,
          swordX + swordReach,
          swordY
        );
        swordGradient.addColorStop(0, "#C0C0C0");
        swordGradient.addColorStop(1, "#E8E8E8");
        ctx.fillStyle = swordGradient;

        if (player.direction === "right") {
          // Sword pointing right
          ctx.beginPath();
          ctx.moveTo(swordX, swordY + 10);
          ctx.lineTo(swordX + swordReach - 10, swordY + 10);
          ctx.lineTo(swordX + swordReach, swordY + 5);
          ctx.lineTo(swordX + swordReach - 10, swordY);
          ctx.lineTo(swordX, swordY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#808080";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Sword pointing left
          ctx.beginPath();
          ctx.moveTo(swordX + swordReach, swordY + 10);
          ctx.lineTo(swordX + 10, swordY + 10);
          ctx.lineTo(swordX, swordY + 5);
          ctx.lineTo(swordX + 10, swordY);
          ctx.lineTo(swordX + swordReach, swordY);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "#808080";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Sword glow effect
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 10;

        ctx.restore();
      }

      // Check collision for both player and opponent
      objectsRef.current.forEach((obj) => {
        const isTargetType =
          gameMode === "cleanup"
            ? (obj.type === "trash" ||
                obj.type === "bottle" ||
                obj.type === "can") &&
              !obj.collected
            : obj.type === "plant-spot" && !obj.planted;

        if (isTargetType) {
          // Player collision
          const playerColliding =
            player.x < obj.x + obj.width &&
            player.x + player.width > obj.x &&
            player.y < obj.y + obj.height &&
            player.y + player.height > obj.y;

          if (playerColliding) {
            if (gameMode === "cleanup") {
              // Cleanup: need to stand for 500ms
              const now = Date.now();

              if (standingOnSpotRef.current.spot === obj) {
                // Still standing on same spot
                if (
                  standingOnSpotRef.current.startTime &&
                  now - standingOnSpotRef.current.startTime >= 500
                ) {
                  // 500ms elapsed - collect the trash!
                  obj.collected = true;
                  toast.success("+1 Trash!", { duration: 800 });
                  player.score += 1;
                  setScore((prev) => prev + 1);
                  playGameSound("collect");

                  // Reset standing state
                  standingOnSpotRef.current = { spot: null, startTime: null };
                }
              } else {
                // Just arrived at this spot
                standingOnSpotRef.current = { spot: obj, startTime: now };
              }
            } else {
              // Tree planting: need to stand for 500ms
              const now = Date.now();

              if (standingOnSpotRef.current.spot === obj) {
                // Still standing on same spot
                if (
                  standingOnSpotRef.current.startTime &&
                  now - standingOnSpotRef.current.startTime >= 500
                ) {
                  // 500ms elapsed - plant the tree!
                  obj.planted = true;
                  toast.success("+1 Tree Planted! 🌳", { duration: 800 });
                  player.score += 1;
                  setScore((prev) => prev + 1);
                  playGameSound("collect");

                  // Reset standing state
                  standingOnSpotRef.current = { spot: null, startTime: null };
                }
              } else {
                // Just arrived at this spot
                standingOnSpotRef.current = { spot: obj, startTime: now };
              }
            }
          } else {
            // Not colliding with this spot - reset if it was the standing spot
            if (standingOnSpotRef.current.spot === obj) {
              standingOnSpotRef.current = { spot: null, startTime: null };
            }
          }
        }
      });

      // Check if game is complete (all items collected/planted)
      checkGameComplete();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, selectedLevel, gameMode, isPaused]);

  const startGame = () => {
    const settings = getLevelSettings(selectedLevel, currentScene);
    setGameStarted(true);
    setScore(0);
    setTimeLeft(settings.timeLimit);
    setGameOver(false);
    setPlayerWon(false);

    playerRef.current = {
      x: 100,
      y: window.innerHeight / 2,
      width: 40,
      height: 60,
      speed: 6,
      direction: "right",
      score: 0,
      swordActive: false,
      swordCooldown: undefined,
    };

    opponentTargetRef.current = null;

    // Reset spawn system
    badCitizensSpawnedRef.current = 0;
    nextBadSpawnAtRef.current = 0;

    // Reset all collectible/plantable items and bad citizens
    objectsRef.current.forEach((obj) => {
      if (obj.type === "trash" || obj.type === "bottle" || obj.type === "can") {
        obj.collected = false;
      }
      if (obj.type === "plant-spot") {
        obj.planted = false;
      }
      if (obj.type === "bad-citizen") {
        obj.alive = true;
      }
    });
  };

  const handleExitClick = () => {
    // Always show confirmation when trying to exit
    setShowExitConfirm(true);
  };

  const handleExit = () => {
    // Claim any accumulated XP before exiting
    if (accumulatedXP > 0 && accountId) {
      updateProfile({
        accountId,
        updates: {
          total_xp: accumulatedXP,
        },
      });
      toast.success(`Claimed ${accumulatedXP} XP!`);
    }
    navigate(`/app/${roundId}`);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    handleExit();
  };

  const handleInstructorComplete = () => {
    setShowInstructor(false);
    startGame();
  };

  const handleWatchAd = () => {
    // Award bonus XP for watching ad and progress to next scene
    const adBonusXP = 50; // Bonus XP for watching ad
    setAccumulatedXP((prev) => prev + adBonusXP);

    toast.success(
      `+${adBonusXP} XP for watching ad! Continuing to next scene...`,
      {
        duration: 3000,
      }
    );

    // Progress to next scene
    setShowRewardedAd(false);
    setCurrentScene((prev) => prev + 1);
    setGameOver(false);
    setGameStarted(false);
    setShowInstructor(true);
  };

  const handleClaimXP = () => {
    // Claim accumulated XP and exit
    if (accumulatedXP > 0 && accountId) {
      updateProfile({
        accountId,
        updates: {
          total_xp: accumulatedXP,
        },
      });
      toast.success(`Claimed ${accumulatedXP} XP!`);
    }
    navigate(`/app/${roundId}`);
  };

  const handleNextScene = () => {
    // Continue to next scene after winning
    setCurrentScene((prev) => prev + 1);
    setGameOver(false);
    setGameStarted(false);
    setShowInstructor(true);
  };

  const getCurrentInstructions = () => {
    // Use appropriate instructions based on game mode
    const sceneKey = currentScene > 3 ? 3 : currentScene;
    const instructions =
      gameMode === "planting"
        ? TREE_PLANTING_INSTRUCTIONS
        : CLEANUP_INSTRUCTIONS;
    return instructions[sceneKey] || instructions[1];
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleQuitGame = () => {
    setShowSettings(false);
    handleExit();
  };

  // Show mobile restriction
  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="p-8 text-center max-w-md">
          <Monitor className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4">Desktop Only</h2>
          <p className="text-muted-foreground mb-6">
            The game requires a larger screen for the best experience. Please
            play on a desktop or laptop computer.
          </p>
          <Button onClick={() => navigate("/app/1")} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      {/* Header with score and time */}
      <div className="glass border-b px-4 py-2 flex items-center justify-between z-10">
        <Button variant="ghost" size="sm" onClick={handleExitClick}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit
        </Button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-full">
            <span className="text-sm font-medium">You</span>
            <Trophy className="w-5 h-5 text-accent" />
            <span className="font-bold text-xl">{score}</span>
          </div>

          <Badge variant="secondary" className="mt-1 text-xs">
            Scene #{currentScene}
          </Badge>

          <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {selectedLevel}
          </Badge>
          {accumulatedXP > 0 && (
            <Badge className="bg-accent text-white">{accumulatedXP} XP</Badge>
          )}

          {/* Game Controls */}
          {gameStarted && !gameOver && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePauseToggle}
                className="ml-2"
              >
                {isPaused ? (
                  <Play className="w-4 h-4" />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Full Screen Game Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight - 60}
          className="w-full h-full"
        />

        {/* Round Location Overlay - Bottom Right */}
        {roundMetadata && gameStarted && !gameOver && (
          <div className="absolute bottom-6 right-6 z-10 max-w-xs animate-fade-in">
            <Card className="bg-background/95 backdrop-blur-sm border-border shadow-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">
                    {roundMetadata.location.name}
                  </h3>
                  {roundMetadata.location.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {roundMetadata.location.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="capitalize">{roundMetadata.type}</span>
                    <span>•</span>
                    <span>Round #{roundMetadata.id}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="p-8 text-center max-w-lg">
              <h2 className="text-4xl font-bold mb-4 text-gradient-gaming">
                {gameMode === "cleanup"
                  ? "Trash Cleanup Race!"
                  : "Tree Planting Challenge!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {gameMode === "cleanup"
                  ? "Race against the AI to collect more trash! Use arrow keys or WASD to move. Collect more trash than your opponent to win bonus XP!"
                  : "Race against the AI to plant more trees! Use arrow keys or WASD to move. Plant more trees than your opponent to win bonus XP!"}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Select Difficulty:
                </label>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant={selectedLevel === "easy" ? "default" : "outline"}
                    onClick={() => setSelectedLevel("easy")}
                    className="flex-1"
                  >
                    Easy
                  </Button>
                  <Button
                    variant={selectedLevel === "medium" ? "default" : "outline"}
                    onClick={() => setSelectedLevel("medium")}
                    className="flex-1"
                  >
                    Medium
                  </Button>
                  <Button
                    variant={selectedLevel === "hard" ? "default" : "outline"}
                    onClick={() => setSelectedLevel("hard")}
                    className="flex-1"
                  >
                    Hard
                  </Button>
                </div>
              </div>

              <Button onClick={startGame} size="lg" className="gap-2 w-full">
                <Zap className="w-5 h-5" />
                Start Game
              </Button>
            </Card>
          </div>
        )}

        {gameOver && !showRewardedAd && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="p-8 text-center max-w-lg">
              {playerWon ? (
                <>
                  <Crown className="w-20 h-20 mx-auto mb-4 text-yellow-500 animate-bounce" />
                  <h2 className="text-4xl font-bold mb-4 text-gradient-gaming">
                    Victory!
                  </h2>
                  <p className="text-xl mb-4">You defeated the AI opponent!</p>
                  <p className="text-muted-foreground mb-4">
                    Scene #{currentScene} Complete! 🎉
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-4 text-6xl">😢</div>
                  <h2 className="text-4xl font-bold mb-4 text-destructive">
                    Mission Failed!
                  </h2>
                  <p className="text-xl mb-4">
                    The AI collected more this time!
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Don't give up! Watch an ad to continue or claim your XP.
                  </p>
                </>
              )}

              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-3xl font-bold text-accent">
                  {playerRef.current.score}
                </p>
              </div>

              {playerWon ? (
                <>
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Scene XP
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      +
                      {playerRef.current.score * 2 +
                        Math.floor(playerRef.current.score * 2 * 0.5)}{" "}
                      XP
                    </p>
                    <p className="text-sm text-accent mt-1">
                      (Includes 50% win bonus!)
                    </p>
                  </div>

                  <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Accumulated XP
                    </p>
                    <p className="text-3xl font-bold text-accent">
                      {accumulatedXP} XP
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleNextScene}
                      size="lg"
                      className="flex-1 bg-gradient-primary"
                    >
                      Next Scene
                    </Button>
                    <Button
                      onClick={handleClaimXP}
                      size="lg"
                      variant="outline"
                      className="flex-1"
                    >
                      Claim & Exit
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {accumulatedXP > 0 && (
                    <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-sm text-muted-foreground mb-1">
                        Accumulated XP
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {accumulatedXP} XP
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setShowRewardedAd(true)}
                      size="lg"
                      className="flex-1 bg-gradient-primary"
                    >
                      Watch Ad to Continue
                    </Button>
                    <Button
                      onClick={handleClaimXP}
                      size="lg"
                      variant="outline"
                      className="flex-1"
                    >
                      Claim XP & Exit
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <Card className="p-8 text-center">
              <Pause className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4">Game Paused</h2>
              <p className="text-muted-foreground mb-6">
                Press pause button or close settings to resume
              </p>
              <Button onClick={handlePauseToggle} size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Resume Game
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Game Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-primary" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="text-base font-medium">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    {soundEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <Button
                variant={soundEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? "On" : "Off"}
              </Button>
            </div>

            {/* Quit Game */}
            <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-destructive" />
                <div>
                  <Label className="text-base font-medium">Quit Game</Label>
                  <p className="text-sm text-muted-foreground">
                    Exit and claim accumulated XP
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleQuitGame}>
                Quit
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowSettings(false)}
              className="flex-1"
              variant="outline"
            >
              Close
            </Button>
            {isPaused ? (
              <Button
                onClick={() => {
                  setShowSettings(false);
                  setIsPaused(false);
                }}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setShowSettings(false);
                }}
                className="flex-1"
              >
                Continue
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructor Dialog */}
      <InstructorDialog
        open={showInstructor && !gameStarted}
        instructions={getCurrentInstructions()}
        sceneNumber={currentScene}
        onComplete={handleInstructorComplete}
        onExit={handleExitClick}
      />

      {/* Rewarded Ad Dialog (shown on loss) */}
      <RewardedAdDialog
        open={showRewardedAd}
        onWatchAd={handleWatchAd}
        onClaimXP={handleClaimXP}
        accumulatedXP={accumulatedXP}
      />

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-destructive" />
              Exit Game?
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground mb-4">
              {gameStarted && !gameOver
                ? "Are you sure you want to exit? Your current game progress will be lost."
                : "Are you sure you want to exit?"}
            </p>

            {accumulatedXP > 0 && (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/30 mb-4">
                <p className="text-sm text-muted-foreground mb-1">
                  Accumulated XP
                </p>
                <p className="text-2xl font-bold text-accent">
                  {accumulatedXP} XP
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This XP will be claimed when you exit
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowExitConfirm(false)}
              className="flex-1"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExit}
              className="flex-1"
              variant="destructive"
            >
              Exit Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamePlay;
