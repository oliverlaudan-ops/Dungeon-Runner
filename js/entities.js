/**
 * Dungeon Runner - Entities (Enemies & Items)
 */

export class Enemy {
    constructor(x, y, type, floor) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.floor = floor;
        
        const baseStats = ENEMY_TYPES[type];
        
        // Scale with floor
        const scale = 1 + (floor - 1) * 0.15;
        
        this.name = baseStats.name;
        this.hp = Math.floor(baseStats.hp * scale);
        this.maxHp = this.hp;
        this.attack = Math.floor(baseStats.attack * scale);
        this.defense = Math.floor(baseStats.defense * scale);
        this.gold = Math.floor(baseStats.gold * scale);
        this.xp = Math.floor(baseStats.xp * scale);
        this.range = baseStats.range;
        this.emoji = baseStats.emoji;
    }
    
    render(ctx, tileSize) {
        const px = this.x * tileSize;
        const py = this.y * tileSize;
        
        // Background
        ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
        ctx.beginPath();
        ctx.arc(px + tileSize/2, py + tileSize/2, tileSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Enemy emoji
        ctx.font = `${tileSize - 4}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, px + tileSize/2, py + tileSize/2);
        
        // Health bar
        const hpPercent = this.hp / this.maxHp;
        const barWidth = tileSize - 4;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(px + 2, py + tileSize - 6, barWidth, 4);
        
        ctx.fillStyle = hpPercent > 0.5 ? '#e74c3c' : '#c0392b';
        ctx.fillRect(px + 2, py + tileSize - 6, barWidth * hpPercent, 4);
    }
}

// Enemy definitions
export const ENEMY_TYPES = {
    rat: {
        name: 'Giant Rat',
        hp: 15,
        attack: 5,
        defense: 2,
        gold: 5,
        xp: 10,
        range: 1,
        emoji: '🐀'
    },
    slime: {
        name: 'Slime',
        hp: 25,
        attack: 4,
        defense: 3,
        gold: 8,
        xp: 12,
        range: 1,
        emoji: '🟢'
    },
    skeleton: {
        name: 'Skeleton',
        hp: 30,
        attack: 8,
        defense: 5,
        gold: 12,
        xp: 15,
        range: 1,
        emoji: '💀'
    },
    goblin: {
        name: 'Goblin',
        hp: 40,
        attack: 12,
        defense: 8,
        gold: 18,
        xp: 22,
        range: 1,
        emoji: '👺'
    },
    spider: {
        name: 'Giant Spider',
        hp: 35,
        attack: 15,
        defense: 6,
        gold: 20,
        xp: 25,
        range: 2,
        emoji: '🕷️'
    },
    orc: {
        name: 'Orc Warrior',
        hp: 60,
        attack: 18,
        defense: 12,
        gold: 30,
        xp: 35,
        range: 1,
        emoji: '👹'
    },
    bat: {
        name: 'Vampire Bat',
        hp: 25,
        attack: 20,
        defense: 4,
        gold: 15,
        xp: 20,
        range: 1,
        emoji: '🦇'
    },
    troll: {
        name: 'Cave Troll',
        hp: 100,
        attack: 25,
        defense: 15,
        gold: 50,
        xp: 50,
        range: 1,
        emoji: '🧌'
    },
    wolf: {
        name: 'Dire Wolf',
        hp: 55,
        attack: 22,
        defense: 10,
        gold: 35,
        xp: 40,
        range: 1,
        emoji: '🐺'
    },
    demon: {
        name: 'Fire Demon',
        hp: 80,
        attack: 30,
        defense: 18,
        gold: 75,
        xp: 70,
        range: 2,
        emoji: '👿'
    },
    dragon: {
        name: 'Dungeon Dragon',
        hp: 200,
        attack: 40,
        defense: 25,
        gold: 200,
        xp: 150,
        range: 2,
        emoji: '🐉'
    }
};

// Item definitions
export const ITEMS = {
    weapons: [
        { name: 'Iron Sword', attack: 5, rarity: 'common' },
        { name: 'Steel Sword', attack: 10, rarity: 'uncommon' },
        { name: 'Flame Sword', attack: 15, rarity: 'rare' },
        { name: 'Frost Blade', attack: 18, rarity: 'rare' },
        { name: 'Dragon Slayer', attack: 30, rarity: 'legendary' }
    ],
    armor: [
        { name: 'Leather Armor', defense: 5, rarity: 'common' },
        { name: 'Chain Mail', defense: 10, rarity: 'uncommon' },
        { name: 'Plate Armor', defense: 15, rarity: 'rare' },
        { name: 'Dragon Scale', defense: 25, rarity: 'legendary' }
    ],
    potions: [
        { name: 'Health Potion', type: 'health', value: 30 },
        { name: 'Greater Health Potion', type: 'health', value: 60 },
        { name: 'Mana Potion', type: 'mana', value: 30 },
        { name: 'Greater Mana Potion', type: 'mana', value: 60 }
    ]
};