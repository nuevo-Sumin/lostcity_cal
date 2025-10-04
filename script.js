// Global variables
let selectedColors = [];
let currentLanguage = 'kr';
let scoreHistory = [];

// Language detection and initialization
function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    currentLanguage = browserLang.startsWith('ko') ? 'kr' : 'en';
    setLanguage(currentLanguage);
}

// Set language for all elements
function setLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with language attributes
    document.querySelectorAll('[data-kr][data-en]').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    // Update player name input placeholder
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
        playerNameInput.placeholder = lang === 'kr' ? '이름을 입력하세요' : 'Enter your name';
    }
    
    // Update language button active state
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    
    // Re-render leaderboard if it exists
    if (scoreHistory.length > 0) {
        displayLeaderboard();
    }
}

// Switch language
function switchLanguage(lang) {
    setLanguage(lang);
}

// Color selection (multi-select)
function selectColor(color) {
    const colorIndex = selectedColors.indexOf(color);
    
    if (colorIndex === -1) {
        // Add color
        selectedColors.push(color);
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        document.querySelector(`.expedition[data-color="${color}"]`).style.display = 'block';
    } else {
        // Remove color
        selectedColors.splice(colorIndex, 1);
        document.querySelector(`[data-color="${color}"]`).classList.remove('active');
        document.querySelector(`.expedition[data-color="${color}"]`).style.display = 'none';
    }
}

// Calculate score
function calculateScore() {
    // Hide previous results and errors
    document.getElementById('results').classList.remove('show');
    document.getElementById('error-message').classList.remove('show');

    // Check if at least one color is selected
    if (selectedColors.length === 0) {
        const errorMsg = currentLanguage === 'kr' ? 
            '최소 하나의 색상을 선택해주세요.' : 
            'Please select at least one color.';
        showError(errorMsg);
        return;
    }

    // Get target score cards
    const targetCards = parseInt(document.getElementById('target-cards').value) || 0;

    // Prepare expeditions data
    const expeditions = [];
    const colorNames = { red: '❤️', yellow: '💛', green: '💚', blue: '💙', purple: '💜' };
    
    for (let color of selectedColors) {
        const wagerCards = parseInt(document.getElementById(`${color}-wager`).value) || 0;
        expeditions.push({
            name: colorNames[color],
            color: color,
            wagerCards: wagerCards
        });
    }

    // Validate wager cards
    for (let exp of expeditions) {
        if (exp.wagerCards < 0 || exp.wagerCards > 3) {
            const errorMsg = currentLanguage === 'kr' ? 
                `${exp.name} 탐험의 연구 카드 개수가 잘못되었습니다. 0-3 사이의 값을 입력해주세요.` :
                `Invalid Wager Cards for ${exp.name} expedition. Must be 0-3.`;
            showError(errorMsg);
            return;
        }
    }

    // Check if each selected color has cards or wager cards
    for (let exp of expeditions) {
        let hasCards = false;
        for (let i = 2; i <= 10; i++) {
            const checkbox = document.getElementById(`${exp.color}-${i}`);
            if (checkbox && checkbox.checked) {
                hasCards = true;
                break;
            }
        }
        
        if (!hasCards && exp.wagerCards === 0) {
            const errorMsg = currentLanguage === 'kr' ? 
                `${exp.name} 탐험에 카드나 연구카드가 선택되지 않았습니다.` :
                `No cards or Wager Cards selected for ${exp.name} expedition.`;
            showError(errorMsg);
            return;
        }
    }

    // Calculate scores
    let totalScore = 0;
    let breakdown = [];

    for (let exp of expeditions) {
        let expeditionScore = 0;
        let cardCount = 0;
        let cardSum = 0;
        
        // Get checked cards
        const checkedCards = [];
        for (let i = 2; i <= 10; i++) {
            const checkbox = document.getElementById(`${exp.color}-${i}`);
            if (checkbox && checkbox.checked) {
                checkedCards.push(i);
                cardCount++;
                cardSum += i;
            }
        }
        
        if (cardCount > 0) {
            // Lost Cities scoring formula:
            // 1. Sum of card values
            expeditionScore = cardSum;
            
            // 2. Expedition penalty -20
            expeditionScore -= 20;
            
            // 3. Apply wager card multiplier (wager cards + 1)
            if (exp.wagerCards > 0) {
                expeditionScore *= (exp.wagerCards + 1);
            }
            
            // 4. Bonus +20 for 8+ cards (including wager cards)
            if (cardCount + exp.wagerCards >= 8) {
                expeditionScore += 20;
            }
        } else if (exp.wagerCards > 0) {
            // Only wager cards, no number cards:
            // Each wager card costs -20, then apply multiplier
            expeditionScore = -20 * exp.wagerCards;
            expeditionScore *= (exp.wagerCards + 1);
        }

        breakdown.push({
            name: exp.name,
            cards: cardCount,
            cardSum: cardSum,
            wagerCards: exp.wagerCards,
            score: expeditionScore
        });

        totalScore += expeditionScore;
    }

    // Calculate target score cards (independent of colors, 10 points each)
    const targetScore = targetCards * 10;
    
    // Total calculation: all expedition scores + target score cards
    const expeditionTotal = totalScore;
    const finalTotal = expeditionTotal + targetScore;

    // Display results
    displayResults(breakdown, expeditionTotal, targetCards, targetScore, finalTotal);
}

