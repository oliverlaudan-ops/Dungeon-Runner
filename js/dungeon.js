/**
 * Dungeon Runner - Dungeon Generation
 * Procedural room-based dungeon generator
 */

import { Enemy, ITEMS } from './entities.js';

export class Dungeon {
    constructor(floor = 1) {
        this.floor = floor;
        this.map = [];
        this.rooms = [];
        this.width = 0;
        this.height = 0;
        
        // Tile types
        this.TILES = {
            FLOOR: '.',
            WALL: '#',
            STAIRS_DOWN: '>',
            STAIRS_UP: '<',
            DOOR: '+',
            VOID: ' '
        };
    }
    
    generate() {
        // Initialize map
        this.width = 40;
        this.height = 15;
        
        this.map = Array(this.height).fill(null).map(() => 
            Array(this.width).fill(this.TILES.VOID)
        );
        
        // Generate rooms
        this.rooms = [];
        const numRooms = 5 + Math.floor(Math.random() * 4); // 5-8 rooms
        
        for (let i = 0; i < numRooms * 10 && this.rooms.length < numRooms; i++) {
            const room = this.generateRoom();
            
            // Check for overlap
            let overlaps = false;
            for (const other of this.rooms) {
                if (this.roomsOverlap(room, other)) {
                    overlaps = true;
                    break;
                }
            }
            
            if (!overlaps) {
                this.addRoom(room);
            }
        }
        
        // Connect rooms with corridors
        for (let i = 1; i < this.rooms.length; i++) {
            this.connectRooms(this.rooms[i-1], this.rooms[i]);
        }
        
        // Add stairs in last room
        const lastRoom = this.rooms[this.rooms.length - 1];
        if (lastRoom) {
            this.map[lastRoom.centerY][lastRoom.centerX] = this.TILES.STAIRS_DOWN;
        }
        
        // Add stairs up in first room for later
        const firstRoom = this.rooms[0];
        if (firstRoom && this.floor > 1) {
            this.map[firstRoom.centerY][firstRoom.centerX - 1] = this.TILES.STAIRS_UP;
        }
        
        // Add some doors
        this.addDoors();
    }
    
    generateRoom() {
        const minSize = 4;
        const maxSize = 8;
        
        const width = minSize + Math.floor(Math.random() * (maxSize - minSize));
        const height = minSize + Math.floor(Math.random() * (maxSize - height));
        
        const x = 1 + Math.floor(Math.random() * (this.width - width - 2));
        const y = 1 + Math.floor(Math.random() * (this.height - height - 2));
        
        return { x, y, width, height };
    }
    
    roomsOverlap(r1, r2) {
        const padding = 1;
        return !(r1.x + r1.width + padding < r2.x || 
                 r2.x + r2.width + padding < r1.x ||
                 r1.y + r1.height + padding < r2.y ||
                 r2.y + r2.height + padding < r1.y);
    }
    
