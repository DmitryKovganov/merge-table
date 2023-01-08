import { memo } from "react";

const Cell = memo(({ selected, rowIndex, colIndex, colSpan, rowSpan }) => {
  return (
    <td
      data-selected={selected}
      data-row-index={rowIndex}
      data-col-index={colIndex}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      row: {rowIndex} col: {colIndex}
    </td>
  );
});

export default Cell;
