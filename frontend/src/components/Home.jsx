/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {API_BASE} from "../config";

function Home() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [newTodo, setNewTodo] = useState("");

  const [editedTodoText, setEditedTodoText] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const token = localStorage.getItem("token");



        setLoading(true);

        const response = await axios.get(
          `${API_BASE}/todo/fetch`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTodos(response.data.todoList || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch todos"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [navigate]);

  const createTodo = async () => {
    try {
      if (!newTodo.trim()) return;

      const response = await axios.post(
        `${API_BASE}/todo/create`,
        { text: newTodo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTodos([...todos, response.data.newTodo]);
      setNewTodo("");
      setError("");
    } catch (err) {
      setError("Failed to create todo");
    }
  };

  const updateTodoStatus = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      if (!todo) return;

      const response = await axios.put(
        `${API_BASE}/todo/update/${id}`,
        { ...todo, isComplete: !todo.isComplete },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTodos(todos.map((t) => (t._id === id ? response.data.todo : t)));
      setError("");
    } catch (err) {
      setError("Failed to update todo status");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(
        `${API_BASE}/todo/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTodos(todos.filter((t) => t._id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete todo");
    }
  };

  const updateTodoText = async (id) => {
    try {
      const todo = todos.find((t) => t._id === id);
      if (!todo || !editedTodoText.trim()) return;

      const response = await axios.put(
        `${API_BASE}/todo/update/${id}`,
        { ...todo, text: editedTodoText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTodos(todos.map((t) => (t._id === id ? response.data.todo : t)));
      setEditedTodoText("");
      setEditingTodoId(null);
      setError("");
    } catch (err) {
      setError("Failed to update todo text");
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      setError("Logout failed");
    }
  };

  const remainingTodos = todos.filter((todo) => !todo.isComplete).length;

  return (
    <div className="mt-4 bg-white shadow-md rounded-lg max-w-lg lg:max-w-xl mx-8 sm:mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-5">
        Todo App
      </h1>

      <div className="flex flex-col sm:flex-row mb-4">
        <input
          type="text"
          placeholder="Add a new Todo"
          value={newTodo}
          className="flex-grow p-3 border border-gray-300 rounded-l-md"
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createTodo()}
        />
        <button
          className="bg-blue-600 text-white px-4 py-3 rounded-md"
          onClick={createTodo}
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md"
          >
            <div className="flex items-center flex-grow">
              <input
                type="checkbox"
                checked={todo.isComplete}
                onChange={() => updateTodoStatus(todo._id)}
                className="mr-3"
              />

              {editingTodoId === todo._id ? (
                <input
                  value={editedTodoText}
                  onChange={(e) => setEditedTodoText(e.target.value)}
                  className="border p-1 flex-grow"
                />
              ) : (
                <span
                  className={
                    todo.isComplete ? "line-through text-gray-400" : ""
                  }
                >
                  {todo.text}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {editingTodoId === todo._id ? (
                <button onClick={() => updateTodoText(todo._id)}>Save</button>
              ) : (
                <button
                  onClick={() => {
                    setEditedTodoText(todo.text);
                    setEditingTodoId(todo._id);
                  }}
                >
                  Edit
                </button>
              )}
              <button onClick={() => deleteTodo(todo._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-sm">
        {remainingTodos} Todos remaining
      </p>

      <button
        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-md mx-auto block"
        onClick={logout}
      >
        Logout
      </button>

      {error && (
        <p className="text-red-500 text-center mt-3">{error}</p>
      )}
    </div>
  );
}

export default Home;
