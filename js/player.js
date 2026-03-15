/**
 * Dungeon Runner - Player Class
 */

export class Player {
    constructor(charClass) {
        this.charClass = charClass;
        
        // Starting position
        this.x = 0;
        this.y = 0;
        
        // Class-based stats
        const classStats = {
            warrior: {
                hp: 180, mp: 30, attack: 25, defense: 20, speed: 8, luck: 10,
                skillName: 'Shield Bash', skillDesc: 'Deal 150% damage and reduce enemy attack'
            },
            mage: {
                hp: 80, mp: 150, attack: 35, defense: 5, speed: 10, luck: 8,
                skillName: 'Fireball', skillDesc: 'Deal 200% magic damage to all enemies in range'
            },
            rogue: {
                hp: 120, mp: 60, attack: 30, defense: 10, speed: 15, luck: 25,
                skillName: 'Backstab', skillDesc: 'Deal 250% damage from behind'
            }
        };
        
        const stats = classStats[charClass];
        
        this.maxHp = stats.hp;
        this.hp = stats.hp;
        this.maxMp = stats.mp;
        this.mp = stats.mp;
        this.gold = 0;
        
        this.stats = {
            attack: stats.attack,
            defense: stats.defense,
            speed: stats.speed,
            luck: stats.luck
        };
        
        this.level = 1;
        this.xp = 0;
        this.xpToLevel = 100;
        
        this.isDefending = false;
        this.leveledUp = false;
        
        this.skillName = stats.skillName;
        this.skillDesc = stats.skillDesc;
        this.skillCooldown = 0;
        this.maxSkillCooldown = 5;
    }
    
    get attack() {
        // Attack scales with level
        return Math.floor(this.stats.attack * (1 + (this.level - 1) * 0.1));
    }
    
    gainXp(amount) {
        this.xp += amount;
        
        while (this.xp >= this.xpToLevel) {
            this.xp -= this.xpToLevel;
            this.levelUp();
        }
    }
    
    levelUp() {
        this.level++;
        this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
        
        // Increase stats
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.maxMp += 10;
        this.mp = this.maxMp;
        
        this.stats.attack += 3;
        this.stats.defense += 2;
        this.stats.speed += 1;
        this.stats.luck += 1;
        
        this.leveledUp = true;
        
        // Reduce skill cooldown on level up
        this.skillCooldown = Math.max(0, this.skillCooldown - 2);
    }
    
    useSkill() {
        if (this.skillCooldown > 0) {
            return { success: false, message: `Skill on cooldown (${this.skillCooldown} turns)` };
        }
        
        this.skillCooldown = this.maxSkillCooldown;
        
        switch(this.charClass) {
            case 'warrior':
                return { 
                    success: true, 
                    message: `Used ${this.skillName}! Defensive stance for next turn.`,
                    effect: 'defend'
                };
            case 'mage':
                return { 
                    success: true, 
                    message: `Casted ${this.skillName}! Magical power!`,
                    effect: 'magic'
                };
            case 'rogue':
                return { 
                    success: true, 
                    message: `Used ${this.skillName}! Ready for a critical strike!`,
                    effect: 'crit'
                };
        }
        
        return { success: false, message: 'No skill available' };
    }
    
    render(ctx, tileSize) {
        const x = this.x * tileSize;
        const y = this.y * tileSize;
        
        // Draw player based on class
        ctx.font = `${tileSize - 4}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let emoji = '🧙';
        if (this.charClass === 'warrior') emoji = '⚔️';
        else if (this.charClass === 'rogue') emoji = '🗡️';
        
        // Background glow
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.beginPath();
        ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Player emoji
        ctx.fillText(emoji, x + tileSize/2, y + tileSize/2);
        
        // Health indicator
        const hpPercent = this.hp / this.maxHp;
        if (hpPercent < 0.3) {
            ctx.font = '12px serif';
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('⚠️', x + tileSize - 8, y + 8);
        }
    }
}