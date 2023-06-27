INSERT INTO departments (name)
VALUES ('Marketing'),
       ('Finance'),
       ('HR'),
       ('Engineering');

INSERT INTO roles (title, salary, department_id)
VALUES ('Marketing Head', 70000, 1),
       ('Marketing Asst', 35000, 1),
       ('Accountant', 55000, 2),
       ('Financial Analyst', 60000, 2),
       ('HR Manager', 75000, 3),
       ('HR Coordinator', 40000, 3),
       ('Software Engineer', 90000, 4),
       ('QA Analyst', 50000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('Emma', 'Wilson', 1, NULL),
       ('Daniel', 'Thompson', 2, 1),
       ('Isabella', 'Hernandez', 3, 2),
       ('James', 'Liu', 4, 1),
       ('Ava', 'Rodriguez', 5, 3);
