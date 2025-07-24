import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// Tetris game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

// Tetromino shapes and 3D colors
const TETROMINOES = {
	I: {
		shape: [
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		color: "bg-cyan-400",
		border: "border-cyan-600",
		shadow: "shadow-cyan-900/50",
	},
	J: {
		shape: [
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "bg-blue-500",
		border: "border-blue-700",
		shadow: "shadow-blue-900/50",
	},
	L: {
		shape: [
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "bg-orange-500",
		border: "border-orange-700",
		shadow: "shadow-orange-900/50",
	},
	O: {
		shape: [
			[1, 1],
			[1, 1],
		],
		color: "bg-yellow-400",
		border: "border-yellow-600",
		shadow: "shadow-yellow-900/50",
	},
	S: {
		shape: [
			[0, 1, 1],
			[1, 1, 0],
			[0, 0, 0],
		],
		color: "bg-green-500",
		border: "border-green-700",
		shadow: "shadow-green-900/50",
	},
	T: {
		shape: [
			[0, 1, 0],
			[1, 1, 1],
			[0, 0, 0],
		],
		color: "bg-purple-500",
		border: "border-purple-700",
		shadow: "shadow-purple-900/50",
	},
	Z: {
		shape: [
			[1, 1, 0],
			[0, 1, 1],
			[0, 0, 0],
		],
		color: "bg-red-500",
		border: "border-red-700",
		shadow: "shadow-red-900/50",
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

export function TetrisGame() {
	const [board, setBoard] = useState<Board>([]);
	const [player, setPlayer] = useState<Player>({
		pos: { x: 0, y: 0 },
		tetromino: null,
		collided: false,
	});
	const [nextTetromino, setNextTetromino] = useState<Tetromino>("I");
	const [score, setScore] = useState(0);
	const [level, setLevel] = useState(1);
	const [lines, setLines] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
	const dropTimeRef = useRef<number>(1000);
	const [dropStart, setDropStart] = useState<number>(0);

	// Initialize board
	const createBoard = useCallback((): Board => {
		const newBoard = Array.from(Array(BOARD_HEIGHT), () =>
			Array(BOARD_WIDTH).fill(EMPTY_CELL),
		);
		return newBoard;
	}, []);

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

	// Rotate tetromino
	const rotate = (matrix: number[][], dir: number) => {
		// Transpose the matrix
		const rotated = matrix.map((_, index) => matrix.map((col) => col[index]));

		// Reverse each row to get a rotated matrix
		if (dir > 0) return rotated.map((row) => row.reverse());
		return rotated.reverse();
	};

	// Check collision
	const checkCollision = (
		player: Player,
		board: Board,
		moveX = 0,
		moveY = 0,
	): boolean => {
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
	};

	// Update board
	const updateBoard = useCallback(
		(prevBoard: Board): Board => {
			// Create a copy of the board
			const board = prevBoard.map((row) => [...row]);

			if (!player.tetromino) return board;

			// Draw the tetromino
			const shape = TETROMINOES[player.tetromino].shape;
			for (let y = 0; y < shape.length; y++) {
				for (let x = 0; x < shape[y].length; x++) {
					if (shape[y][x] !== 0) {
						const boardY = y + player.pos.y;
						const boardX = x + player.pos.x;

						// Check if we're on the board
						if (
							boardY >= 0 &&
							boardY < BOARD_HEIGHT &&
							boardX >= 0 &&
							boardX < BOARD_WIDTH
						) {
							board[boardY][boardX] = player.tetromino;
						}
					}
				}
			}

			return board;
		},
		[player],
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
	const movePlayer = (dirX: number, dirY: number) => {
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
	};

	// Rotate player
	const rotatePlayer = () => {
		if (gameOver || !player.tetromino || isPaused) return;

		const clonedPlayer = JSON.parse(JSON.stringify(player));
		if (clonedPlayer.tetromino) {
			const rotatedShape = rotate(TETROMINOES[clonedPlayer.tetromino].shape, 1);

			// Try to rotate, and if collision, try wall kicks
			const originalShape = TETROMINOES[clonedPlayer.tetromino].shape;
			TETROMINOES[clonedPlayer.tetromino].shape = rotatedShape;

			if (!checkCollision(clonedPlayer, board)) {
				setPlayer(clonedPlayer);
			} else {
				// Try wall kicks (move left/right to avoid collision)
				for (let kick = 1; kick <= 2; kick++) {
					// Try moving right
					if (!checkCollision(clonedPlayer, board, kick, 0)) {
						setPlayer({
							...clonedPlayer,
							pos: {
								...clonedPlayer.pos,
								x: clonedPlayer.pos.x + kick,
							},
						});
						return;
					}
					// Try moving left
					if (!checkCollision(clonedPlayer, board, -kick, 0)) {
						setPlayer({
							...clonedPlayer,
							pos: {
								...clonedPlayer.pos,
								x: clonedPlayer.pos.x - kick,
							},
						});
						return;
					}
				}
				// If no kick works, revert rotation
				TETROMINOES[clonedPlayer.tetromino].shape = originalShape;
			}
		}
	};

	// Hard drop
	const hardDrop = () => {
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
	};

	// Soft drop (faster falling)
	const softDrop = () => {
		if (gameOver || !player.tetromino || isPaused) return;
		movePlayer(0, 1);
	};

	// Game loop
	const gameLoop = useCallback(() => {
		if (gameOver || isPaused) return;

		movePlayer(0, 1);
	}, [gameOver, isPaused]);

	// Start game
	const startGame = () => {
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
		setDropStart(Date.now());

		// Set initial tetrominoes
		const firstTetromino = randomTetromino();
		setNextTetromino(randomTetromino());

		setPlayer({
			pos: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
			tetromino: firstTetromino,
			collided: false,
		});
	};

	// Handle keyboard controls
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!gameStarted || gameOver) return;

			switch (e.key) {
				case "ArrowLeft":
					movePlayer(-1, 0);
					break;
				case "ArrowRight":
					movePlayer(1, 0);
					break;
				case "ArrowDown":
					softDrop();
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
	}, [gameStarted, gameOver, movePlayer, rotatePlayer, hardDrop, softDrop]);

	// Game interval
	useEffect(() => {
		if (gameStarted && !gameOver && !isPaused) {
			if (gameLoopRef.current) {
				clearInterval(gameLoopRef.current);
			}
			gameLoopRef.current = setInterval(gameLoop, dropTimeRef.current);
		}

		return () => {
			if (gameLoopRef.current) {
				clearInterval(gameLoopRef.current);
			}
		};
	}, [gameLoop, gameStarted, gameOver, isPaused]);

	// Handle collision
	useEffect(() => {
		if (player.collided) {
			const newBoard = updateBoard(board);
			const sweptBoard = sweepRows(newBoard);

			setBoard(sweptBoard);
			resetPlayer();

			// Check if game is over (collision at top of board)
			if (
				player.tetromino &&
				checkCollision(
					{ ...player, pos: { x: player.pos.x, y: player.pos.y + 1 } },
					sweptBoard,
				)
			) {
				setGameOver(true);
				setGameStarted(false);
				if (gameLoopRef.current) {
					clearInterval(gameLoopRef.current);
				}
			}
		}
	}, [
		player.collided,
		board,
		updateBoard,
		sweepRows,
		resetPlayer,
		player,
		checkCollision,
	]);

	// Initialize board
	useEffect(() => {
		setBoard(createBoard());
	}, [createBoard]);

	// Render board cells with 3D effect
	const renderCell = (cell: BoardCell, rowIndex: number, colIndex: number) => {
		if (cell === EMPTY_CELL) {
			return (
				<div className="w-6 h-6 border border-gray-800 bg-gray-900/20 relative">
					<div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-transparent"></div>
				</div>
			);
		}

		if (typeof cell === "string" && cell in TETROMINOES) {
			const tetromino = TETROMINOES[cell as Tetromino];
			return (
				<div
					className={`w-6 h-6 border ${tetromino.border} ${tetromino.shadow} relative transform transition-transform hover:scale-105`}
				>
					<div
						className={`absolute inset-0 ${tetromino.color} bg-gradient-to-br from-white/30 to-black/30`}
					></div>
					<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
				</div>
			);
		}

		return (
			<div className="w-6 h-6 border border-gray-800 bg-gray-900/20 relative">
				<div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-transparent"></div>
			</div>
		);
	};

	// Render next tetromino preview with 3D effect
	const renderNextTetromino = () => {
		if (!nextTetromino) return null;

		const tetromino = TETROMINOES[nextTetromino];
		return (
			<div className="grid grid-cols-4 gap-1">
				{tetromino.shape.map((row, rowIndex) =>
					row.map((cell, colIndex) =>
						cell ? (
							<div
								key={`${rowIndex}-${colIndex}`}
								className={`w-4 h-4 border ${tetromino.border} ${tetromino.shadow} relative transform transition-transform`}
							>
								<div
									className={`absolute inset-0 ${tetromino.color} bg-gradient-to-br from-white/30 to-black/30`}
								></div>
								<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
							</div>
						) : (
							<div key={`${rowIndex}-${colIndex}`} className="w-4 h-4"></div>
						),
					),
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col items-center gap-4 p-4 bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl backdrop-blur-sm border border-blue-500/50 shadow-2xl">
			<div className="flex items-center justify-between w-full">
				<h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-400 to-cyan-300">
					Thursday Eye 3D Tetris
				</h2>
				{!gameStarted && !gameOver && (
					<Button
						onClick={startGame}
						className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
					>
						Start Game
					</Button>
				)}
			</div>

			<div className="flex gap-8">
				{/* Game board with 3D effect */}
				<div className="border-2 border-blue-500/70 rounded-lg p-2 bg-gray-900/50 shadow-2xl relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg"></div>
					<div className="relative grid grid-cols-10 gap-px">
						{board.map((row, rowIndex) =>
							row.map((cell, colIndex) => (
								<div key={`${rowIndex}-${colIndex}`}>
									{renderCell(cell, rowIndex, colIndex)}
								</div>
							)),
						)}
					</div>
				</div>

				{/* Game info panel with 3D effect */}
				<div className="flex flex-col gap-4 w-40">
					<div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-3 shadow-xl relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 to-purple-700/30 rounded-lg"></div>
						<div className="relative">
							<h3 className="font-bold mb-2 text-blue-200">Score</h3>
							<p className="text-2xl font-mono text-white drop-shadow-lg">
								{score}
							</p>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-3 shadow-xl relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 to-purple-700/30 rounded-lg"></div>
						<div className="relative">
							<h3 className="font-bold mb-2 text-blue-200">Level</h3>
							<p className="text-2xl font-mono text-white drop-shadow-lg">
								{level}
							</p>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-3 shadow-xl relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 to-purple-700/30 rounded-lg"></div>
						<div className="relative">
							<h3 className="font-bold mb-2 text-blue-200">Lines</h3>
							<p className="text-2xl font-mono text-white drop-shadow-lg">
								{lines}
							</p>
						</div>
					</div>

					<div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 backdrop-blur-sm border border-blue-500/50 rounded-lg p-3 shadow-xl relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 to-purple-700/30 rounded-lg"></div>
						<div className="relative">
							<h3 className="font-bold mb-2 text-blue-200">Next</h3>
							<div className="flex justify-center">{renderNextTetromino()}</div>
						</div>
					</div>

					{gameStarted && (
						<Button
							onClick={() => setIsPaused(!isPaused)}
							variant="secondary"
							className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
						>
							{isPaused ? "Resume" : "Pause"}
						</Button>
					)}

					{(gameOver || isPaused) && gameStarted && (
						<div className="text-center mt-2">
							{gameOver ? (
								<p className="text-red-400 font-bold animate-pulse drop-shadow-lg">
									Game Over!
								</p>
							) : (
								<p className="text-yellow-400 font-bold drop-shadow-lg">
									Paused
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Controls */}
			<div className="mt-4 text-center">
				<p className="text-sm text-blue-300 drop-shadow">
					Controls: ← → ↓ to move, ↑ to rotate, Space for hard drop, P to pause
				</p>
			</div>
		</div>
	);
}
