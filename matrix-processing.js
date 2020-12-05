const MATRIX_ERR = `Exception caught: IllegalArgumentException. Can't read matrix.`;
const EXPRESSION_ERR = `Exception caught: IllegalArgumentException. Can't read operations.`;
const MULTIPLICATION_ERR = `Exception caught: IllegalArgumentException. Can't perform multiplication.`;

const additionOrSubtractionMatrix = (first, second, operator) => {
    const operation = operator === '+' ? 'addition' : 'subtraction';
    const rows = first.length;
    const columns = first[0].length;
    const rowsSecond = second.length;
    const columnsSecond = second[0].length;
    if (rows !== rowsSecond || columns !== columnsSecond) {
        throw `Exception caught: IllegalArgumentException. Can't perform ${operation}.`;
    } 
    const result = [];
    for (let i = 0; i < rows; i++) {
        result[i] = [];
        for (let j = 0; j < columns; j++) {
            if (operator === '+') {
                result[i][j] = first[i][j] + second[i][j];
            } else {
                result[i][j] = first[i][j] - second[i][j];
            }
        }
     }
    return result;
}

const multiplicationMatrix = (first, second) => {
    const rowsFirst = first.length;
    const columnsfirst = first[0].length;
    const rowsSecond = second.length;
    const columnsSecond = second[0].length;
    const result = [];
    if (columnsfirst != rowsSecond) throw MULTIPLICATION_ERR;
    for (let i = 0; i < rowsFirst; i++) {
        result[i] = [];
    }
    for (let k = 0; k < columnsSecond; k++) {
        for (let i = 0; i < rowsFirst; i++) {
            let matrixElement = 0;
            for (let j = 0; j < rowsSecond; j++) {
                matrixElement += first[i][j] * second[j][k];
            }
          result[i][k] = matrixElement;
        }
    }
    return result;
}

const formatMatrix = matrix => {
    const format = matrix.reduce((arr, curVal) => {
        const newCurVal = curVal.map(el => ` ${el}`);
        return [...arr, newCurVal, [';']];
    }, []);
    format.pop();
    format[0][0] = `${parseInt(format[0][0])}`;
    const formatToString = `[${format.join('')}]`.replace(/[,]/g, '');
    return formatToString;
}

const validation = input => {
    const arrOfLines = input.trim().split('\n');
    if (arrOfLines.indexOf('') !== arrOfLines.length - 2) {
        throw MATRIX_ERR;
    }
    const arrOfMatrix = arrOfLines.slice(0, arrOfLines.length - 2);
    const arrOfOperands = arrOfMatrix.map(el => el[0]);
    const uniqueOperands = [...new Set(arrOfOperands)];
    arrOfMatrix.forEach(el => {
        const newEl = el.replace(/\s+/g, '').trim();
        if (!/^[A-Z]=\[([\w\s]?-?\d+(\w\s|;|))+\]$/g.test(newEl)) {
            throw MATRIX_ERR;
        } else if (newEl[newEl.length - 2] === ';') {
            throw MATRIX_ERR;
        } else if (/[a-z]/g.test(newEl)) {
            throw MATRIX_ERR;
        } else if (arrOfOperands.length !== uniqueOperands.length) {
            throw MATRIX_ERR;
        }
    })
    const expression = arrOfLines[arrOfLines.length - 1].replace(/\s+/g, '');
    const arrOfExpression = expression.split(/[+]|[*]|[-]/g);
    arrOfExpression.forEach(el => {
        if (!arrOfOperands.includes(el)) {
            throw EXPRESSION_ERR;
        }
    })
    if (arrOfExpression.length === 1) {
        return arrOfMatrix.find(el => el[0] === arrOfExpression[0]);
    } else if (!/^([A-Z]([*+-]?))+[A-Z]$/.test(expression)) {
        throw EXPRESSION_ERR;
    } else if (arrOfExpression.some(el => el.length > 1)) {
        throw EXPRESSION_ERR;
    }
}

const matrixJugglery = input => {
    const isOneOperand = validation(input);
    const arrOfLines = input.trim().split('\n');
    const expression = arrOfLines[arrOfLines.length - 1].replace(/\s+/g, '');
    if (isOneOperand) {
        return isOneOperand;
    }
    const arrOfMatrix = arrOfLines.slice(0, arrOfLines.length - 2);
    const objOfMatrix = arrOfMatrix.reduce((obj, key) => {
        const newKey = key
            .replace(/\s+/g, ' ')
            .trim()
            .slice(3, key.length - 1)
            .split('; ')
            .map(el => el.replace(/\s+/g, ',').split(',').map(el => parseInt(el)).filter(el => el === el));
        return {
            ...obj,
            [key[0]]: newKey,
        };
    }, {});
    let arrOfExpression = expression.split('');
    if (/[*]/.test(expression)) {
        let indexOfFirstMultiplication = arrOfExpression.indexOf('*');
        let count = 0;
        objOfMatrix[count] = multiplicationMatrix(
            objOfMatrix[arrOfExpression[indexOfFirstMultiplication - 1]],
            objOfMatrix[arrOfExpression[indexOfFirstMultiplication + 1]]
        );
        arrOfExpression.splice(indexOfFirstMultiplication - 1, 3, count);
        while (arrOfExpression.includes('*')) {
            count++;
            indexOfFirstMultiplication = arrOfExpression.indexOf('*');
            objOfMatrix[count] = multiplicationMatrix(
                objOfMatrix[arrOfExpression[indexOfFirstMultiplication - 1]],
                objOfMatrix[arrOfExpression[indexOfFirstMultiplication + 1]]
            );
            arrOfExpression.splice(indexOfFirstMultiplication - 1, 3, count);
        }
        if (arrOfExpression.length === 1) return formatMatrix(objOfMatrix[count]);
    }
    const arrOfOperators = arrOfExpression.filter(el => el === '+' || el === '-');
    const arrOfOperands = arrOfExpression.filter(el => el !== '+' && el !== '-');
    let counter = 0;
    let resultNoMultiplication = additionOrSubtractionMatrix(
        objOfMatrix[arrOfOperands[counter]],
        objOfMatrix[arrOfOperands[counter + 1]],
        arrOfOperators[counter]
    );
    for (let i = 0; i < arrOfOperators.length - 1; i++) {
        counter++;
        resultNoMultiplication = additionOrSubtractionMatrix(
            resultNoMultiplication,
            objOfMatrix[arrOfOperands[counter + 1]],
            arrOfOperators[counter]
        );
    }
    return formatMatrix(resultNoMultiplication);
}

const fileProcessor = () => {
    const fs = require("fs");
    if (fs.existsSync("pub01.out")) {
        fs.unlinkSync("pub01.out")
    }
    if (fs.existsSync("pub01.err")) {
        fs.unlinkSync("pub01.err")
    }
    const input = fs.readFileSync("pub01.in").toString();
    try {
        fs.appendFileSync("pub01.out", matrixJugglery(input));
    } catch (err) {
        fs.appendFileSync("pub01.err", err);
    }
}

fileProcessor();