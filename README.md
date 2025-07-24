# ThursdAI 3D Tetris

A stunning 3D Tetris game with Todo list sidebar, built live on the **ThursdAI show** on Twitter using the **Qwen3-Code480** model! 🎮✨

![ThursdAI](https://img.shields.io/badge/Built%20on-ThursdAI-blue)
![Qwen3-Code480](https://img.shields.io/badge/Model-Qwen3--Code480-purple)
![Bun](https://img.shields.io/badge/Runtime-Bun-orange)
![React](https://img.shields.io/badge/Framework-React-blue)
![Three.js](https://img.shields.io/badge/3D-Three.js-green)

## 🎬 Built Live on ThursdAI

This project was created during a live coding session on the **ThursdAI show** on Twitter, demonstrating the power of the **Qwen3-Code480** AI model for real-time software development. Watch as AI helps build a fully functional 3D game from scratch!

## 🎮 Features

- **3D Tetris Game**: A beautiful 3D implementation of the classic Tetris game
- **Responsive Design**: Dynamically adjusts to screen size
- **Todo List Sidebar**: Keep track of tasks while you play
- **Modern UI**: Glassmorphism effects with blue/purple gradients
- **Enhanced Visual Effects**: 
  - Dynamic lighting system
  - Fog effects for depth
  - Decorative grid floor
  - Smooth animations

## 🎯 Game Controls

- **T** - Start/restart the game
- **Arrow Keys** - Move pieces (left/right/down)
- **Up Arrow** - Rotate piece
- **Space** - Hard drop
- **P** - Pause/unpause

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime installed

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/thursdai-3d-tetris
cd thursdai-3d-tetris

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to play!

### Build for Production

```bash
bun run build
```

The production-ready files will be in the `dist/` folder.

## 🛠️ Tech Stack

- **Runtime**: Bun (Fast all-in-one JavaScript runtime)
- **Framework**: React 19
- **3D Graphics**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui
- **Type Safety**: TypeScript
- **Linting**: Biome

## 📁 Project Structure

```
thursdai/
├── src/
│   ├── components/
│   │   ├── Scene3D.tsx      # Main 3D scene container
│   │   ├── Tetris3D.tsx     # 3D Tetris game logic
│   │   ├── TodoList.tsx     # Todo list sidebar
│   │   └── ui/              # Reusable UI components
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Server entry point
│   ├── index.html           # HTML template
│   └── index.css            # Global styles
├── biome.json               # Biome configuration
├── package.json             # Project dependencies
├── build.ts                 # Build script
└── README.md               # This file
```

## 🎨 Key Features Implemented

### 3D Tetris Engine
- Complete Tetris game mechanics
- Collision detection
- Line clearing with scoring
- Level progression
- Next piece preview
- Game over detection

### Responsive 3D Canvas
- Dynamic viewport sizing
- Orbit controls for camera movement
- Enhanced lighting and shadows
- Background effects and fog

### Todo List Integration
- Add/remove tasks
- Mark tasks as complete
- Persistent sidebar layout
- Custom scrollbar styling

## 🐛 Bug Fixes During Live Stream

- Fixed game crash after first block drop
- Resolved collision detection issues
- Fixed game over logic
- Added proper state management

## 🎥 About ThursdAI

ThursdAI is a weekly Twitter show where we explore the latest in AI development, featuring live coding sessions, model demonstrations, and discussions about AI tools and techniques.

## 🤖 About Qwen3-Code480

Qwen3-Code480 is a powerful AI coding assistant model that helped build this entire project during the live stream, demonstrating real-time code generation, debugging, and architectural decisions.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built live on [ThursdAI](https://twitter.com/thursdai_) 
- Powered by Qwen3-Code480 AI model
- Thanks to all the viewers who watched the live coding session!

---

*Built with ❤️ and AI on ThursdAI*
