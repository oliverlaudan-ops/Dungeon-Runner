# Dungeon Runner - Project Specification

## 1. Project Overview

**Project Name:** Dungeon Runner  
**Type:** Browser-based Roguelike RPG  
**Core Functionality:** A single-player roguelike dungeon crawler with permadeath, procedurally generated dungeons, and class-based gameplay.  
**Target Users:** Casual and hardcore gamers who enjoy roguelikes and RPGs.

---

## 2. UI/UX Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Game Title | Level | Gold | Health                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    MAIN GAME AREA                          │
│                   (Dungeon View)                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  STATUS BAR: HP | MP | Level | XP | Gold | Floor           │
├─────────────────────────────────────────────────────────────┤
│  ACTION BAR: [Attack] [Defend] [Skill] [Inventory] [Map]   │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- **Mobile:** < 600px (stacked layout, smaller tiles)
- **Tablet:** 600px - 1024px
- **Desktop:** > 1024px (full experience)

### Visual Design

**Color Palette:**
- Background Dark: `#0a0a0f` (deep black-blue)
- Background Secondary: `#141420` (dark purple-black)
- Primary Accent: `#ff6b35` (flame orange)
- Secondary Accent: `#7b2cbf` (magical purple)
- Success: `#2ecc71` (healing green)
- Danger: `#e74c3c` (blood red)
- Gold: `#f1c40f` (treasure gold)
- Text Primary: `#ecf0f1`
- Text Muted: `#7f8c8d`

**Typography:**
- Headings: 'Cinzel', serif (fantasy feel)
- Body: 'Lato', sans-serif
- Monospace (stats): 'Fira Code', monospace

**Visual Effects:**
- Tile-based rendering with 32x32px tiles
- Subtle glow effects on interactive elements
- Smooth fade transitions between floors
- Particle effects for damage/healing

### Components

1. **Game Canvas** - Main rendering area for dungeon
2. **Player Stats Panel** - HP, MP, XP, Level display
3. **Action Buttons** - Combat and menu actions
4. **Inventory Modal** - Item management
5. **Enemy Info Panel** - Shows current enemy stats
6. **Message Log** - Combat text and events

---

## 3. Functionality Specification

### Core Features

#### Character System
- **3 Classes:**
  - **Warrior:** High HP, melee damage, shield ability
  - **Mage:** Low HP, high magic damage, heal ability
  - **Rogue:** Balanced, high evasion, critical strikes
- **Stats:** HP, MP, Attack, Defense, Speed, Luck
- **Leveling:** XP gain from kills, level up increases stats

#### Dungeon Generation
- Procedural room-based dungeon generation
- 10 floors (difficulty increases each floor)
- Room types: Empty, Combat, Treasure, Boss, Stairs
- Fog of war exploration

#### Combat System
- Turn-based combat (player then enemies)
- Attack, Defend, Use Skill, Use Item actions
- Enemy AI with different behaviors:
  - Aggressive (attacks immediately)
  - Cautious (attacks when player is close)
  - Ranged (maintains distance)

#### Permadeath & Progression
- Death = Game Over (with option to restart)
- Unlocks persistent meta-progression:
  - Achievements
  - Gold bank (spend between runs)
  - New character unlocks

#### Items & Loot
- Weapons, Armor, Consumables
- Rarity tiers: Common, Uncommon, Rare, Epic, Legendary
- Magic items have random bonuses
- Gold for purchases between runs

### User Interactions
1. Click to move/explore
2. Click enemies to attack
3. Keyboard shortcuts (WASD/Arrows for movement)
4. Number keys 1-5 for action bar

### Edge Cases
- Player can't move through walls
- Enemy pathfinding around obstacles
- Item pickup when inventory full
- Prevent dying from overflow damage

---

## 4. Acceptance Criteria

### Must Have (MVP)
- [ ] Character selection screen (3 classes)
- [ ] Procedural dungeon generation (5+ floors)
- [ ] Turn-based combat system
- [ ] Player movement and exploration
- [ ] Enemy encounters (3+ enemy types)
- [ ] Basic UI with stats display
- [ ] Permadeath with restart option

### Should Have
- [ ] Inventory system
- [ ] Items and loot drops
- [ ] Multiple enemy types
- [ ] Boss encounters
- [ ] Skill system per class

### Nice to Have
- [ ] Sound effects
- [ ] Animated sprites
- [ ] Achievements system
- [ ] Meta-progression (gold bank)

---

## 5. Technical Stack

- **Rendering:** HTML5 Canvas
- **Logic:** Vanilla JavaScript (ES6+)
- **Styling:** CSS3 with CSS Variables
- **Storage:** LocalStorage for saves
- **No frameworks** - keeping it simple and educational

---

## 6. File Structure

```
dungeon-runner/
├── index.html      # Entry point
├── SPEC.md         # This specification
├── css/
│   └── style.css   # All styles
├── js/
│   ├── game.js     # Main game loop
│   ├── player.js   # Player class
│   ├── dungeon.js  # Dungeon generation
│   ├── combat.js   # Combat system
│   ├── entities.js # Enemies and items
│   └── ui.js       # UI rendering
└── assets/
    └── (sprites later)
```