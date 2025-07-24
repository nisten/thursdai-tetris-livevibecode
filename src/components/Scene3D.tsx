import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Tetris3D } from "./Tetris3D";
import { useEffect, useState } from "react";

export function Scene3D() {
	const [screenHeight, setScreenHeight] = useState(window.innerHeight);

	useEffect(() => {
		const handleResize = () => {
			setScreenHeight(window.innerHeight);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Calculate dynamic height based on screen size
	const canvasHeight = Math.min(screenHeight - 200, 800);

	return (
		<div 
			className="w-full rounded-xl overflow-hidden border-2 border-blue-500/50 shadow-2xl bg-gradient-to-b from-blue-950/50 to-purple-950/50"
			style={{ height: `${canvasHeight}px` }}
		>
			<Canvas shadows>
				<PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
				<OrbitControls
					enablePan={true}
					enableZoom={true}
					enableRotate={true}
					minDistance={10}
					maxDistance={40}
					autoRotate={false}
					autoRotateSpeed={0.5}
				/>

				{/* Enhanced lighting */}
				<ambientLight intensity={0.4} />
				<pointLight position={[15, 15, 15]} intensity={1.2} castShadow />
				<pointLight position={[-15, -15, -15]} intensity={0.6} />
				<directionalLight 
					position={[5, 10, 5]} 
					intensity={0.5} 
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
				/>

				{/* Centered Tetris game */}
				<Tetris3D position={[0, 0, 0]} />

				{/* Background elements */}
				<mesh position={[0, 0, -10]}>
					<planeGeometry args={[100, 100]} />
					<meshStandardMaterial 
						color="#0a0a0a" 
						metalness={0.8} 
						roughness={0.2}
					/>
				</mesh>

				{/* Decorative grid floor */}
				<gridHelper 
					args={[50, 50, "#2563eb", "#1e40af"]} 
					position={[0, -12, 0]}
					rotation={[0, 0, 0]}
				/>

				{/* Fog for depth */}
				<fog attach="fog" args={["#0a0a0a", 20, 50]} />
			</Canvas>
		</div>
	);
}
