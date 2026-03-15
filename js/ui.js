/**
 * Dungeon Runner - UI Manager
 */

export class UI {
    constructor(game) {
        this.game = game;
        this.maxMessages = 20;
    }
    
    update() {
        const player = this.game.player;
        
        // Header stats
        document.getElementById('header-floor').textContent = `Floor: ${this.game.floor}`;
        document.getElementById('header-gold').textContent = `💰 Gold: ${player.gold}`;
        
        // HP Bar
        const hpPercent = (player.hp / player.maxHp) * 100;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        document.getElementById('hp-text').textContent = `${player.hp}/${player.maxHp}`;
        
        // MP Bar
        const mpPercent = (player.mp / player.maxMp) * 100;
        document.getElementById('mp-bar').style.width = `${mpPercent}%`;
        document.getElementById('mp-text').textContent = `${player.mp}/${player.maxMp}`;
        
        // XP Bar
        const xpPercent = (player.xp / player.xpToLevel) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${player.xp}/${player.xpToLevel}`;
        
        // Stats
        document.getElementById('player-level').textContent = player.level;
        document.getElementById('player-gold').textContent = player.gold;
        
        // Update action buttons
        this.updateActionButtons();
    }
    
    updateActionButtons() {
        const player = this.game.player;
        
        // Skill button
        const skillBtn = document.getElementById('btn-skill');
        const skillText = player.skillCooldown > 0 
            ? `✨ ${player.skillName} (${player.skillCooldown})`
            : `✨ ${player.skillName}`;
        skillBtn.textContent = skillText;
        skillBtn.disabled = player.skillCooldown > 0;
        
        // Descend button - only enable if enemies are dead
        const descendBtn = document.getElementById('btn-descend');
        descendBtn.disabled = this.game.enemies.length > 0;
    }
    
    showMessage(text, type = 'info') {
        const log = document.getElementById('message-log');
        
        const msg = document.createElement('div');
        msg.className = `message ${type}`;
        msg.textContent = text;
        
        log.appendChild(msg);
        
        // Keep only last N messages
        while (log.children.length > this.maxMessages) {
            log.removeChild(log.firstChild);
        }
        
        // Auto-scroll to bottom
        log.scrollTop = log.scrollHeight;
    }
    
    clearMessages() {
        document.getElementById('message-log').innerHTML = '';
    }
}