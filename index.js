const mysql = require('mysql2');
const inquirer = require('inquirer');

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'corissa',
    database: 'employees_db'
  },
  console.log('Connected to employees_db database. 👩🏼‍💻')
)

// list of options
const options = [
  {
    type: 'list',
    name: 'option',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Quit'
    ]
  },
];

// starts asking questions then runs funcs depending on option chosen
const ask = () => {
  inquirer.prompt(options)
  .then((data) => {
      switch(data.option) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployee();
          break;
        default:
          process.exit(); // quit option = terminates program
      }
  });
}

// displays departments
const viewDepartments = () => {
  db.query(`SELECT * FROM departments`, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask(); // runs ask() again, do this after every function until we quit
  });
}

// displays roles complete with department name
const viewRoles = () => {
  const query = `
    SELECT roles.id, roles.title, departments.name, roles.salary
    FROM roles
    JOIN departments ON departments.id = roles.department_id
  `;
  db.query(query, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask();
  });
}

// views employees and a bunch of info about their department and manager
const viewEmployees = () => {
  const query = `
  SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employees
  JOIN roles ON employees.role_id = roles.id
  JOIN departments ON roles.department_id = departments.id
  LEFT JOIN employees AS manager ON employees.manager_id = manager.id
  `;
  db.query(query, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask();
  });
}

// adds user input as new department to database
const addDepartment = () => {
  const question = [
    {
      type: 'input',
      name: 'dept',
      message: 'Please name a department to add.'
    }
  ]
  inquirer.prompt(question)
    .then((input) => {
      db.query(`INSERT INTO departments (name) VALUES (?)`, input.dept, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(`Added ${input.dept} to the database. 🤖⚡️`);
        ask();
      });
    });
}

// adds new role using user input
const addRole = async () => {
  const questions = [
    {
      type: 'input',
      name: 'role',
      message: 'Please name a role to add.'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary (USD) of this role?'
    },
    {
      type: 'list',
      name: 'department',
      message: 'Which department does this role belong to?',
      choices: async function() { // func for grabbing and listing department names
        const depts = await db.promise().query(`SELECT name FROM departments`);
        const departmentNames = depts[0].map((row) => row.name);
        return departmentNames;
      },
    },
  ]
  inquirer.prompt(questions).then(async (input) => {
    const query = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;
    const deptId = await getDepartmentId(input.department);
    const args = [input.role, input.salary, deptId];
    db.query(query, args, (err, result) => {
      if (err) {
         console.log(err);
      }
      console.log(`Added ${input.role} to the database. 🤖⚡️`);
      ask();
    });
  })
}

// adds new employee to database using user input
const addEmployee = async () => {
  const questions = [
    {
      type: 'input',
      name: 'firstname',
      message: "What is the employee's first name?",
    },
    {
      type: 'input',
      name: 'lastname',
      message: "What is the employee's last name?",
    },
    {
      type: 'list',
      name: 'role',
      message: "What is the employee's role?",
      choices: async function() { // grabs list of roles
        const roles = await db.promise().query(`SELECT title FROM roles`);
        const roleNames = roles[0].map((row) => row.title);
        return roleNames;
      },
    },
    {
      type: 'list',
      name: 'manager',
      message: "Who is the employee's manager?",
      choices: async function() { // grabs all existing employees
        const managers = await db.promise().query(`SELECT * FROM employees`);
        const managerChoices = managers[0].map((row) => ({
          name: `${row.first_name} ${row.last_name}`,
          value: row.id // displays first + last name of employee but actual value to be used is employee id
        }));
        managerChoices.unshift({
          name: 'None', // simply adds none to list of employee names
          value: null
        });
        return managerChoices;
      },
    }
  ]
  inquirer.prompt(questions).then(async (input) => {
    const query = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
    const roleId = await getRoleId(input.role);
    const args = [input.firstname, input.lastname, roleId, input.manager];
    db.query(query, args, (err, result) => {
      if (err) {
         console.log(err);
      }
      console.log(`Added ${input.firstname} ${input.lastname} to the database. 🤖⚡️`);
      ask();
    });
  })
}

// updates employee role
const updateEmployee = async () => {
  const questions = [
    {
      type: 'list',
      name: 'employee',
      message: "Which employee's role do you want to update?",
      choices: async function() {
        const employees = await db.promise().query(`SELECT * FROM employees`);
        const employeeChoices = employees[0].map((row) => ({
          name: `${row.first_name} ${row.last_name}`,
          value: row.id
        }));
        return employeeChoices;
      },
    },
    {
      type: 'list',
      name: 'role',
      message: "Which role do you want to assign to this employee?",
      choices: async function() {
        const roles = await db.promise().query(`SELECT title FROM roles`);
        const roleNames = roles[0].map((row) => row.title);
        return roleNames;
      },
    },
  ];
  inquirer.prompt(questions).then(async (input) => {
    const roleId = await getRoleId(input.role);
    const employeeId = input.employee;
    const query = `UPDATE employees SET role_id = ${roleId} WHERE id = ${employeeId}`;
    db.query(query, (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log("Updated employee's role 🤖⚡️");
      ask();
    })
  })
}

// helper func to get department id
const getDepartmentId = async (department) => {
  const query = `SELECT id FROM departments WHERE name = ?`;
  const [rows] = await db.promise().query(query, [department]);
  if (rows.length > 0) {
    return rows[0].id;
  } else {
    return null;
  }
}

// helper func to get role id
const getRoleId = async (title) => {
  const query = `SELECT id FROM roles WHERE title = ?`;
  const [rows] = await db.promise().query(query, [title]);
  if (rows.length > 0) {
    return rows[0].id;
  } else {
    return null;
  }
}

// basically init function
ask();