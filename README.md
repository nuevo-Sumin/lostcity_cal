# Lost City Score Calculator

A simple web application to calculate scores for the Lost City board game.

## How to Use

1. **Open the application**: Double-click on `index.html` to open it in your web browser
2. **Select your cards**: For each expedition (Red, Yellow, Green, Blue, Purple):
   - **Check the boxes** for the card numbers you have (2-10)
   - **Enter investment cards** (0-3)
3. **Calculate**: Click the "Calculate Score" button to see your final score

## Scoring Rules

- **Expedition Score**: For each expedition, you need at least 2 cards to score points
- **Card Values**: Each card has a value from 2-10, and you sum all the card values
- **Penalty**: -20 points for each expedition
- **Investment Multiplier**: Investment cards multiply your expedition score by (investment + 1)
  - 1 investment = ×2 multiplier
  - 2 investments = ×3 multiplier
  - 3 investments = ×4 multiplier
- **Bonus**: Get 20 bonus points for having 8 or more total cards (including investment cards) - applied AFTER investment multiplier

## Example

If you have:
- Red Expedition: cards 2,3,5,7 (4 cards, sum = 17) + 1 investment
- Score = (17 + 0 bonus - 20 penalty) × 2 = (-3) × 2 = -6 points

If you have 8+ total cards:
- Yellow Expedition: cards 2,3,4,5,6,7,8,9 (8 cards, sum = 44) + 0 investment
- Score = (44 - 20 penalty) + 20 bonus = 24 + 20 = 44 points

- Red Expedition: cards 2,3,4,5,6 (5 cards, sum = 20) + 3 investment = 8 total
- Score = (20 - 20 penalty) × 4 + 20 bonus = 0 × 4 + 20 = 20 points

## Features

- ✅ Beautiful, responsive design
- ✅ Input validation
- ✅ Real-time score calculation
- ✅ Detailed score breakdown
- ✅ Mobile-friendly interface
- ✅ No internet connection required

## Files

- `index.html` - The main application file
- `README.md` - This documentation file

## How to Deploy

Simply upload the `index.html` file to any web hosting service, or open it locally in any modern web browser. No server setup required!
