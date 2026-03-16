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
        // Initialize map - fit to canvas (20 cols x 15 rows for 640x480 at 32px tile)
        this.width = 20;
        this.height = 15;
        
        this.map = Array(this.height).fill(null).map(() => 
            Array(this.width).fill(this.TILES.FLOOR)  // Start with all floor!
        );
        
        // Add walls around edges
        for (let x = 0; x < this.width; x++) {
            this.map[0][x] = this.TILES.WALL;
            this.map[this.height-1][x] = this.TILES.WALL;
        }
        for (let y = 0; y < this.height; y++) {
            this.map[y][0] = this.TILES.WALL;
            this.map[y][this.width-1] = this.TILES.WALL;
        }
        
        // Generate rooms - simple grid pattern for guaranteed connectivity
        this.rooms = [];
        const cols = 4;
        const rows = 3;
        const roomW = Math.floor(this.width / cols) - 1;
        const roomH = Math.floor(this.height / rows) - 1;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Skip some rooms randomly for variety
                if (Math.random() < 0.2) continue;
                
                const width = 3 + Math.floor(Math.random() * 2);
                const height = 2 + Math.floor(Math.random() * 2);
                const x = 1 + col * roomW + Math.floor(Math.random() * (roomW - width - 1));
                const y = 1 + row * roomH + Math.floor(Math.random() * (roomH - height - 1));
                
                const room = { x, y, width, height };
                this.addRoom(room);
                
                // Connect to previous room in row
                if (col > 0 && this.rooms.length > 1) {
                    this.connectRooms(this.rooms[this.rooms.length-2], room);
                }
                // Connect to room above
                if (row > 0 && col === 0) {
                    // Find room above in same column
                    const roomAbove = this.rooms.find(r => 
                        r.y < y && r.x + r.width > x && r.x < x + width
                    );
                    if (roomAbove) {
                        this.connectRooms(roomAbove, room);
                    }
                }
            }
        }
        
        // Make sure we have at least 2 rooms
        if (this.rooms.length < 2) {
            const room1 = { x: 2, y: 2, width: 5, height: 4 };
            const room2 = { x: 12, y: 8, width: 5, height: 4 };
            this.rooms = [room1, room2];
            this.addRoom(room1);
            this.addRoom(room2);
            this.connectRooms(room1, room2);
        }
        
        // Add stairs in last room
        const lastRoom = this.rooms[this.rooms.length - 1];
        if (lastRoom) {
            lastRoom.centerX = Math.floor(lastRoom.x + lastRoom.width / 2);
            lastRoom.centerY = Math.floor(lastRoom.y + lastRoom.height / 2);
            this.map[lastRoom.centerY][lastRoom.centerX] = this.TILES.STAIRS_DOWN;
        }
        
        // Add stairs up in first room
        const firstRoom = this.rooms[0];
        if (firstRoom) {
            firstRoom.centerX = Math.floor(firstRoom.x + firstRoom.width / 2);
            firstRoom.centerY = Math.floor(firstRoom.y + firstRoom.height / 2);
            if (this.floor > 1) {
                this.map[firstRoom.centerY][firstRoom.centerX] = this.TILES.STAIRS_UP;
            }
        }
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
        // L-shaped corridor - ensure both horizontal AND vertical corridors exist
        const x1 = room1.centerX;
        const y1 = room1.centerY;
        const x2 = room2.centerX;
        const y2 = room2.centerY;
        
        // Horizontal corridor
        let x = x1;
        while (x !== x2) {
            this.setFloor(x, y1);
            x += x < x2 ? 1 : -1;
        }
        this.setFloor(x2, y1);  // Ensure corner is floor
        
        // Vertical corridor (from corner to destination)
        let y = y1;
        while (y !== y2) {
            this.setFloor(x2, y);
            y += y < y2 ? 1 : -1;
        }
        this.setFloor(x2, y2);  // Ensure destination is floor
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