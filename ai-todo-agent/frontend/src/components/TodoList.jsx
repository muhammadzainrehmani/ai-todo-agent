import { CheckCircle, Circle, Clock } from "lucide-react";

export default function TodoList({ todos }) {
  if (!todos || todos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-500">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm">Tell the AI to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {todos.map((todo, index) => (
        <div
          key={todo.id}
          className={`relative flex flex-col justify-between rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
            todo.is_completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
          }`}
        >
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* UPDATED: Shows Index + 1 (e.g., 1, 2, 3) instead of DB ID */}
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                  {index + 1}
                </span>
                <h3
                  className={`font-semibold ${
                    todo.is_completed ? "text-green-800 line-through" : "text-gray-800"
                  }`}
                >
                  {todo.title}
                </h3>
              </div>
              {todo.is_completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {todo.description || "No description provided."}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(todo.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
