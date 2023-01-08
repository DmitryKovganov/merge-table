import { useEffect, useRef, useState } from "react";

import Cell from "./Cell";
import Controls from "./Controls";

import {
  getInitialGrid,
  getCellKey,
  getCellRectangle,
  getRectangleArea,
  getSelectedGrid,
  getMergedGrid,
  getSeparatedGrid,
} from "../../utils/merge-table";

const MergeTable = ({ width, height }) => {
  const [grid, setGrid] = useState(() => getInitialGrid(width, height));
  const [clickedCell, setClickedCell] = useState();
  const [clickedCellKey, setClickedCellKey] = useState();
  const [hoveredCellKey, setHoveredCellKey] = useState();
  const selectedArea = useRef();

  const mouseDownHandler = (event) => {
    const currentCell = getCellRectangle(event);

    if (!currentCell) return;

    const [x, y] = currentCell;
    const currentCellKey = getCellKey(y, x);

    if (clickedCellKey === currentCellKey) return;

    setClickedCell(currentCell);
    setClickedCellKey(currentCellKey);
    setHoveredCellKey(currentCellKey);

    selectArea(currentCell);
  };

  const mouseMoveHandler = (event) => {
    if (!clickedCell) return;

    const currentCell = getCellRectangle(event);

    if (!currentCell) return;

    const [x, y] = currentCell;
    const currentCellKey = getCellKey(y, x);

    if (hoveredCellKey === currentCellKey) return;

    setHoveredCellKey(currentCellKey);

    selectArea(clickedCell, currentCell);
  };

  useEffect(() => {
    const mouseUpHandler = () => {
      setClickedCell();
      setClickedCellKey();
      setHoveredCellKey();
    };

    document.addEventListener("mouseup", mouseUpHandler);

    return () => {
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  }, []);

  const selectArea = (fromCell, toCell = fromCell) => {
    const newSelectedArea = getRectangleArea(fromCell, toCell, grid);
    const newGrid = getSelectedGrid(grid, newSelectedArea);

    selectedArea.current = newSelectedArea;

    setGrid(newGrid);
  };

  const mergeClickHandler = () => {
    if (!selectedArea.current) return;

    const newGrid = getMergedGrid(grid, selectedArea.current);

    setGrid(newGrid);
  };

  const separateClickHandler = () => {
    if (!selectedArea.current) return;

    const newGrid = getSeparatedGrid(grid, selectedArea.current);

    setGrid(newGrid);
  };

  return (
    <div>
      <Controls
        mergeClickHandler={mergeClickHandler}
        separateClickHandler={separateClickHandler}
      />
      <table onMouseDown={mouseDownHandler} onMouseMove={mouseMoveHandler}>
        <tbody>
          {grid.map((gridRow, rowIndex) => (
            <tr key={rowIndex}>
              {gridRow.map((gridCell) => (
                <Cell
                  key={getCellKey(gridCell.rowIndex, gridCell.colIndex)}
                  {...gridCell}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MergeTable;
