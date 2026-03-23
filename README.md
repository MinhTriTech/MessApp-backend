# MessApp Backend

Backend cho ứng dụng nhắn tin thời gian thực, được xây dựng bằng **Node.js**, **Express**, **Socket.IO** và **PostgreSQL**.

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Tính năng](#tính-năng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Cấu trúc cơ sở dữ liệu](#cấu-trúc-cơ-sở-dữ-liệu)
- [API Endpoints](#api-endpoints)
- [Socket Events](#socket-events)
- [Chạy ứng dụng](#chạy-ứng-dụng)

---

## Giới thiệu

MessApp Backend cung cấp các API REST và kết nối WebSocket để hỗ trợ ứng dụng nhắn tin thời gian thực. Người dùng có thể đăng ký, đăng nhập, tạo cuộc trò chuyện và gửi/nhận tin nhắn tức thì.

---

## Công nghệ sử dụng

| Công nghệ     | Mô tả                                          |
|---------------|------------------------------------------------|
| Node.js       | Môi trường chạy JavaScript phía máy chủ       |
| Express.js v5 | Framework xây dựng REST API                   |
| Socket.IO     | Giao tiếp thời gian thực hai chiều (WebSocket)|
| PostgreSQL    | Hệ quản trị cơ sở dữ liệu quan hệ            |
| bcrypt        | Mã hóa mật khẩu                               |
| jsonwebtoken  | Xác thực người dùng bằng JWT                  |
| dotenv        | Quản lý biến môi trường                        |
| nodemon       | Tự động khởi động lại server khi phát triển   |

---

## Tính năng

- Đăng ký và đăng nhập tài khoản với mật khẩu được mã hóa (bcrypt)
- Xác thực người dùng bằng JSON Web Token (JWT)
- Tạo cuộc trò chuyện riêng giữa hai người dùng
- Gửi và nhận tin nhắn theo thời gian thực qua Socket.IO
- Lấy lịch sử tin nhắn của một cuộc trò chuyện
- Lưu trữ dữ liệu bền vững với PostgreSQL

---

## Cấu trúc thư mục

```
MessApp-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Cấu hình kết nối PostgreSQL
│   ├── controllers/
│   │   ├── authController.js     # Xử lý đăng ký, đăng nhập
│   │   └── messageController.js  # Xử lý lấy tin nhắn
│   ├── models/
│   │   ├── message.model.js      # Thao tác dữ liệu tin nhắn
│   │   └── user.model.js         # Thao tác dữ liệu người dùng
│   ├── routes/
│   │   └── messageRoutes.js      # Định nghĩa các route tin nhắn
│   ├── sockets/
│   │   └── socket.js             # Xử lý các sự kiện Socket.IO
│   └── index.js                  # Điểm khởi động ứng dụng
├── .gitignore
├── package.json
└── README.md
```

---

## Cài đặt

### Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/) >= 13

### Các bước cài đặt

1. **Clone repository:**

   ```bash
   git clone https://github.com/MinhTriTech/MessApp-backend.git
   cd MessApp-backend
   ```

2. **Cài đặt các gói phụ thuộc:**

   ```bash
   npm install
   ```

3. **Tạo file `.env`** ở thư mục gốc và điền các biến môi trường (xem phần [Biến môi trường](#biến-môi-trường)).

4. **Tạo cơ sở dữ liệu PostgreSQL** và chạy các câu lệnh SQL trong phần [Cấu trúc cơ sở dữ liệu](#cấu-trúc-cơ-sở-dữ-liệu).

---

## Biến môi trường

Tạo file `.env` ở thư mục gốc với nội dung:

```env
PORT=3000

DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=messapp
DB_PASSWORD=your_db_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_char_google_app_password
```

| Biến          | Mô tả                              |
|---------------|------------------------------------|
| `PORT`        | Cổng mà server lắng nghe           |
| `DB_USER`     | Tên người dùng PostgreSQL           |
| `DB_HOST`     | Địa chỉ host của PostgreSQL         |
| `DB_NAME`     | Tên cơ sở dữ liệu                   |
| `DB_PASSWORD` | Mật khẩu PostgreSQL                 |
| `DB_PORT`     | Cổng PostgreSQL (mặc định: `5432`) |
| `JWT_SECRET`  | Khóa bí mật để ký JWT token        |
| `EMAIL_USER`  | Gmail dùng để gửi mail xác minh    |
| `EMAIL_APP_PASSWORD` | Google App Password (16 ký tự) cho Gmail SMTP |

> Lưu ý: Gmail SMTP không chấp nhận mật khẩu đăng nhập tài khoản Google thông thường. Cần bật 2-Step Verification và tạo **App Password** để dùng cho `EMAIL_APP_PASSWORD`.

---

## Cấu trúc cơ sở dữ liệu

Chạy các câu lệnh SQL sau để khởi tạo cơ sở dữ liệu:

```sql
CREATE TABLE users (
    id        SERIAL PRIMARY KEY,
    email     VARCHAR(255) UNIQUE,
    password  VARCHAR(255),
    name      VARCHAR(255)
);

CREATE TABLE conversations (
    id         SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id INTEGER REFERENCES conversations(id),
    user_id         INTEGER REFERENCES users(id),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    sender_id       INTEGER REFERENCES users(id),
    content         TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Tin nhắn

| Phương thức | Đường dẫn                        | Mô tả                                     |
|-------------|----------------------------------|-------------------------------------------|
| `GET`       | `/messages/:conversationId`      | Lấy toàn bộ tin nhắn của một cuộc trò chuyện (sắp xếp theo thời gian tăng dần) |

#### Ví dụ phản hồi `GET /messages/:conversationId`

```json
[
  {
    "id": 1,
    "conversation_id": 10,
    "sender_id": 2,
    "content": "Xin chào!",
    "created_at": "2024-01-01T08:00:00.000Z"
  }
]
```

> **Lưu ý:** Các endpoint đăng ký (`/auth/register`) và đăng nhập (`/auth/login`) được định nghĩa trong `authController.js` và cần được gắn thêm route tương ứng trong `index.js`.

---

## Socket Events

Ứng dụng sử dụng **Socket.IO** để xử lý nhắn tin thời gian thực.

### Sự kiện từ Client gửi lên Server

| Sự kiện              | Dữ liệu (payload)                              | Mô tả                                                                 |
|----------------------|------------------------------------------------|-----------------------------------------------------------------------|
| `start_conversation` | `{ userId, targetId }`                         | Bắt đầu hoặc tìm cuộc trò chuyện giữa hai người dùng                |
| `join_conversation`  | `conversationId, user`                         | Tham gia vào phòng của một cuộc trò chuyện và tạo user nếu chưa có  |
| `send_message`       | `{ conversation_id, sender_id, content }`      | Gửi tin nhắn mới trong một cuộc trò chuyện                           |

### Sự kiện từ Server gửi xuống Client

| Sự kiện               | Dữ liệu (payload)         | Mô tả                                                       |
|-----------------------|---------------------------|-------------------------------------------------------------|
| `conversation_ready`  | `{ conversationId }`      | Thông báo ID cuộc trò chuyện sau khi khởi tạo thành công   |
| `receive_message`     | Đối tượng tin nhắn đã lưu | Phát tin nhắn mới đến tất cả thành viên trong phòng         |

---

## Chạy ứng dụng

### Chế độ phát triển (tự động reload)

```bash
npm run dev
```

### Chế độ production

```bash
node src/index.js
```

Server sẽ khởi động tại: `http://localhost:<PORT>`
