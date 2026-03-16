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
        
        // Start with solid walls
        this.map = Array(this.height).fill(null).map(() => 
            Array(this.width).fill(this.TILES.WALL)
        );
        
        this.rooms = [];
        
        // Simple: create rooms in a line, each connected to the previous
        const numRooms = 4 + Math.floor(Math.random() * 2); // 4-5 rooms
        
        let currentX = 2;
        for (let i = 0; i < numRooms; i++) {
            const width = 4 + Math.floor(Math.random() * 3);
            const height = 3 + Math.floor(Math.random() * 3);
            const y = 2 + Math.floor(Math.random() * 5);
            
            // Make sure room fits
            const finalX = Math.min(currentX, this.width - width - 1);
            const finalY = Math.min(y, this.height - height - 1);
            
            const room = { x: finalX, y: finalY, width, height };
            this.addRoom(room);
            
            // Connect to previous room
            if (i > 0) {
                this.connectRooms(this.rooms[i-1], room);
            }
            
            currentX = finalX + width + 2; // Leave 2 tile gap for corridor
            if (currentX > this.width - 5) break;
        }
        
        // Ensure we have enough rooms
        while (this.rooms.length < 3) {
            const lastRoom = this.rooms[this.rooms.length - 1];
            const room = { 
                x: Math.min(lastRoom.x + 5, this.width - 6), 
                y: Math.max(2, lastRoom.y - 2),
                width: 5, height: 4 
            };
            this.addRoom(room);
            this.connectRooms(lastRoom, room);
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
        // Carve room from the map (fill with floor)
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    this.map[y][x] = this.TILES.FLOOR;
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