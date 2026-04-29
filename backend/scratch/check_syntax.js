const fs = require('fs');
const content = fs.readFileSync('src/services/aiService.js', 'utf-8');

function checkBalance(text) {
    const stack = [];
    const open = '{[(';
    const close = '}])';
    const pairs = { '}': '{', ']': '[', ')': '(' };
    let backticks = 0;
    let inBackticks = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '`') {
            // Very basic check, doesn't handle escaping or ${}
            inBackticks = !inBackticks;
            backticks++;
        }
        if (!inBackticks) {
            if (open.includes(char)) {
                stack.push({char, line: text.substring(0, i).split('\n').length});
            } else if (close.includes(char)) {
                const top = stack.pop();
                if (!top || top.char !== pairs[char]) {
                    console.log(`Mismatch: found ${char} at line ${text.substring(0, i).split('\n').length}, expected ${top ? pairs[top.char] : 'nothing'}`);
                }
            }
        }
    }
    console.log('Final stack:', stack);
    console.log('Backticks count:', backticks);
}

checkBalance(content);
