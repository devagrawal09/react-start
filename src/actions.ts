"use server";

export interface Todo {
  text: string;
  completed: boolean;
}

const todos: Todo[] = [
  {
    text: "Hello",
    completed: false,
  },
];

export async function sayHello() {
  console.log("Hello from the server");
  return "Hello from the client";
}

export async function getTodos() {
  return todos;
}
