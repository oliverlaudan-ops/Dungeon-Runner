/**
 * Dungeon Runner - Main Game Engine
 * A roguelike RPG in the browser
 */

import { Player } from './player.js';
import { Dungeon } from './dungeon.js';
import { UI } from './ui.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.tileSize = 32;
        this.cols = Math.floor(this.canvas.width / this.tileSize);
        this.rows = Math.floor(this.canvas.height / this.tileSize);
        
        this.player = null;
        this.dungeon = null;
        this.ui = new UI(this);
        
        this.gameState = 'character-select'; // character-select, playing, game-over
        this.floor = 1;
        this.enemies = [];
        this.items = [];
        
        // Run statistics
        this.stats = {
            kills: 0,
            goldCollected: 0,
            damageDealt: 0,
            enemiesKilled: {}
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Character selection
        const selectClass = (card) => {
            const selected = document.querySelector('.class-card.selected');
            if (selected) selected.classList.remove('selected');
            card.classList.add('selected');
            
            // Enable start button
            document.getElementById('btn-start').disabled = false;
        };
        
        document.querySelectorAll('.class-card').forEach(card => {
            // Mouse click
            card.addEventListener('click', (e) => {
                e.preventDefault();
                selectClass(card);
            });
            
            // Touch support
            card.addEventListener('touchend', (e) => {
                e.preventDefault();
                selectClass(card);
            });
        });
        
        // Start button
        document.getElementById('btn-start').addEventListener('click', (e) => {
            e.preventDefault();
            const selected = document.querySelector('.class-card.selected');
            if (selected) {
                this.startGame(selected.dataset.class);
            }
        });
        
        // Also support double-click/tap to start directly
        document.querySelectorAll('.class-card').forEach(card => {
            card.addEventListener('dblclick', () => {
                this.startGame(card.dataset.class);
            });
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleInput(e));
        
        // Action buttons
        document.getElementById('btn-attack').addEventListener('click', () => this.setAction('attack'));
        document.getElementById('btn-defend').addEventListener('click', () => this.setAction('defend'));
        document.getElementById('btn-skill').addEventListener('click', () => this.setAction('skill'));
        document.getElementById('btn-item').addEventListener('click', () => this.setAction('item'));
        document.getElementById('btn-descend').addEventListener('click', () => this.descendStairs());
        
        // Restart button
        document.getElementById('btn-restart').addEventListener('click', () => this.restart());
        
        // Canvas click for movement/attack
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
    }
    
    startGame(charClass) {
        // Create player
        this.player = new Player(charClass);
        
        // Create first dungeon floor
        this.dungeon = new Dungeon(this.floor);
        this.dungeon.generate();
        
        // Place player
        const startRoom = this.dungeon.rooms[0];
        this.player.x = startRoom.centerX;
        this.player.y = startRoom.centerY;
        
        // Generate enemies for this floor
        this.generateEnemies();
        
        // Generate items
        this.generateItems();
        
        // Update UI
        this.ui.showMessage('You enter the dungeon...', 'info');
        this.ui.update();
        
        // Hide modal
        document.getElementById('char-select-modal').classList.add('hidden');
        
        this.gameState = 'playing';
        this.render();
    }
    
    generateEnemies() {
        this.enemies = [];
        
        // Number of enemies increases with floor
        const numEnemies = Math.min(3 + this.floor * 2, 15);
        
        for (let i = 0; i < numEnemies; i++) {
            const room = this.dungeon.rooms[Math.floor(Math.random() * this.dungeon.rooms.length) + 1];
            if (!room) continue;
            
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            
            // Don't place on player
            if (Math.abs(x - this.player.x) < 3 && Math.abs(y - this.player.y) < 3) continue;
            
            // Check if tile is walkable
            if (!this.dungeon.isWalkable(x, y)) continue;
            
            const enemy = this.dungeon.generateEnemy(x, y, this.floor);
            if (enemy) {
                this.enemies.push(enemy);
            }
        }
    }
    
    generateItems() {
        this.items = [];
        
        // Add some treasure
        const numTreasure = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numTreasure; i++) {
            const room = this.dungeon.rooms[Math.floor(Math.random() * this.dungeon.rooms.length) + 1];
            if (!room) continue;
            
            const x = room.x + Math.floor(Math.random() * room.width);
            const y = room.y + Math.floor(Math.random() * room.height);
            
            if (!this.dungeon.isWalkable(x, y)) continue;
            
            // Check if occupied
            if (this.enemies.some(e => e.x === x && e.y === y)) continue;
            
            const item = this.dungeon.generateItem(x, y);
            if (item) {
                this.items.push(item);
            }
        }
    }
    
    handleInput(e) {
        if (this.gameState !== 'playing') return;
        
        let dx = 0, dy = 0;
        
        switch(e.key) {
            case 'ArrowUp': case 'w': case 'W': dy = -1; break;
            case 'ArrowDown': case 's': case 'S': dy = 1; break;
            case 'ArrowLeft': case 'a': case 'A': dx = -1; break;
            case 'ArrowRight': case 'd': case 'D': dx = 1; break;
            case '1': this.setAction('attack'); return;
            case '2': this.setAction('defend'); return;
            case '3': this.setAction('skill'); return;
            case '4': this.setAction('item'); return;
            case '5': this.descendStairs(); return;
            case ' ':
                e.preventDefault();
                this.setAction('attack');
                return;
            default: return;
        }
        
        if (dx !== 0 || dy !== 0) {
            this.movePlayer(dx, dy);
        }
    }
    
    handleCanvasClick(e) {
        if (this.gameState !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.tileSize);
        const y = Math.floor((e.clientY - rect.top) / this.tileSize);
        
        const dx = x - this.player.x;
        const dy = y - this.player.y;
        
        // If clicked on enemy in range, attack
        const targetEnemy = this.enemies.find(e => e.x === x && e.y === y);
        if (targetEnemy && Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            this.attackEnemy(targetEnemy);
            return;
        }
        
        // Otherwise try to move
        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            this.movePlayer(dx, dy);
        }
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check bounds
        if (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows) return;
        
        // Check walls
        if (!this.dungeon.isWalkable(newX, newY)) {
            // Check if it's an enemy (can't walk through)
            const enemy = this.enemies.find(e => e.x === newX && e.y === newY);
            if (enemy) {
                this.attackEnemy(enemy);
            }
            return;
        }
        
        // Check for stairs
        if (this.dungeon.map[newY][newX] === '>') {
            this.descendStairs();
            return;
        }
        
        // Move
        this.player.x = newX;
        this.player.y = newY;
        
        // Check for items
        const itemIndex = this.items.findIndex(i => i.x === newX && i.y === newY);
        if (itemIndex !== -1) {
            const item = this.items[itemIndex];
            this.pickupItem(item);
            this.items.splice(itemIndex, 1);
        }
        
        // Enemy turn after moving
        this.enemyTurn();
        
        this.ui.update();
        this.render();
    }
    
    attackEnemy(enemy) {
        const damage = this.player.attack;
        const isCrit = Math.random() < this.player.stats.luck / 100;
        const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;
        
        enemy.hp -= finalDamage;
        
        this.stats.damageDealt += finalDamage;
        
        const message = isCrit 
            ? `CRITICAL! You hit ${enemy.name} for ${finalDamage} damage!`
            : `You attack ${enemy.name} for ${finalDamage} damage.`;
        
        this.ui.showMessage(message, isCrit ? 'combat' : 'damage');
        
        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
        
        // Enemy turn after attack
        this.enemyTurn();
        
        this.ui.update();
        this.render();
    }
    
    killEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        this.stats.kills++;
        this.stats.enemiesKilled[enemy.name] = (this.stats.enemiesKilled[enemy.name] || 0) + 1;
        
        // Drop gold
        const gold = enemy.gold;
        this.player.gold += gold;
        this.stats.goldCollected += gold;
        
        // XP
        this.player.gainXp(enemy.xp);
        
        this.ui.showMessage(`${enemy.name} defeated! +${gold} gold, +${enemy.xp} XP`, 'gold');
        
        // Check level up
        if (this.player.leveledUp) {
            this.ui.showMessage(`LEVEL UP! You are now level ${this.player.level}`, 'heal');
            this.player.leveledUp = false;
        }
        
        // Check if floor is clear
        if (this.enemies.length === 0) {
            this.ui.showMessage('All enemies defeated! Find the stairs to descend.', 'info');
        }
    }
    
    enemyTurn() {
        for (const enemy of this.enemies) {
            const dist = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
            
            // Only act if in range
            if (dist > enemy.range) continue;
            
            // Attack player
            if (dist <= 1) {
                let damage = Math.max(1, enemy.attack - this.player.stats.defense / 2);
                damage = Math.floor(damage);
                
                // Check evasion
                if (this.player.isDefending && Math.random() < 0.5) {
                    this.ui.showMessage(`${enemy.name}'s attack was blocked!`, 'heal');
                } else {
                    this.player.hp = Math.max(0, this.player.hp - damage);
                    this.ui.showMessage(`${enemy.name} hits you for ${damage} damage!`, 'damage');
                    
                    // Check death
                    if (this.player.hp <= 0) {
                        this.gameOver();
                        return;
                    }
                }
            } else if (enemy.type === 'aggressive') {
                // Move towards player
                const dx = Math.sign(this.player.x - enemy.x);
                const dy = Math.sign(this.player.y - enemy.y);
                
                // Try to move
                if (this.dungeon.isWalkable(enemy.x + dx, enemy.y)) {
                    enemy.x += dx;
                } else if (this.dungeon.isWalkable(enemy.x, enemy.y + dy)) {
                    enemy.y += dy;
                }
            }
        }
        
        this.ui.update();
    }
    
    pickupItem(item) {
        if (item.type === 'gold') {
            this.player.gold += item.value;
            this.stats.goldCollected += item.value;
            this.ui.showMessage(`Found ${item.value} gold!`, 'gold');
        } else if (item.type === 'potion') {
            if (item.subtype === 'health') {
                const heal = Math.min(item.value, this.player.maxHp - this.player.hp);
                this.player.hp += heal;
                this.ui.showMessage(`Recovered ${heal} HP!`, 'heal');
            } else if (item.subtype === 'mana') {
                const mana = Math.min(item.value, this.player.maxMp - this.player.mp);
                this.player.mp += mana;
                this.ui.showMessage(`Restored ${mana} MP!`, 'heal');
            }
        }
    }
    
    setAction(action) {
        if (this.gameState !== 'playing') return;
        
        switch(action) {
            case 'defend':
                this.player.isDefending = true;
                this.ui.showMessage('You take a defensive stance.', 'info');
                this.enemyTurn();
                break;
            case 'skill':
                this.player.useSkill();
                break;
            case 'item':
                this.useItem();
                break;
        }
        
        this.ui.update();
        this.render();
    }
    
    useItem() {
        // For now, just use a health potion if available
        this.ui.showMessage('No items available yet!', 'info');
    }
    
    descendStairs() {
        // Check if stairs exist and are reachable
        const stairs = this.dungeon.rooms.flatMap(r => 
            Array.from({length: r.width}, (_, i) => ({x: r.x + i, y: r.y + Math.floor(r.height/2)}))
        ).find(t => this.dungeon.map[t.y]?.[t.x] === '>');
        
        if (!stairs) {
            this.ui.showMessage('No stairs found!', 'info');
            return;
        }
        
        // Check if near stairs
        const dist = Math.abs(this.player.x - stairs.x) + Math.abs(this.player.y - stairs.y);
        if (dist > 1) {
            this.ui.showMessage('Get closer to the stairs!', 'info');
            return;
        }
        
        // Go to next floor
        this.floor++;
        this.ui.showMessage(`Descending to floor ${this.floor}...`, 'info');
        
        // Generate new floor
        this.dungeon = new Dungeon(this.floor);
        this.dungeon.generate();
        
        // Place player at start
        const startRoom = this.dungeon.rooms[0];
        this.player.x = startRoom.centerX;
        this.player.y = startRoom.centerY;
        
        // Generate new enemies
        this.generateEnemies();
        this.generateItems();
        
        this.ui.update();
        this.render();
    }
    
    gameOver() {
        this.gameState = 'game-over';
        
        document.getElementById('final-floor').textContent = this.floor;
        document.getElementById('final-kills').textContent = this.stats.kills;
        document.getElementById('final-gold').textContent = this.stats.goldCollected;
        document.getElementById('final-damage').textContent = this.stats.damageDealt;
        
        document.getElementById('game-over-modal').classList.remove('hidden');
    }
    
    restart() {
        this.stats = {
            kills: 0,
            goldCollected: 0,
            damageDealt: 0,
            enemiesKilled: {}
        };
        
        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('char-select-modal').classList.remove('hidden');
        
        this.gameState = 'character-select';
        this.floor = 1;
        this.enemies = [];
        this.items = [];
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0d0d12';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.dungeon) return;
        
        // Render dungeon
        this.dungeon.render(this.ctx, this.tileSize);
        
        // Render items
        for (const item of this.items) {
            item.render(this.ctx, this.tileSize);
        }
        
        // Render enemies
        for (const enemy of this.enemies) {
            enemy.render(this.ctx, this.tileSize);
        }
        
        // Render player
        this.player.render(this.ctx, this.tileSize);
    }
}

// Start the game
const game = new Game();

export { game };