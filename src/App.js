import React, { useState, useEffect } from "react";
import "./App.css";

// Import für DnD-Kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

// Einzelnes Todo-Item mit Drag-Funktionalität
function SortableItem({ id, todo, toggleDone, deleteTodo }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggleDone = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDone(todo.id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTodo(todo.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={todo.done ? "done" : ""}
    >
      <div className="todo-content" onClick={handleToggleDone}>
        <span>{todo.text}</span>
        <button onClick={handleDelete}>✖</button>
      </div>
    </li>
  );
}

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("alle");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Konfiguriere den PointerSensor mit angepassten Einstellungen
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Mindestdistanz für Drag-Start
      },
    })
  );

  const addTodo = () => {
    if (input.trim() === "") return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: input,
        done: false,
      },
    ]);
    setInput("");
  };

  const toggleDone = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((todo) => todo.id === active.id);
    const newIndex = todos.findIndex((todo) => todo.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      setTodos(arrayMove(todos, oldIndex, newIndex));
    }
  };

  return (
    <div className="App">
      <h1>Meine To-Do's</h1>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Neue Aufgabe..."
        />
        <button onClick={addTodo}>Hinzufügen</button>
      </div>

      <div className="filter-buttons">
        <button onClick={() => setFilter("alle")}>Alle</button>
        <button onClick={() => setFilter("offen")}>Offen</button>
        <button onClick={() => setFilter("erledigt")}>Erledigt</button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={todos.map((todo) => todo.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="todo-list">
            {todos
              .filter((todo) => {
                if (filter === "alle") return true;
                if (filter === "offen") return !todo.done;
                if (filter === "erledigt") return todo.done;
                return true;
              })
              .map((todo) => (
                <SortableItem
                  key={todo.id}
                  id={todo.id}
                  todo={todo}
                  toggleDone={toggleDone}
                  deleteTodo={deleteTodo}
                />
              ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
