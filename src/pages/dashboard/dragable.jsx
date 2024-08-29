import { useEffect, useRef } from 'react';
import interact from 'interactjs';

const TableOrganizer = () => {
  const dragRef = useRef(null);

  useEffect(() => {
    if (dragRef.current) {
      interact(dragRef.current)
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              const target = event.target;
              let x = (parseFloat(target.getAttribute('data-x')) || 0);
              let y = (parseFloat(target.getAttribute('data-y')) || 0);

              target.style.width = `${event.rect.width}px`;
              target.style.height = `${event.rect.height}px`;

              x += event.deltaRect.left;
              y += event.deltaRect.top;

              target.style.transform = `translate(${x}px, ${y}px)`;

              target.setAttribute('data-x', x);
              target.setAttribute('data-y', y);
              target.textContent = `${Math.round(event.rect.width)}×${Math.round(event.rect.height)}`;
            },
          },
          modifiers: [
            interact.modifiers.restrictEdges({
              outer: 'parent',
            }),
            interact.modifiers.restrictSize({
              min: { width: 100, height: 50 },
            }),
          ],
          inertia: true,
        })
        .draggable({
          listeners: { move: dragMoveListener },
          inertia: true,
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: 'parent',
              endOnly: true,
            }),
          ],
        });
    }

    // Clean up on component unmount
    return () => {
      if (dragRef.current) interact(dragRef.current).unset();
    };
  }, []);

  const dragMoveListener = (event) => {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  };

  return (
    <div
      ref={dragRef}
      className="resize-drag"
      style={{
        width: '100px',
        height: '50px',
        backgroundColor: 'lightblue',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <h1>Heelllo</h1>
      Drag and Resize Me
    </div>
  );
};

export default TableOrganizer;
