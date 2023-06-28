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
          console.log('Adding a role');
          break;
        case 'Add an employee':
          console.log('Adding an employee');
          break;
        case 'Update an employee role':
          console.log('Updating an employee role');
          break;
        default:
          return;
      }
  });
}

const viewDepartments = () => {
  db.query(`SELECT * FROM departments`, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask();
  });
}

const viewRoles = () => {
  db.query(`SELECT * FROM roles`, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask();
  });
}

const viewEmployees = () => {
  db.query(`SELECT * FROM employees`, (err, data) => {
    if (err) {
      console.log(err);
    }
    console.table(data);
    ask();
  });
}

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

ask();

