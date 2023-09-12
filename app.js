const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const app = express();
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const convertObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  let date = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status, category } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "To Do" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
          data = await db.all(getTodoQuery);
          response.send(
            data.map((eachItem) => convertObjectToResponseObject(eachItem))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "To Do" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`;
          data = await db.all(getTodoQuery);
          response.send(
            data.map((eachItem) => convertObjectToResponseObject(eachItem))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodoQuery = `SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}';`;
          data = await db.all(getTodoQuery);
          response.send(
            data.map((eachItem) => convertObjectToResponseObject(eachItem))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
        data = await db.all(getTodoQuery);
        response.send(
          data.map((eachItem) => convertObjectToResponseObject(eachItem))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(request.query):
      if (status === "To Do" || status === "IN PROGRESS" || status === "DONE") {
        getTodoQuery = `SELECT * FROM todo WHERE status = '${status}';`;
        data = await db.all(getTodoQuery);
        response.send(
          data.map((eachItem) => convertObjectToResponseObject(eachItem))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasSearchProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo like '%${search_q}%';`;
      data = await db.all(getTodoQuery);
      response.send(
        data.map((eachItem) => convertObjectToResponseObject(eachItem))
      );
      break;

    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodoQuery = `SELECT * FROM todo WHERE category = '${category}';`;
        data = await db.all(getTodoQuery);
        response.send(
          data.map((eachItem) => convertObjectToResponseObject(eachItem))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    default:
      getTodoQuery = `SELECT * FROM todo;`;
      data = await db.all(getTodoQuery);
      response.send(
        data.map((eachItem) => convertObjectToResponseObject(eachItem))
      );
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoDetailsQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const getTodoDetails = await db.get(getTodoDetailsQuery);
  response.send(convertObjectToResponseObject(getTodoDetails));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const requestQuery = `SELECT * FROM todo WHERE due_date = '${newDate}';`;
    const responseResult = await db.all(requestQuery);
    response.send(
      responseResult.map((eachItem) => convertObjectToResponseObject(eachItem))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
