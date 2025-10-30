const bcrypt = require('bcrypt');

// Đổi 'password123' thành mật khẩu bạn muốn dùng để đăng nhập
const myPassword = 'password123'; 
const saltRounds = 10; // Giống trong authController.js

async function createHash() {
  try {
    const hash = await bcrypt.hash(myPassword, saltRounds);

    console.log('==================================================');
    console.log('Mật khẩu của bạn:', myPassword);
    console.log('\nChuỗi hash (Copy toàn bộ dòng này vào DB):');
    console.log(hash);
    console.log('==================================================');

  } catch (err) {
    console.error('Lỗi khi tạo hash:', err);
  }
}

createHash();