    addRoom(room) {
        // Fill room with floor
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.map[y][x] = this.TILES.FLOOR;
                }
            }
        }
        
        // Add walls around room
        for (let x = room.x - 1; x <= room.x + room.width; x++) {
            for (let y = room.y - 1; y <= room.y + room.height; y++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    if (this.map[y][x] === this.TILES.VOID) {
                        this.map[y][x] = this.TILES.WALL;
                    }
                }
            }
        }
        
        // Calculate center
        room.centerX = Math.floor(room.x + room.width / 2);
        room.centerY = Math.floor(room.y + room.height / 2);
        
        this.rooms.push(room);
    }
    
    connectRooms(room1, room2) {
        // L-shaped corridor
        let x = room1.centerX;
        let y = room1.centerY;
        
        // Horizontal first
        while (x !== room2.centerX) {
            this.setFloor(x, y);
            x += x < room2.centerX ? 1 : -1;
        }
        
        // Then vertical
        while (y !== room2.centerY) {
            this.setFloor(x, y);
            y += y < room2.centerY ? 1 : -1;
        }
    }
    
    setFloor(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            if (this.map[y][x] === this.TILES.WALL) {
                this.map[y][x] = this.TILES.FLOOR;
            }
        }
    }
    
    addDoors() {
        for (const room of this.rooms) {
            // Check each wall for openings that could be doors
            const midX = Math.floor(room.x + room.width / 2);
            const midY = Math.floor(room.y + room.height / 2);
            
            // Top wall
            if (this.map[room.y - 1]?.[midX] === this.TILES.FLOOR) {
                this.map[room.y][midX] = this.TILES.DOOR;
            }
        }
    }
    
    isWalkable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const tile = this.map[y][x];
        return tile === this.TILES.FLOOR || tile === this.TILES.DOOR || tile === this.TILES.STAIRS_DOWN;
    }
    
    generateEnemy(x, y, floor) {
        const enemyTypes = this.getEnemyTypesForFloor(floor);
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        return new Enemy(x, y, type, floor);
    }
    
    getEnemyTypesForFloor(floor) {
        const types = ['rat', 'slime', 'skeleton'];
        
        if (floor >= 3) types.push('goblin', 'spider');
        if (floor >= 5) types.push('orc', 'bat');
        if (floor >= 7) types.push('troll', 'wolf');
        if (floor >= 9) types.push('demon', 'dragon');
        
        return types;
    }
    
    generateItem(x, y) {
        const roll = Math.random();
        
        // 30% chance for gold
        if (roll < 0.3) {
            const value = 10 + Math.floor(Math.random() * this.floor * 10);
            return {
                x, y,
                type: 'gold',
                value,
                render: (ctx, tileSize) => {
                    const px = x * tileSize;
                    const py = y * tileSize;
                    ctx.font = `${tileSize - 8}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('💰', px + tileSize/2, py + tileSize/2);
                }
            };
        }
        
        // 70% chance for potion
        const isHealth = Math.random() < 0.6;
        const potency = 20 + this.floor * 5;
        
        return {
            x, y,
            type: 'potion',
            subtype: isHealth ? 'health' : 'mana',
            value: potency,
            render: (ctx, tileSize) => {
                const px = x * tileSize;
                const py = y * tileSize;
                ctx.font = `${tileSize - 8}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(isHealth ? '❤️' : '💙', px + tileSize/2, py + tileSize/2);
            }
        };
    }
    
    render(ctx, tileSize) {
        // Render tiles
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.map[y][x];
                const px = x * tileSize;
                const py = y * tileSize;
                
                switch(tile) {
                    case this.TILES.FLOOR:
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(px, py, tileSize, tileSize);
                        // Subtle floor pattern
                        ctx.fillStyle = '#15152a';
                        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
                        break;
                    case this.TILES.WALL:
                        ctx.fillStyle = '#2c2c3e';
                        ctx.fillRect(px, py, tileSize, tileSize);
                        // Wall shading
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
                        break;
                    case this.TILES.DOOR:
                        ctx.fillStyle = '#8b4513';
                        ctx.fillRect(px, py, tileSize, tileSize);
                        break;
                    case this.TILES.STAIRS_DOWN:
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(px, py, tileSize, tileSize);
                        ctx.font = `${tileSize - 4}px serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🪜', px + tileSize/2, py + tileSize/2);
                        break;
                    case this.TILES.STAIRS_UP:
                        ctx.fillStyle = '#1a1a2e';
                        ctx.fillRect(px, py, tileSize, tileSize);
                        ctx.font = `${tileSize - 4}px serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('⤴️', px + tileSize/2, py + tileSize/2);
                        break;
                }
            }
        }
        
        // Room borders (subtle)
        ctx.strokeStyle = '#3c3c5e';
        ctx.lineWidth = 1;
        for (const room of this.rooms) {
            ctx.strokeRect(
                room.x * tileSize, 
                room.y * tileSize, 
                room.width * tileSize, 
                room.height * tileSize
            );
        }
    }
}