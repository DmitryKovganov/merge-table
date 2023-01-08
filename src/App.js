import MergeTable from "./components/MergeTable";
import { getTableSize } from "./utils/merge-table";

import "./styles.css";

export const App = () => {
  const [width, height] = getTableSize();

  return <MergeTable width={width} height={height} />;
};
