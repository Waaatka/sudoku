class Cell {
    row
    column
    possibleValues
    originalValue
    _currentPossibleIndex = 0
    originalMatrix
    constructor(row, column, originalValue, originalMatrix) {
        this.row = row
        this.column = column
        this.originalValue = originalValue
        this.originalMatrix = originalMatrix
        if (originalValue === 0) {
            this.possibleValues = this.getPossibleValues()
        }
    }

    get currentValue() {
        return this.originalValue > 0 ? this.originalValue : (this.possibleValues[this._currentPossibleIndex] || 0)
    }

    get isSolved() {
        return this.originalValue > 0
    }

    nextPossibleValue() {
        this._currentPossibleIndex++
        if (this._currentPossibleIndex >= this.possibleValues.length) {
            return 0
        }
        return this.currentValue
    }

    reset() {
        this._currentPossibleIndex = 0
    }

    getPossibleValues() {
        const set = new Set( [1,2,3,4,5,6,7,8,9])
        this.getColumn().forEach(x => set.delete(x))
        this.getRow().forEach(x => set.delete(x))
        this.getSmallBox().forEach(x => set.delete(x))

        return Array.from(set)
    }

    getSmallBox() {
        const rowBounds = getSmallBoxBounds(this.row)
        const columnBounds = getSmallBoxBounds(this.column)
        const result = []
        for (let i = rowBounds[0]; i <= rowBounds[1] ; i++) {
            for (let j = columnBounds[0]; j <= columnBounds[1]; j++) {
                result.push(this.originalMatrix[i][j])
            }
        }
        return result
    }

    getRow() {
        return this.originalMatrix[this.row]
    }

    getColumn() {
        return this.originalMatrix.map((_, i) => this.originalMatrix[i][this.column])
    }

    isValid() {
        const row = this.getRow().filter(x => x !== 0);
        if (row.length !== new Set(row).size) {
            return false
        }
        const column = this.getColumn().filter(x => x !== 0);
        if (column.length !== new Set(column).size) {
            return false
        }
        const smallBox = this.getSmallBox().filter(x => x !== 0);
        return smallBox.length === new Set(smallBox).size;
    }
}


const createBoard = (matrix) => {
    const board = []
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            board.push(new Cell(i, j, matrix[i][j], matrix))
        }
    }
    return board
}

const getNextUnknownIndex = (board, currentIndex) => {
    for(let i = currentIndex + 1; i < board.length; i++) {
        if (!board[i].isSolved) {
            return i
        }
    }
}

const getPrevUnknownIndex = (board, currentIndex) => {
    for(let i = currentIndex - 1; i >= 0; i--) {
        if (!board[i].isSolved) {
            return i
        }
    }
}

const getSmallBoxBounds = (coord) => {
    if (coord >= 0 && coord < 3) {
        return [0, 2]
    }
    if (coord >= 3 && coord < 6) {
        return [3, 5]
    }
    if (coord >= 6 && coord < 9) {
        return [6, 8]
    }
}

module.exports = function solveSudoku(matrix) {
    const board = createBoard(matrix)
    let currentIndex = getNextUnknownIndex(board, -1)
    while (typeof currentIndex !== 'undefined') {
        const cell = board[currentIndex]
        matrix[cell.row][cell.column] = cell.currentValue
        cell.nextPossibleValue()
        while (!cell.isValid() && matrix[cell.row][cell.column] !== 0) {
            matrix[cell.row][cell.column] = cell.currentValue
            cell.nextPossibleValue()
        }
        if (matrix[cell.row][cell.column] === 0) {
            cell.reset()
            currentIndex = getPrevUnknownIndex(board, currentIndex)
        } else {
            currentIndex = getNextUnknownIndex(board, currentIndex)
        }

    }
    return matrix
}
