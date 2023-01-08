export const getTableSize = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const width = +urlParams.get("width") || 1;
  const height = +urlParams.get("height") || 1;

  return [width, height];
};

const generateEmptyGrid = (width, height) => {
  return Array(height)
    .fill(null)
    .map(() => Array(width).fill(null));
};

export const getCellKey = (rowIndex, colIndex) => `${rowIndex}_${colIndex}`;

export const getInitialGrid = (width, height) => {
  const grid = generateEmptyGrid(width, height);

  return grid.map((row, rowIndex) =>
    row.map((_, colIndex) => ({
      rowIndex,
      colIndex,
      selected: false,
      colSpan: 1,
      rowSpan: 1,
    }))
  );
};

export const getCellRectangle = (event) => {
  const td = event.target.closest("td");

  if (!td) return null;

  const fromX = +td.getAttribute("data-col-index");
  const fromY = +td.getAttribute("data-row-index");
  const toX = fromX + +td.getAttribute("colSpan") - 1;
  const toY = fromY + +td.getAttribute("rowSpan") - 1;

  return [fromX, fromY, toX, toY];
};

export const getOriginalRectangleArea = (
  [fromX1, fromY1, toX1, toY1],
  [fromX2, fromY2, toX2, toY2]
) => {
  return [
    Math.min(fromX1, fromX2),
    Math.min(fromY1, fromY2),
    Math.max(toX1, toX2),
    Math.max(toY1, toY2),
  ];
};

const fillOutsideBorderIndexes = (
  cell,
  currentArea,
  topCellIndexesOutsideBorder,
  rightCellIndexesOutsideBorder,
  bottomCellIndexesOutsideBorder,
  leftCellIndexesOutsideBorder,
) => {
  const [fromX, fromY, toX, toY] = currentArea;

  if (cell.colIndex < fromX) {
    leftCellIndexesOutsideBorder.push(cell.colIndex);
  }

  if (cell.colIndex + cell.colSpan - 1 > toX) {
    rightCellIndexesOutsideBorder.push(cell.colIndex + cell.colSpan - 1);
  }

  if (cell.rowIndex < fromY) {
    topCellIndexesOutsideBorder.push(cell.rowIndex);
  }

  if (cell.rowIndex + cell.rowSpan - 1 > toY) {
    bottomCellIndexesOutsideBorder.push(cell.rowIndex + cell.rowSpan - 1);
  }
}

const getRecalculatedArea = (
  currentArea,
  topCellIndexesOutsideBorder,
  rightCellIndexesOutsideBorder,
  bottomCellIndexesOutsideBorder,
  leftCellIndexesOutsideBorder,
) => {
  const [fromX, fromY, toX, toY] = currentArea;

  const newFromX = Math.min(fromX, ...leftCellIndexesOutsideBorder);
  const newFromY = Math.min(fromY, ...topCellIndexesOutsideBorder);
  const newToX = Math.max(toX, ...rightCellIndexesOutsideBorder);
  const newToY = Math.max(toY, ...bottomCellIndexesOutsideBorder);

  return [newFromX, newFromY, newToX, newToY];
}

export const getRectangleArea = (fromCell, toCell, grid) => {
  let area = getOriginalRectangleArea(fromCell, toCell);

  let isAreaChanged = true;

  while (isAreaChanged) {
    let topCellIndexesOutsideBorder = [];
    let rightCellIndexesOutsideBorder = [];
    let bottomCellIndexesOutsideBorder = [];
    let leftCellIndexesOutsideBorder = [];

    let isPrevRowSelected = false;
    let isPrevColSelected = false;

    // after bottom border
    for (
      let i = 0;
      i < grid.length && !(i && isPrevRowSelected && !isPrevColSelected);
      i++
    ) {
      const row = grid[i];

      isPrevColSelected = false;

      for (let j = 0; j < row.length; j++) {
        const cell = row[j];

        const isCurrentCellSelected = isCellInArea(cell, area);

        if (!isCurrentCellSelected) {
          // before left border
          if (!isPrevColSelected) continue;

          // after right border
          break;
        }

        isPrevRowSelected = isPrevColSelected = isCurrentCellSelected;

        fillOutsideBorderIndexes(
          cell,
          area,
          topCellIndexesOutsideBorder,
          topCellIndexesOutsideBorder,
          bottomCellIndexesOutsideBorder,
          leftCellIndexesOutsideBorder
        );
      }
    }

    isAreaChanged =
      topCellIndexesOutsideBorder.length ||
      rightCellIndexesOutsideBorder.length ||
      bottomCellIndexesOutsideBorder.length ||
      leftCellIndexesOutsideBorder.length;

    if (!isAreaChanged) continue;

    area = getRecalculatedArea(
      area,
      topCellIndexesOutsideBorder,
      topCellIndexesOutsideBorder,
      bottomCellIndexesOutsideBorder,
      leftCellIndexesOutsideBorder
    );
  }

  return area;
};

