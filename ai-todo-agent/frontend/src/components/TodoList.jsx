import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function TodoList({ todos }) {
  // Sort: Incomplete first, then by date
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.is_completed === b.is_completed) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return a.is_completed ? 1 : -1; 
  });

  if (sortedTodos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-700 bg-white/5 p-6 text-center text-gray-400">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm">Tell the AI to create one!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1">
      {/* Added 'index' to the map parameters */}
      {sortedTodos.map((todo, index) => (
        <div
          key={todo.id}
          className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-[1.01]
            ${todo.is_completed 
                ? "bg-gray-900/40 border-green-900/30 opacity-60" 
                : "bg-gray-800/60 border-gray-700 hover:bg-gray-800/80" 
            }`}
        >
          <div>
            {/* Header: Number + Title + Checkbox */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                
                {/* NUMBER BADGE (Shows 1, 2, 3... instead of DB ID) */}
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-inner
                    ${todo.is_completed 
                        ? "bg-gray-800 text-gray-500" 
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"}`}>
                  {index + 1}
                </span>
                
                {/* Title */}
                <h3 className={`text-lg font-semibold tracking-tight ${todo.is_completed ? "line-through text-gray-500" : "text-gray-100"}`}>
                  {todo.title}
                </h3>
              </div>

              {/* Checkbox Icon */}
              <div className={`shrink-0 ${todo.is_completed ? "text-green-500" : "text-gray-500"}`}>
                {todo.is_completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </div>
            </div>

            {/* Description */}
            <p className={`mt-1 ml-10 text-sm leading-relaxed ${todo.is_completed ? "text-gray-600" : "text-gray-400"}`}>
              {todo.description || "No description provided."}
            </p>
          </div>

          {/* Footer: Date */}
          <div className="mt-4 ml-10 flex items-center gap-2 text-xs font-medium text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {new Date(todo.created_at).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}