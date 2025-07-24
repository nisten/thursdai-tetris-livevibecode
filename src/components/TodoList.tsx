import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: Date;
}

export function TodoList() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTodo, setNewTodo] = useState("");

	const addTodo = () => {
		if (newTodo.trim() === "") return;

		const todo: Todo = {
			id: Math.random().toString(36).substr(2, 9),
			text: newTodo,
			completed: false,
			createdAt: new Date(),
		};

		setTodos([...todos, todo]);
		setNewTodo("");
	};

	const toggleTodo = (id: string) => {
		setTodos(
			todos.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo,
			),
		);
	};

	const deleteTodo = (id: string) => {
		setTodos(todos.filter((todo) => todo.id !== id));
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			addTodo();
		}
	};

	return (
		<Card className="w-full h-fit bg-blue-950/30 backdrop-blur-md border-blue-500/50 shadow-2xl">
			<CardHeader className="pb-4">
				<CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
					Thursday Eye Tasks
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex gap-2 mb-4">
					<Input
						type="text"
						value={newTodo}
						onChange={(e) => setNewTodo(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Add a new task..."
						className="flex-1 bg-white/10 border-blue-400/50 text-blue-100 placeholder:text-blue-400/50 focus-visible:ring-blue-400 focus-visible:border-blue-400"
					/>
					<Button 
						onClick={addTodo} 
						className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
					>
						Add
					</Button>
				</div>

				<div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
					{todos.length === 0 ? (
						<p className="text-center text-blue-400 py-8">
							No tasks yet. Add one above!
						</p>
					) : (
						todos.map((todo) => (
							<div
								key={todo.id}
								className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
									todo.completed
										? "bg-blue-900/30 border-blue-700/50 text-blue-500"
										: "bg-white/10 border-blue-500/50 text-blue-100 hover:bg-white/15"
								}`}
							>
								<div className="flex items-center space-x-3 flex-1">
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => toggleTodo(todo.id)}
										className="h-4 w-4 rounded border-blue-400/50 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
									/>
									<span
										className={`${
											todo.completed ? "line-through opacity-60" : ""
										}`}
									>
										{todo.text}
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => deleteTodo(todo.id)}
									className="h-8 w-8 p-0 text-blue-400 hover:text-red-400 hover:bg-red-400/10"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</Button>
							</div>
						))
					)}
				</div>

				{todos.length > 0 && (
					<div className="mt-4 pt-3 border-t border-blue-500/30 flex justify-between text-sm text-blue-400">
						<span>
							{todos.filter((t) => !t.completed).length} tasks remaining
						</span>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setTodos(todos.filter((t) => !t.completed))}
							className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
						>
							Clear completed
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