const isCellInArea = (cell, selectedArea) => {
  const [fromX, fromY, toX, toY] = selectedArea;

  return (
    cell.colIndex + cell.colSpan - 1 >= fromX &&
    cell.colIndex <= toX &&
    cell.rowIndex + cell.rowSpan - 1 >= fromY &&
    cell.rowIndex <= toY
  );
};

export const getSelectedGrid = (grid, selectedArea) => {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      selected: isCellInArea(cell, selectedArea)
    }))
  );
}

export const getMergedGrid = (grid, selectedArea) => {
  const newGrid = generateEmptyGrid(0, grid.length);
  const [fromX, fromY, toX, toY] = selectedArea;

  let merged = false;

  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    for (let j = 0; j < row.length; j++) {
      const cell = row[j];

      if (!merged && cell.selected) {
        newGrid[fromY].push({
          rowIndex: fromY,
          colIndex: fromX,
          selected: true,
          rowSpan: toY - fromY + 1,
          colSpan: toX - fromX + 1,
        });

        merged = true;
      }

      if (cell.selected) {
        continue;
      }

      newGrid[i].push({
        ...cell,
      });
    }
  }

  return newGrid;
}

const insertDefaultSelectedCells = (grid, rowIndex, colIndex, count, insertFrom) => {
  grid[rowIndex].splice(
    insertFrom > -1 ? insertFrom : grid[rowIndex].length,
    0,
    ...Array(count).fill(null)
    .map((_, offset) => ({
      rowIndex,
      colIndex: colIndex + offset,
      selected: true,
      rowSpan: 1,
      colSpan: 1,
    }))
  );
}

const insertMissedCells = (grid, selectedArea, rowIndex) => {
  const [fromX, fromY, toX, toY] = selectedArea;

  if (rowIndex >= fromY && rowIndex <= toY) {
    const currentRow = grid[rowIndex];
    const insertFrom = currentRow.findIndex(cell => cell.colIndex > toX);

    let leftBorderColIndex = 0;

    if (insertFrom === -1) {
      leftBorderColIndex = currentRow.length;
    } else if (insertFrom > 0) {
      leftBorderColIndex = currentRow[insertFrom - 1].colIndex + 1
    }

    const cellsToInsertCount = toX - fromX + 1;

    insertDefaultSelectedCells(grid, rowIndex, leftBorderColIndex, cellsToInsertCount, insertFrom);

    return true;
  }

  return false;
}

export const getSeparatedGrid = (grid, selectedArea) => {
  const newGrid = generateEmptyGrid(0, grid.length);
  const [fromX, , toX] = selectedArea;
  const cellsToInsertCount = toX - fromX + 1;

  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    let rowSeparated = false;

    for (let j = 0; j < row.length; j++) {
      const cell = row[j];

      if (!rowSeparated && cell.selected) {
        insertDefaultSelectedCells(newGrid, i, j, cellsToInsertCount);
        rowSeparated = true;

        continue;
      }

      if (cell.selected) continue;

      newGrid[i].push({
        ...cell,
      });
    }

    !rowSeparated && insertMissedCells(newGrid, selectedArea, i);
  }

  return newGrid;
}
