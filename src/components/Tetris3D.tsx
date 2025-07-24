import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";

// Tetris game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// Initialize board
const createBoard = (): Board => {
	const newBoard = Array.from(Array(BOARD_HEIGHT), () =>
		Array(BOARD_WIDTH).fill(EMPTY_CELL),
	);
	return newBoard;
};

// Tetromino shapes and colors
const TETROMINOES = {
	I: {
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		color: "#00bcd4",
	},
	J: {
		shape: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "#2196f3",
	},
	L: {
		shape: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "#ff9800",
	},
	O: {
		shape: [
			[1, 1],
			[1, 1],
		],
		color: "#ffeb3b",
	},
	S: {
		shape: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		color: "#4caf50",
	},
	T: {
		shape: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "#9c27b0",
	},
	Z: {
		shape: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		color: "#f44336",
	},
};

const TETROMINO_NAMES = Object.keys(
	TETROMINOES,
) as (keyof typeof TETROMINOES)[];

type BoardCell = number | keyof typeof TETROMINOES;
type Board = BoardCell[][];
type Position = { x: number; y: number };
type Tetromino = keyof typeof TETROMINOES;

interface Player {
	pos: Position;
	tetromino: Tetromino | null;
	collided: boolean;
}

export function Tetris3D({ position }: { position: [number, number, number] }) {
	const [board, setBoard] = useState<Board>(() => createBoard());
	const [player, setPlayer] = useState<Player>({
		pos: { x: 0, y: 0 },
		tetromino: null,
		collided: false,
	});
	const [nextTetromino, setNextTetromino] = useState<Tetromino>("I");
	const [_score, setScore] = useState(0);
	const [level, setLevel] = useState(1);
	const [lines, setLines] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const groupRef = useRef<THREE.Group>(null);
	const dropTimeRef = useRef<number>(1000);
	const lastDropRef = useRef<number>(0);

	// Random tetromino
	const randomTetromino = useCallback((): Tetromino => {
		const rand = Math.floor(Math.random() * TETROMINO_NAMES.length);
		return TETROMINO_NAMES[rand];
	}, []);

	// Reset player
	const resetPlayer = useCallback(() => {
		const tetromino = nextTetromino;
		setNextTetromino(randomTetromino());

		setPlayer({
			pos: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
			tetromino,
			collided: false,
		});
	}, [nextTetromino, randomTetromino]);

	// Check collision
	const checkCollision = useCallback(
		(player: Player, board: Board, moveX = 0, moveY = 0): boolean => {
			if (!player.tetromino) return true;

			const { tetromino, pos } = player;
			const shape = TETROMINOES[tetromino].shape;

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					// Check if we're on a tetromino cell
					if (shape[y][x] !== 0) {
						const newY = y + pos.y + moveY;
						const newX = x + pos.x + moveX;

						// Check if movement is within game area
						if (
							newY >= BOARD_HEIGHT || // Below bottom
							newX < 0 || // Left of left wall
							newX >= BOARD_WIDTH || // Right of right wall
							newY < 0 || // Above top (shouldn't happen)
							(newY >= 0 && board[newY] && board[newY][newX] !== EMPTY_CELL) // Collided with placed tetromino
						) {
							return true;
						}
					}
				}
			}

			return false;
		},
		[],
	);

	// Update board
	const updateBoard = useCallback(
		(prevBoard: Board, playerPos: Position, playerTetromino: Tetromino | null): Board => {
			// Create a copy of the board
			const board = prevBoard.map((row) => [...row]);

			if (!playerTetromino) return board;

			// Draw the tetromino
			const shape = TETROMINOES[playerTetromino].shape;
			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] !== 0) {
						const boardY = y + playerPos.y;
						const boardX = x + playerPos.x;

						// Check if we're on the board
						if (
							boardY >= 0 &&
							boardY < BOARD_HEIGHT &&
							boardX >= 0 &&
							boardX < BOARD_WIDTH
						) {
							board[boardY][boardX] = playerTetromino;
						}
					}
				}
			}

			return board;
		},
		[],
	);

	// Sweep rows
	const sweepRows = useCallback(
		(board: Board): Board => {
			let rowsCleared = 0;
			const newBoard = [...board];

			for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
				// Check if row is filled
				if (newBoard[y].every((cell) => cell !== EMPTY_CELL)) {
					// Remove the row
					const removedRow = newBoard.splice(y, 1)[0].fill(EMPTY_CELL);
					// Add empty row at the top
					newBoard.unshift(removedRow);
					rowsCleared++;
					y++; // Recheck the same row index since we removed a row
				}
			}

			if (rowsCleared > 0) {
				// Update score: more points for clearing multiple rows at once
				const points = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 rows
				setScore((prev) => prev + points[Math.min(rowsCleared - 1, 3)] * level);
				setLines((prev) => prev + rowsCleared);

				// Level up every 10 lines
				const newLevel = Math.floor((lines + rowsCleared) / 10) + 1;
				if (newLevel > level) {
					setLevel(newLevel);
					// Speed up the game
					dropTimeRef.current = Math.max(100, 1000 - (newLevel - 1) * 100);
				}
			}

			return newBoard;
		},
		[level, lines],
	);

	// Move player
	const movePlayer = useCallback(
		(dirX: number, dirY: number) => {
			if (gameOver || !player.tetromino || isPaused) return;

			if (!checkCollision(player, board, dirX, dirY)) {
				setPlayer((prev) => ({
					...prev,
					pos: {
						x: prev.pos.x + dirX,
						y: prev.pos.y + dirY,
					},
				}));
			} else if (dirY > 0) {
				// Collision moving down means we've landed
				setPlayer((prev) => ({ ...prev, collided: true }));
			}
		},
		[gameOver, player, isPaused, checkCollision, board],
	);

	// Rotate player
	const rotatePlayer = useCallback(() => {
		if (gameOver || !player.tetromino || isPaused) return;

		const clonedPlayer = JSON.parse(JSON.stringify(player));
		if (clonedPlayer.tetromino) {
			// Simple rotation for now
			const shape = TETROMINOES[clonedPlayer.tetromino].shape;
			const rotatedShape = shape[0].map((_, index) =>
				shape.map((row) => row[index]).reverse(),
			);

			// Temporarily update shape for collision check
			const originalShape = TETROMINOES[clonedPlayer.tetromino].shape;
			TETROMINOES[clonedPlayer.tetromino].shape = rotatedShape;

			if (!checkCollision(clonedPlayer, board)) {
				setPlayer(clonedPlayer);
			} else {
				// Revert if collision
				TETROMINOES[clonedPlayer.tetromino].shape = originalShape;
			}
		}
	}, [gameOver, player, isPaused, checkCollision, board]);

	// Hard drop
	const hardDrop = useCallback(() => {
		if (gameOver || !player.tetromino || isPaused) return;

		let newY = player.pos.y;
		while (!checkCollision(player, board, 0, newY - player.pos.y + 1)) {
			newY++;
		}

		setPlayer((prev) => ({
			...prev,
			pos: { ...prev.pos, y: newY },
			collided: true,
		}));
	}, [gameOver, player, isPaused, checkCollision, board]);

	// Start game
	const startGame = useCallback(() => {
		// Reset everything
		const newBoard = createBoard();
		setBoard(newBoard);
		setScore(0);
		setLevel(1);
		setLines(0);
		setGameOver(false);
		setIsPaused(false);
		setGameStarted(true);
		dropTimeRef.current = 1000;
		lastDropRef.current = performance.now();

		// Set initial tetrominoes
		const firstTetromino = randomTetromino();
		setNextTetromino(randomTetromino());

		setPlayer({
			pos: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
			tetromino: firstTetromino,
			collided: false,
		});
	}, [randomTetromino]);

	// Game logic in animation frame
	useFrame(() => {
		if (!gameStarted || gameOver || isPaused) return;

		const now = performance.now();
		if (now - lastDropRef.current > dropTimeRef.current) {
			movePlayer(0, 1);
			lastDropRef.current = now;
		}
	});

	// Handle collision
	useEffect(() => {
		if (player.collided) {
			const newBoard = updateBoard(board, player.pos, player.tetromino);
			const sweptBoard = sweepRows(newBoard);
			setBoard(sweptBoard);

			// Get the next tetromino that will spawn
			const nextPlayerPos = { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 };
			
			// Check if the next piece would collide immediately (game over)
			if (checkCollision({ pos: nextPlayerPos, tetromino: nextTetromino, collided: false }, sweptBoard)) {
				setGameOver(true);
				setGameStarted(false);
			} else {
				// Only reset player if game is not over
				resetPlayer();
			}
		}
	}, [
		player.collided,
		board,
		updateBoard,
		sweepRows,
		resetPlayer,
		player.pos,
		player.tetromino,
		checkCollision,
		nextTetromino,
	]);

	// Initialize board
	useEffect(() => {
		setBoard(createBoard());
	}, []);

	// Handle keyboard controls
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Handle start game with 'T' key when game hasn't started or is over
			if ((!gameStarted || gameOver) && e.key.toLowerCase() === "t") {
				startGame();
				return;
			}

			if (!gameStarted || gameOver) return;

			switch (e.key) {
				case "ArrowLeft":
					movePlayer(-1, 0);
					break;
				case "ArrowRight":
					movePlayer(1, 0);
					break;
				case "ArrowDown":
					movePlayer(0, 1);
					break;
				case "ArrowUp":
					rotatePlayer();
					break;
				case " ":
					hardDrop();
					break;
				case "p":
				case "P":
					setIsPaused((prev) => !prev);
					break;
				default:
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [gameStarted, gameOver, movePlayer, rotatePlayer, hardDrop, startGame]);

	// Render board cells in 3D
	const renderBoardCells = () => {
		const cells = [];

		// Render static board cells
		for (let y = 0; y < BOARD_HEIGHT; y++) {
			for (let x = 0; x < BOARD_WIDTH; x++) {
				const cell = board[y][x];
				if (
					cell !== EMPTY_CELL &&
					typeof cell === "string" &&
					cell in TETROMINOES
				) {
					const tetromino = TETROMINOES[cell as Tetromino];
					cells.push(
						<mesh
							key={`static-${x}-${y}`}
							position={[
								x - BOARD_WIDTH / 2 + 0.5,
								BOARD_HEIGHT / 2 - y - 0.5,
								0,
							]}
							castShadow
							receiveShadow
						>
							<boxGeometry args={[0.9, 0.9, 0.9]} />
							<meshStandardMaterial
								color={tetromino.color}
								metalness={0.3}
								roughness={0.4}
							/>
						</mesh>,
					);
				}
			}
		}

		// Render current falling tetromino
		if (player.tetromino) {
			const shape = TETROMINOES[player.tetromino].shape;
			const color = TETROMINOES[player.tetromino].color;

			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] !== 0) {
						cells.push(
							<mesh
								key={`falling-${x}-${y}`}
								position={[
									player.pos.x + x - BOARD_WIDTH / 2 + 0.5,
									BOARD_HEIGHT / 2 - (player.pos.y + y) - 0.5,
									0.5,
								]}
								castShadow
							>
								<boxGeometry args={[0.9, 0.9, 0.9]} />
								<meshStandardMaterial
									color={color}
									metalness={0.5}
									roughness={0.2}
								/>
							</mesh>,
						);
					}
				}
			}
		}

		return cells;
	};

	// Render next tetromino preview
	const renderNextTetromino = () => {
		if (!nextTetromino) return null;

		const tetromino = TETROMINOES[nextTetromino];
		const shape = tetromino.shape;
		const cells = [];

		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (shape[y][x] !== 0) {
					cells.push(
						<mesh
							key={`next-${x}-${y}`}
							position={[
								x - shape[0].length / 2 + 0.5,
								shape.length / 2 - y - 0.5,
								0,
							]}
							castShadow
						>
							<boxGeometry args={[0.4, 0.4, 0.4]} />
							<meshStandardMaterial
								color={tetromino.color}
								metalness={0.5}
								roughness={0.2}
							/>
						</mesh>,
					);
				}
			}
		}

		return cells;
	};

	return (
		<group position={position} ref={groupRef}>
			{/* Game board container */}
			<mesh position={[0, 0, -1]}>
				<boxGeometry args={[BOARD_WIDTH + 2, BOARD_HEIGHT + 2, 2]} />
				<meshStandardMaterial
					color="#1e3a8a"
					transparent
					opacity={0.3}
					metalness={0.1}
					roughness={0.7}
				/>
			</mesh>

			{/* Game board grid */}
			{renderBoardCells()}

			{/* Game info panel */}
			<group position={[BOARD_WIDTH / 2 + 3, BOARD_HEIGHT / 2 - 2, 0]}>
				<mesh position={[0, 2, 0]}>
					<boxGeometry args={[3, 1, 0.5]} />
					<meshStandardMaterial
						color="#3b82f6"
						metalness={0.3}
						roughness={0.4}
					/>
				</mesh>
				<mesh position={[0, 0, 0]}>
					<boxGeometry args={[3, 1, 0.5]} />
					<meshStandardMaterial
						color="#3b82f6"
						metalness={0.3}
						roughness={0.4}
					/>
				</mesh>
				<mesh position={[0, -2, 0]}>
					<boxGeometry args={[3, 1, 0.5]} />
					<meshStandardMaterial
						color="#3b82f6"
						metalness={0.3}
						roughness={0.4}
					/>
				</mesh>

				{/* Next tetromino preview container */}
				<mesh position={[0, -4, 0]}>
					<boxGeometry args={[3, 3, 0.5]} />
					<meshStandardMaterial
						color="#3b82f6"
						metalness={0.3}
						roughness={0.4}
					/>
				</mesh>

				{/* Next tetromino pieces */}
				<group position={[0, -4, 0.3]}>{renderNextTetromino()}</group>
			</group>

			{/* Start button */}
			{!gameStarted && !gameOver && (
				<mesh
					position={[0, -BOARD_HEIGHT / 2 - 2, 0]}
					onClick={startGame}
					onPointerOver={(e) => e.stopPropagation()}
				>
					<boxGeometry args={[4, 1, 0.5]} />
					<meshStandardMaterial
						color="#10b981"
						metalness={0.5}
						roughness={0.2}
					/>
				</mesh>
			)}

			{/* Game over indicator */}
			{gameOver && (
				<mesh position={[0, 0, 2]}>
					<boxGeometry args={[8, 2, 0.5]} />
					<meshStandardMaterial
						color="#ef4444"
						emissive="#ef4444"
						emissiveIntensity={0.5}
						metalness={0.5}
						roughness={0.2}
					/>
				</mesh>
			)}
		</group>
	);
}
