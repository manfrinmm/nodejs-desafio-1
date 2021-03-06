const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({
      error: "Username is required",
    });
  }

  const userExists = users.find((register) => register.username === username);

  if (!userExists) {
    return response.status(404).json({
      error: "Username not found",
    });
  }
  request.user = userExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const userAlreadyExists = users.find(
    (register) => register.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User already exists",
    });
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const taskIndex = user.todos.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos[taskIndex] = {
    ...user.todos[taskIndex],
    title,
    deadline,
  };

  return response.json(user.todos[taskIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskIndex = user.todos.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos[taskIndex] = {
    ...user.todos[taskIndex],
    done: true,
  };

  return response.json(user.todos[taskIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskIndex = user.todos.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return response.status(404).json({ error: "Task not found" });
  }

  user.todos.splice(taskIndex, 1);

  return response.status(204).json();
});

module.exports = app;
