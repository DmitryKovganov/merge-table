const Controls = ({ mergeClickHandler, separateClickHandler }) => {
  return (
    <div className="controls">
      <button data-merge-button onClick={mergeClickHandler}>
        Merge
      </button>
      <button data-separate-button onClick={separateClickHandler}>
        Separate
      </button>
    </div>
  );
};

export default Controls;
