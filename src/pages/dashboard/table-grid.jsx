import { useEffect, useRef } from 'react';
import interact from 'interactjs';

const elements = [
  { content: 'Table 1', color: 'lightblue', type: 'square' },
  { content: 'Table 2', color: 'skyblue', type: 'round' },
  { content: 'Table 3', color: 'gray', type: 'rectangle' },
];

const TableGrid = () => {
  const elementsRefs = useRef([]);

  useEffect(() => {
    elementsRefs.current.forEach((ref) => {
      if (ref) {
        interact(ref)
          .draggable({
            listeners: { move: dragMoveListener },
            inertia: false,
            modifiers: [
              // Restrict movement to the white area initially
              interact.modifiers.restrictRect({
                restriction: '.white-area', // Initial restriction to white area
                endOnly: true,
              }),
              interact.modifiers.snap({
                targets: [interact.snappers.grid({ x: 10, y: 10 })],
                range: Infinity,
                relativePoints: [{ x: 0, y: 0 }],
              }),
            ],
          });
      }
    });

    // Set up the pink area as a dropzone
    interact('.pink-area').dropzone({
      ondragenter(event) {
        const target = event.relatedTarget;
        // Increase the size of the element when it enters the pink area
        target.style.width = '120px';
        target.style.height = target.style.height === '50px' ? '80px' : '120px';

        // Remove restriction so elements can be dragged freely into the pink area
        interact(target).draggable({
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: null, // Allow free movement
            }),
          ],
        });
      },
      ondragleave(event) {
        const target = event.relatedTarget;
        // Revert the size of the element when it leaves the pink area
        target.style.width = '80px';
        target.style.height = target.style.height === '80px' ? '50px' : '80px';

        // Re-apply restriction to the white area when it leaves the pink area
        interact(target).draggable({
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: '.white-area', // Restrict back to the white area
              endOnly: true,
            }),
          ],
        });
      },
    });

    // Clean up interact.js on unmount
    return () => {
      elementsRefs.current.forEach((ref) => {
        if (ref) interact(ref).unset();
      });
      interact('.pink-area').unset(); // Unset the dropzone as well
    };
  }, [elements]);

  const dragMoveListener = (event) => {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  };

  return (
    <div style={{ height: 700, display: 'flex' }}>
      {/* Left Side (White Area) */}
      <div style={{ height: 700, width: 300, backgroundColor: 'white' }} className="white-area">
        {elements.map((element, index) => (
          <div
            key={index}
            ref={(el) => (elementsRefs.current[index] = el)}
            className="resize-drag"
            style={{
              display: 'flex',
              width: '80px',
              height: element.type === 'rectangle' ? '50px' : '80px',
              borderRadius: element.type === 'round' ? '200px' : element.type === 'square' ? '20px' : '30px',
              backgroundColor: element.color || 'lightblue',
              position: 'relative',
              userSelect: 'none',
              marginBottom: '10px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {element.content || `Element ${index + 1}`}
          </div>
        ))}
      </div>
      {/* Right Side (Pink Area) */}
      <div style={{ height: 700, flexGrow: 1, backgroundColor: 'pink' }} className="pink-area"></div>
    </div>
  );
};

export default TableGrid;
