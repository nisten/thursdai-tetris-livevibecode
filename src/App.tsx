import { Scene3D } from "./components/Scene3D";
import { TodoList } from "./components/TodoList";
import "./index.css";

export function App() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
			<div className="container mx-auto p-4">
				<div className="text-center mb-6">
					<h1 className="text-3xl md:text-5xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
						Thursday Eye 3D Tetris
					</h1>
					<p className="text-blue-300 drop-shadow-lg mt-2">
						Press 'T' to start • Arrow keys to move • Up to rotate • Space to drop • P to pause
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* 3D Tetris Game - Takes most of the space */}
					<div className="flex-1">
						<Scene3D />
					</div>

					{/* Todo List - Sidebar */}
					<div className="lg:w-96">
						<TodoList />
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
