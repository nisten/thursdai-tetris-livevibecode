import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";

interface Todo {
	id: string;
	text: string;
	completed: boolean;
	createdAt: Date;
}

export function Todo3D({ position }: { position: [number, number, number] }) {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [newTodo, setNewTodo] = useState("");
	const groupRef = useRef<THREE.Group>(null);
	const rotationRef = useRef(0);

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

	const clearCompleted = () => {
		setTodos(todos.filter((t) => !t.completed));
	};

	// Rotate the todo list slowly
	useFrame((state, delta) => {
		if (groupRef.current) {
			rotationRef.current += delta * 0.1;
			groupRef.current.rotation.y = Math.sin(rotationRef.current * 0.5) * 0.1;
		}
	});

	return (
		<group position={position} ref={groupRef}>
			{/* Todo list container */}
			<mesh position={[0, 0, 0]}>
				<boxGeometry args={[6, 8, 0.5]} />
				<meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.4} />
			</mesh>

			{/* Todo list title */}
			<mesh position={[0, 3.5, 0.3]}>
				<boxGeometry args={[5, 0.5, 0.2]} />
				<meshStandardMaterial color="#1e40af" metalness={0.5} roughness={0.2} />
			</mesh>

			{/* Input field */}
			<mesh
				position={[0, 2.5, 0.3]}
				onClick={addTodo}
				onPointerOver={(e) => e.stopPropagation()}
			>
				<boxGeometry args={[4, 0.5, 0.2]} />
				<meshStandardMaterial color="#60a5fa" metalness={0.3} roughness={0.4} />
			</mesh>

			{/* Add button */}
			<mesh
				position={[2.5, 2.5, 0.3]}
				onClick={addTodo}
				onPointerOver={(e) => e.stopPropagation()}
			>
				<boxGeometry args={[0.8, 0.5, 0.3]} />
				<meshStandardMaterial color="#10b981" metalness={0.5} roughness={0.2} />
			</mesh>

			{/* Clear completed button */}
			{todos.some((t) => t.completed) && (
				<mesh
					position={[0, -3.5, 0.3]}
					onClick={clearCompleted}
					onPointerOver={(e) => e.stopPropagation()}
				>
					<boxGeometry args={[3, 0.5, 0.3]} />
					<meshStandardMaterial
						color="#f59e0b"
						metalness={0.5}
						roughness={0.2}
					/>
				</mesh>
			)}

			{/* Todo items */}
			{todos.slice(0, 5).map((todo, index) => (
				<group key={todo.id} position={[0, 1.5 - index * 0.8, 0.3]}>
					{/* Todo item background */}
					<mesh
						onClick={() => toggleTodo(todo.id)}
						onPointerOver={(e) => e.stopPropagation()}
					>
						<boxGeometry args={[4.5, 0.6, 0.2]} />
						<meshStandardMaterial
							color={todo.completed ? "#10b981" : "#93c5fd"}
							metalness={0.3}
							roughness={0.4}
							transparent
							opacity={todo.completed ? 0.7 : 1}
						/>
					</mesh>

					{/* Delete button */}
					<mesh
						position={[2.6, 0, 0.1]}
						onClick={(e) => {
							e.stopPropagation();
							deleteTodo(todo.id);
						}}
						onPointerOver={(e) => e.stopPropagation()}
					>
						<boxGeometry args={[0.4, 0.4, 0.3]} />
						<meshStandardMaterial
							color="#ef4444"
							metalness={0.5}
							roughness={0.2}
						/>
					</mesh>
				</group>
			))}

			{/* Counter */}
			<mesh position={[-2, -3.5, 0.3]}>
				<boxGeometry args={[1.5, 0.5, 0.2]} />
				<meshStandardMaterial color="#8b5cf6" metalness={0.3} roughness={0.4} />
			</mesh>
		</group>
	);
}