// Display results
function displayResults(breakdown, expeditionTotal, targetCards, targetScore, finalTotal) {
    const breakdownDiv = document.getElementById('score-breakdown');
    const totalDiv = document.getElementById('total-score');
    
    let breakdownHTML = '';
    
    for (let exp of breakdown) {
        if (exp.cards > 0 || exp.wagerCards > 0) {
            let bonusText = '';
            if (exp.cards + exp.wagerCards >= 8) {
                bonusText = currentLanguage === 'kr' ? ' + 20 보너스' : ' + 20 bonus';
            }
            
            const expeditionName = currentLanguage === 'kr' ? 
                `${exp.name} 탐험` : 
                `${exp.name} Expedition`;
            const cardsText = currentLanguage === 'kr' ? '카드' : 'cards';
            const sumText = currentLanguage === 'kr' ? '합계' : 'sum';
            const penaltyText = currentLanguage === 'kr' ? '페널티' : 'penalty';
            const wagerText = currentLanguage === 'kr' ? '연구카드' : 'wager';
            
            breakdownHTML += `
                <div class="score-item">
                    <span><strong>${expeditionName}:</strong> ${exp.cards} ${cardsText} (${sumText}: ${exp.cardSum}) - 20 ${penaltyText}${exp.wagerCards > 0 ? ` × ${exp.wagerCards + 1} (${wagerText})` : ''}${bonusText}</span>
                    <span>${exp.score} pts</span>
                </div>
            `;
        }
    }

    // Show expedition total
    const expeditionText = currentLanguage === 'kr' ? '색상별 점수 합계' : 'Expedition Scores Total';
    breakdownHTML += `
        <div class="score-item" style="border-top: 2px solid #28a745; margin-top: 10px; padding-top: 10px;">
            <span><strong>${expeditionText}:</strong></span>
            <span>${expeditionTotal} pts</span>
        </div>
    `;

    // Show target score cards if any
    if (targetCards > 0) {
        const targetText = currentLanguage === 'kr' ? '목표점수 카드 (색상과 별개)' : 'Target Score Cards (Independent)';
        const targetDesc = currentLanguage === 'kr' ? `${targetCards}개 × 10점` : `${targetCards} × 10 points`;
        breakdownHTML += `
            <div class="score-item">
                <span><strong>${targetText}:</strong> ${targetDesc}</span>
                <span>${targetScore} pts</span>
            </div>
        `;
    }

    breakdownDiv.innerHTML = breakdownHTML;
    const totalText = currentLanguage === 'kr' ? '최종 총점' : 'Final Total Score';
    totalDiv.innerHTML = `🏆 ${totalText}: ${finalTotal} points`;
    
    // Add to history
    const playerName = document.getElementById('player-name').value.trim() || 
                      (currentLanguage === 'kr' ? '익명' : 'Anonymous');
    addToHistory(playerName, finalTotal);
    
    document.getElementById('results').classList.add('show');
}

// Add score to history
function addToHistory(playerName, score) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString(currentLanguage === 'kr' ? 'ko-KR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    scoreHistory.push({
        player: playerName,
        score: score,
        timestamp: timestamp,
        rawTime: now.getTime()
    });
    
    // Sort by score (highest first), then by time (earliest first for ties)
    scoreHistory.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.rawTime - b.rawTime;
    });
    
    // Keep only top 10
    if (scoreHistory.length > 10) {
        scoreHistory = scoreHistory.slice(0, 10);
    }
    
    displayLeaderboard();
}

// Display leaderboard
function displayLeaderboard() {
    if (scoreHistory.length === 0) {
        document.getElementById('leaderboard').style.display = 'none';
        return;
    }
    
    const leaderboardList = document.getElementById('leaderboard-list');
    let html = '';
    
    scoreHistory.forEach((entry, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
        
        html += `
            <div class="leaderboard-item ${rankClass}">
                <div class="rank-number">${medal || rank}</div>
                <div class="player-name">${entry.player}</div>
                <div class="score-value">${entry.score}</div>
                <div class="timestamp">${entry.timestamp}</div>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
    document.getElementById('leaderboard').style.display = 'block';
}

// Clear history
function clearHistory() {
    if (confirm(currentLanguage === 'kr' ? 
        '모든 점수 기록을 삭제하시겠습니까?' : 
        'Are you sure you want to clear all score history?')) {
        scoreHistory = [];
        document.getElementById('leaderboard').style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Clear all inputs
function clearAll() {
    // Clear all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Clear all number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
        input.style.borderColor = '#dee2e6';
    });
    
    // Note: Player name is intentionally NOT cleared so users don't have to re-enter
    // Uncomment the line below if you want to clear player name too:
    // document.getElementById('player-name').value = '';
    
    // Clear target cards
    document.getElementById('target-cards').value = '';
    
    // Hide results
    document.getElementById('results').classList.remove('show');
    document.getElementById('error-message').classList.remove('show');
    
    // Clear color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hide all expeditions
    document.querySelectorAll('.expedition').forEach(expedition => {
        expedition.style.display = 'none';
    });
    
    // Clear selected colors array
    selectedColors = [];
}

// Input validation for number fields
document.addEventListener('DOMContentLoaded', function() {
    // Detect and set language
    detectLanguage();
    
    // Color button event listeners
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectColor(this.dataset.color);
        });
    });
    
    // Language button event listeners
    document.getElementById('lang-kr').addEventListener('click', function() {
        switchLanguage('kr');
    });
    document.getElementById('lang-en').addEventListener('click', function() {
        switchLanguage('en');
    });
    
    // Input validation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            const value = parseInt(this.value);
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            
            if (this.value !== '' && (value < min || value > max)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#dee2e6';
            }
        });
    });
    
    // Enter key support
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateScore();
            }
        });
    });
});