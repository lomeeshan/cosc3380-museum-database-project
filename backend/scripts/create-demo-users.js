require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db/connection');

const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 12) {
  console.error('Set DEMO_PASSWORD (12+ characters) in backend/.env');
  process.exit(1);
}

(async () => {
  const connection = await db.getConnection();
  const users = [
    ['admin_demo', 'Admin', 'Morgan', 'Admin', 1],
    ['curator_demo', 'Curator', 'Casey', 'Curator', 2],
    ['sales_demo', 'Sales Staff', 'Sam', 'Sales', 3]
  ];

  try {
    await connection.beginTransaction();

    for (const [username, role, first, last, department] of users) {
      let [[roleRow]] = await connection.execute(
        'SELECT RoleID FROM USER_ROLE WHERE RoleName = ? LIMIT 1', [role]
      );
      if (!roleRow) {
        const [result] = await connection.execute(
          'INSERT INTO USER_ROLE(RoleName, RoleDescription) VALUES (?, ?)',
          [role, 'Demo ' + role + ' role']
        );
        roleRow = { RoleID: result.insertId };
      }

      const [accounts] = await connection.execute(
        'SELECT AccountID FROM EMPLOYEE_ACCOUNT WHERE Username = ?', [username]
      );
      if (accounts.length) {
        console.log('Account already exists: ' + username);
        continue;
      }

      const [employee] = await connection.execute(
        `INSERT INTO EMPLOYEE
         (DepartmentID, FirstName, LastName, JobTitle, HireDate, Email, EmploymentStatus)
         VALUES (?, ?, ?, ?, CURRENT_DATE(), ?, 'Active')`,
        [department, first, last, role, username + '@example.test']
      );
      const hash = await bcrypt.hash(password, 12);
      await connection.execute(
        `INSERT INTO EMPLOYEE_ACCOUNT
         (EmployeeID, RoleID, Username, PasswordHash, AccountStatus, CreatedDateTime)
         VALUES (?, ?, ?, ?, 'Active', NOW())`,
        [employee.insertId, roleRow.RoleID, username, hash]
      );
      console.log('Created ' + username);
    }

    // These demo assignments make finalized Query 2 return results.
    // Run database/seed.sql first so exhibitions already exist.
    const [exhibitions] = await connection.execute(
      'SELECT ExhibitionID FROM EXHIBITION ORDER BY ExhibitionID LIMIT 2'
    );

    for (const [username, exhibitionIndex, assignmentRole] of [
      ['curator_demo', 0, 'Exhibition Curator'],
      ['admin_demo', 1, 'Exhibition Coordinator']
    ]) {
      if (!exhibitions[exhibitionIndex]) continue;
      const [accounts] = await connection.execute(
        'SELECT EmployeeID FROM EMPLOYEE_ACCOUNT WHERE Username = ?', [username]
      );
      if (!accounts.length) continue;
      await connection.execute(
        `INSERT IGNORE INTO EMPLOYEE_WORKSON_EXHIBITION
         (EmployeeID, ExhibitionID, AssignmentRole) VALUES (?, ?, ?)`,
        [accounts[0].EmployeeID, exhibitions[exhibitionIndex].ExhibitionID, assignmentRole]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await db.end();
  }
})();
