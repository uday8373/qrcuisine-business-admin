import React, {useState} from "react";
import Draggable from "react-draggable";

const initialTables = [
  {
    id: "table-1",
    name: "Table 1",
    x: 0,
    y: 0,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6937/6937721.png",
  },
  {
    id: "table-2",
    name: "Table 2",
    x: 100,
    y: 0,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6937/6937721.png",
  },
  {
    id: "table-3",
    name: "Table 3",
    x: 200,
    y: 0,
    imageUrl: "https://cdn-icons-png.flaticon.com/512/6937/6937721.png",
  },
];

const TableOrganizer = () => {
  const [tables, setTables] = useState(initialTables);

  const handleDrag = (e, position, id) => {
    const {x, y} = position;
    setTables((prevTables) =>
      prevTables.map((table) => (table.id === id ? {...table, x, y} : table)),
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        border: "2px solid #ccc",
        position: "relative",
        overflow: "hidden",
      }}>
      {tables.map((table) => (
        <Draggable
          key={table.id}
          position={{x: table.x, y: table.y}}
          onDrag={(e, position) => handleDrag(e, position, table.id)}>
          <div
            style={{
              position: "absolute",
              cursor: "move",
            }}>
            <img
              src={table.imageUrl}
              alt={table.name}
              style={{width: "100px", height: "100px"}}
            />
          </div>
        </Draggable>
      ))}
    </div>
  );
};
export default TableOrganizer;
