import {useEffect, useRef, useState} from "react";
import interact from "interactjs";
import "./css/dashboard.css";
import {RectangleTable, RoundTable} from "./TableDND/tables";

const elements = [
  {content: "Table 1", number: 1, type: "rectangle"},
  {content: "Table 2", number: 2, type: "round"},
  {content: "Table 3", number: 3, type: "rectangle"},
];

const TableGrid = () => {
  const elementsRefs = useRef([]);
  const [isDroppedInPinkArea, setIsDroppedInPinkArea] = useState({}); // Track if elements are dropped in the pink area

  useEffect(() => {
    elementsRefs.current.forEach((ref, index) => {
      if (ref) {
        interact(ref).draggable({
          listeners: {move: dragMoveListener},
          inertia: false,
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: isDroppedInPinkArea[index] ? null : ".main-area", // Restrict to white area if not dropped in pink
              endOnly: true,
            }),
            // interact.modifiers.snap({
            //   targets: [interact.snappers.grid({ x: 10, y: 10 })],
            //   range: Infinity,
            //   relativePoints: [{ x: 0, y: 0 }],
            // }),
          ],
        });
        // // .resizable({
        // //   edges: { left: true, right: true, bottom: true, top: true }, // Allow resizing from all edges
        // //   modifiers: [
        // //     interact.modifiers.restrictSize({
        // //       min: { width: 50, height: 50 },  // Minimum size limit
        // //       max: { width: 200, height: 200 }, // Maximum size limit
        // //     }),
        // //     interact.modifiers.snapSize({
        // //       targets: [interact.snappers.grid({ x: 10, y: 10 })], // Snap the resizing to the grid
        // //       range: Infinity,
        // //     }),
        // //   ],
        // //   listeners: {
        // //     move(event) {
        // //       const target = event.target;
        // //       const x = (parseFloat(target.getAttribute('data-x')) || 0);
        // //       const y = (parseFloat(target.getAttribute('data-y')) || 0);

        // //       // Update the element's style
        // //       target.style.width = `${event.rect.width}px`;
        // //       target.style.height = `${event.rect.height}px`;

        // //       // Translate when resizing from the top or left
        // //       const newX = x + event.deltaRect.left;
        // //       const newY = y + event.deltaRect.top;

        // //       target.style.transform = `translate(${newX}px, ${newY}px)`;

        // //       target.setAttribute('data-x', newX);
        // //       target.setAttribute('data-y', newY);
        // //     }
        // //   }
        // });
      }
    });
    // Make the whole pink area a dropzone
    interact(".pink-area").dropzone({
      accept: ".resize-drag", // Accept draggable elements
      overlap: 0.5, // Elements need to overlap by 50% to be considered dropped

      ondrop(event) {
        const target = event.relatedTarget;
        const index = elementsRefs.current.indexOf(target);

        // Increase the size of the element when it's dropped in the pink area
        target.style.width = "120px";
        target.style.height = target.style.height === "50px" ? "80px" : "120px";

        // Update state to track that this element is now in the pink area
        setIsDroppedInPinkArea((prev) => ({...prev, [index]: true}));
      },

      ondragleave(event) {
        const target = event.relatedTarget;
        const index = elementsRefs.current.indexOf(target);

        // Revert the size when the element is dragged out of the pink area
        target.style.width = "80px";
        target.style.height = target.style.height === "80px" ? "50px" : "80px";

        // Update state to track that this element is no longer in the pink area
        setIsDroppedInPinkArea((prev) => ({...prev, [index]: false}));
      },
    });

    // Clean up interact.js on unmount
    return () => {
      elementsRefs.current.forEach((ref) => {
        if (ref) interact(ref).unset();
      });
      interact(".pink-area").unset();
    };
  }, [elements, isDroppedInPinkArea]);

  const dragMoveListener = (event) => {
    const target = event.target;
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  };

  return (
    <div className="main-area" style={{height: 700, display: "flex"}}>
      {/* Left Side (White Area) */}
      <div
        style={{height: 700, width: 300, backgroundColor: "white"}}
        className="white-area">
        {elements.map((element, index) => (
          <>
            <RoundTable
              key={index}
              myref={(el) => (elementsRefs.current[index] = el)}
              cssclass="resize-drag"
              type={element.type}
              tableNumber={element?.number}
            />
            {/* <RectangleTable 
            key={index}
            myref={(el) => (elementsRefs.current[index] = el)}
            cssclass="resize-drag"
            type={element.type}
          /> */}
          </>
        ))}
      </div>
      {/* Right Side (Pink Area) */}
      <div style={{height: 700, flexGrow: 1}} className="pink-area grid-container"></div>
    </div>
  );
};

export default TableGrid;
