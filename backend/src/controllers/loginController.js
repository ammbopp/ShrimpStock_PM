// loginController.js
const connection = require('../db/database'); // การเชื่อมต่อกับฐานข้อมูล MySQL

class LoginController {
  static login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'โปรดกรอกข้อมูล' });
    }

    const query = 'SELECT * FROM employees WHERE username = ? AND password = ?';
    connection.query(query, [username, password], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      }

      const user = results[0];
      let redirectUrl;

      // กำหนด redirectUrl ตามตำแหน่งของผู้ใช้
      switch (user.employee_position) {
        case 'worker':
          redirectUrl = '/worker/home';
          break;
        case 'academic':
          redirectUrl = '/academic/home';
          break;
        case 'clerical':
          redirectUrl = '/clerical/home';
          break;
        case 'keeper':
          redirectUrl = '/keeper/home';
          break;
        default:
          return res.status(400).json({ message: 'ตำแหน่งไม่ถูกต้อง' });
      }

      return res.status(200).json({
        success: true,
        redirectUrl,
        employee_id: user.employee_id,
        employee_fname: user.employee_fname,
        employee_lname: user.employee_lname,
        employee_position: user.employee_position,
        employee_age: user.employee_age,
        employee_sex: user.employee_sex,
        employee_salary: user.employee_salary,
        employee_address: user.employee_address,
        employee_image: user.employee_image
      });
    });
  }
}

module.exports = LoginController;
