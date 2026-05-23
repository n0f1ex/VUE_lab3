document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // ЗАДАНИЕ 2: Защита страницы через DOM API
    // ==========================================
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());

    // ==========================================
    // ЗАДАНИЯ 3 и 4: Кликер с сохранением и CPS
    // ==========================================
    const clickBtn = document.getElementById('click-btn');
    const countEl = document.getElementById('click-count');
    const cpsEl = document.getElementById('cps-display');

    // Загрузка из localStorage или инициализация
    let count = parseInt(localStorage.getItem('clickCount')) || 0;
    let startTime = parseInt(localStorage.getItem('clickStartTime')) || Date.now();
    
    // Если время старта не было записано, фиксируем его
    if (!localStorage.getItem('clickStartTime')) {
        localStorage.setItem('clickStartTime', startTime);
    }

    function updateClickerUI() {
        countEl.textContent = count;
        const elapsedSec = (Date.now() - startTime) / 1000;
        const cps = elapsedSec > 0 ? (count / elapsedSec) : 0;
        cpsEl.textContent = cps.toFixed(2);
    }

    updateClickerUI();
    // Обновляем CPS каждую секунду для плавности
    setInterval(updateClickerUI, 1000);

    clickBtn.addEventListener('click', () => {
        count++;
        localStorage.setItem('clickCount', count);
        updateClickerUI();
    });

    // ==========================================
    // ЗАДАНИЯ 5 и 6: Калькулятор (RPN парсер)
    // ==========================================
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('.calc-grid button');

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');
            if (val === 'C') {
                calcDisplay.value = '';
            } else if (val === '=') {
                try {
                    calcDisplay.value = evaluateExpression(calcDisplay.value);
                } catch (e) {
                    calcDisplay.value = 'Error';
                }
            } else {
                calcDisplay.value += val;
            }
        });
    });

    // Вспомогательные функции для RPN
    function tokenize(expr) {
        const tokens = [];
        let i = 0;
        while (i < expr.length) {
            const ch = expr[i];
            if (/\s/.test(ch)) { i++; continue; }
            if (/[0-9.]/.test(ch)) {
                let num = '';
                while (i < expr.length && /[0-9.]/.test(expr[i])) {
                    num += expr[i++];
                }
                tokens.push(Number(num));
            } else if ('+-*/()'.includes(ch)) {
                tokens.push(ch);
                i++;
            } else {
                i++; // Игнорируем неизвестные символы
            }
        }
        return tokens;
    }

    function toRPN(tokens) {
        const output = [];
        const ops = [];
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

        for (let token of tokens) {
            if (typeof token === 'number') {
                output.push(token);
            } else if (token === '(') {
                ops.push(token);
            } else if (token === ')') {
                while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                    output.push(ops.pop());
                }
                ops.pop(); // Удаляем '('
            } else {
                // Оператор
                while (ops.length > 0 && ops[ops.length - 1] !== '(' &&
                       precedence[ops[ops.length - 1]] >= precedence[token]) {
                    output.push(ops.pop());
                }
                ops.push(token);
            }
        }
        while (ops.length > 0) {
            output.push(ops.pop());
        }
        return output;
    }

    function evaluateRPN(rpn) {
        const stack = [];
        for (let token of rpn) {
            if (typeof token === 'number') {
                stack.push(token);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                if (a === undefined || b === undefined) throw new Error('Invalid');
                switch (token) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/':
                        if (b === 0) throw new Error('Division by 0');
                        stack.push(a / b); break;
                    default: throw new Error('Unknown op');
                }
            }
        }
        if (stack.length !== 1) throw new Error('Invalid expr');
        return stack[0];
    }

    function evaluateExpression(expr) {
        if (!expr.trim()) return '';
        const tokens = tokenize(expr);
        const rpn = toRPN(tokens);
        const result = evaluateRPN(rpn);
        // Округляем до 4 знаков, чтобы избежать проблем с плавающей точкой (0.1 + 0.2)
        return parseFloat(result.toFixed(4));
    }
});