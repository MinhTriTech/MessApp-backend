<div align="center">

<!-- Banner / Logo -->
<img src="docs/images/bannerBackend.png" alt="MessApp Banner" width="30%" />

</div>

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

MessApp Backend cung cấp các API REST và kết nối WebSocket để hỗ trợ ứng dụng nhắn tin thời gian thực. Người dùng có thể đăng ký, đăng nhập, xác minh email, tạo cuộc trò chuyện, gửi/nhận tin nhắn và file tức thì.

---

## Công nghệ sử dụng

| Công nghệ      | Mô tả                                           |
|----------------|-------------------------------------------------|
| Node.js        | Môi trường chạy JavaScript phía máy chủ        |
| Express.js v5  | Framework xây dựng REST API                    |
| Socket.IO v4   | Giao tiếp thời gian thực hai chiều (WebSocket) |
| PostgreSQL      | Hệ quản trị cơ sở dữ liệu quan hệ             |
| bcrypt         | Mã hóa mật khẩu                                |
| jsonwebtoken   | Xác thực người dùng bằng JWT                   |
| nodemailer     | Gửi email xác minh tài khoản                   |
| multer         | Xử lý upload file (avatar, file tin nhắn)      |
| dotenv         | Quản lý biến môi trường                         |
| nodemon        | Tự động khởi động lại server khi phát triển    |

---

## Tính năng

- Đăng ký và đăng nhập tài khoản với mật khẩu được mã hóa (bcrypt)
- Xác thực người dùng bằng JSON Web Token (JWT)
- Xác minh email qua link gửi qua Gmail SMTP
- Cập nhật tên và avatar người dùng
- Tìm kiếm người dùng theo tên hoặc email
- Tạo cuộc trò chuyện riêng giữa hai người dùng
- Gửi và nhận tin nhắn văn bản theo thời gian thực qua Socket.IO
- Gửi và nhận file đính kèm qua REST API + Socket.IO
- Phân trang tin nhắn theo cursor (cursor-based pagination)
- Thông báo trạng thái đang gõ (typing indicator)
- Đánh dấu tin nhắn đã đọc (mark as seen)
- Lưu trữ dữ liệu bền vững với PostgreSQL

---

## Cấu trúc thư mục

```
MessApp-backend/
├── src/
│   ├── config/
│   │   └── db.js                         # Cấu hình kết nối PostgreSQL
│   ├── controllers/
│   │   ├── authController.js             # Xử lý đăng ký, đăng nhập, xác minh email, cập nhật profile
│   │   ├── conversationController.js     # Xử lý tạo và lấy danh sách cuộc trò chuyện
│   │   ├── messageController.js          # Xử lý lấy tin nhắn và upload file
│   │   └── userController.js             # Xử lý tìm kiếm và lấy thông tin người dùng
│   ├── middleware/
│   │   ├── authMiddleware.js             # Xác thực JWT cho các route được bảo vệ
│   │   └── uploadMiddleware.js           # Cấu hình multer cho upload avatar và file tin nhắn
│   ├── models/
│   │   ├── conversation.model.js         # Truy vấn dữ liệu cuộc trò chuyện
│   │   ├── message.model.js              # Truy vấn dữ liệu tin nhắn
│   │   └── user.model.js                 # Truy vấn dữ liệu người dùng
│   ├── routes/
│   │   ├── authRoutes.js                 # Các route xác thực
│   │   ├── conversationRoutes.js         # Các route cuộc trò chuyện
│   │   ├── messageRoutes.js              # Các route tin nhắn
│   │   └── userRoutes.js                 # Các route người dùng
│   ├── sockets/
│   │   └── socket.js                     # Xử lý các sự kiện Socket.IO
│   └── index.js                          # Điểm khởi động ứng dụng
├── uploads/
│   ├── avatars/                          # Thư mục lưu avatar người dùng
│   └── messages/                         # Thư mục lưu file tin nhắn
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
PORT=8000

DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=messapp
DB_PASSWORD=your_db_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_google_app_password
```

| Biến          | Mô tả                                         |
|---------------|-----------------------------------------------|
| `PORT`        | Cổng mà server lắng nghe                      |
| `DB_USER`     | Tên người dùng PostgreSQL                      |
| `DB_HOST`     | Địa chỉ host của PostgreSQL                    |
| `DB_NAME`     | Tên cơ sở dữ liệu                              |
| `DB_PASSWORD` | Mật khẩu PostgreSQL                            |
| `DB_PORT`     | Cổng PostgreSQL (mặc định: `5432`)            |
| `JWT_SECRET`  | Khóa bí mật để ký JWT token                   |
| `EMAIL_USER`  | Gmail dùng để gửi mail xác minh               |
| `EMAIL_PASS`  | Google App Password (16 ký tự) cho Gmail SMTP |

> **Lưu ý:** Gmail SMTP không chấp nhận mật khẩu đăng nhập Google thông thường. Cần bật **2-Step Verification** và tạo **App Password** tại [Google Account Security](https://myaccount.google.com/apppasswords) để dùng cho `EMAIL_PASS`.

---

## Cấu trúc cơ sở dữ liệu

Chạy các câu lệnh SQL sau để khởi tạo cơ sở dữ liệu:

```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE,
    password    VARCHAR(255),
    name        VARCHAR(255),
    avatar      TEXT,
    is_verified BOOLEAN DEFAULT FALSE
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
    type            VARCHAR(50) DEFAULT 'text',
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_files (
    id         SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    file_name  TEXT,
    file_type  TEXT,
    file_url   TEXT
);

CREATE TABLE message_reads (
    message_id INTEGER REFERENCES messages(id),
    user_id    INTEGER REFERENCES users(id),
    PRIMARY KEY (message_id, user_id)
);

CREATE TABLE email_verification_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users(id),
    token      TEXT,
    expires_at TIMESTAMP
);
```

---

## API Endpoints

Tất cả các route có ký hiệu 🔒 yêu cầu header `Authorization: Bearer <token>`.

### Xác thực (`/auth`)

| Phương thức | Đường dẫn                   | Auth | Mô tả                                                |
|-------------|------------------------------|------|------------------------------------------------------|
| `POST`      | `/auth/register`             |      | Đăng ký tài khoản mới, tự động gửi email xác minh   |
| `POST`      | `/auth/login`                |      | Đăng nhập, trả về JWT token                          |
| `GET`       | `/auth/me`                   | 🔒   | Lấy thông tin người dùng hiện tại                    |
| `PATCH`     | `/auth/updateName`           | 🔒   | Cập nhật tên người dùng                              |
| `PATCH`     | `/auth/update`               | 🔒   | Cập nhật tên và/hoặc avatar (`multipart/form-data`)  |
| `POST`      | `/auth/send-verify-email`    | 🔒   | Gửi lại email xác minh                               |
| `GET`       | `/auth/verifyEmail?token=…`  |      | Xác minh email theo token trong link                 |

#### Body `POST /auth/register`
```json
{ "email": "user@example.com", "password": "secret", "name": "Tên người dùng" }
```

#### Body `POST /auth/login`
```json
{ "email": "user@example.com", "password": "secret" }
```

#### Body `PATCH /auth/update` (multipart/form-data)
| Field    | Kiểu   | Bắt buộc | Mô tả                  |
|----------|--------|----------|------------------------|
| `name`   | string | Không    | Tên mới                |
| `avatar` | file   | Không    | Ảnh đại diện mới       |

---

### Cuộc trò chuyện (`/conversations`)

| Phương thức | Đường dẫn                                    | Auth | Mô tả                                           |
|-------------|-----------------------------------------------|------|-------------------------------------------------|
| `GET`       | `/conversations`                              | 🔒   | Lấy danh sách cuộc trò chuyện của người dùng    |
| `POST`      | `/conversations`                              | 🔒   | Tạo cuộc trò chuyện mới (hoặc trả về cuộc trò chuyện đã tồn tại) |
| `GET`       | `/conversations/:conversationId/participants` | 🔒   | Lấy danh sách thành viên trong cuộc trò chuyện  |

#### Body `POST /conversations`
```json
{ "receiveId": 2 }
```

#### Ví dụ phản hồi `GET /conversations`
```json
[
  {
    "conversation_id": 1,
    "target_id": 2,
    "target_name": "Nguyễn Văn B",
    "target_avatar": "http://localhost:8000/uploads/avatars/avatar.jpg",
    "last_message": "Xin chào!",
    "last_time": "2024-01-01T08:00:00.000Z"
  }
]
```

---

### Tin nhắn (`/messages`)

| Phương thức | Đường dẫn                     | Auth | Mô tả                                        |
|-------------|-------------------------------|------|----------------------------------------------|
| `GET`       | `/messages/:conversationId`   | 🔒   | Lấy tin nhắn của cuộc trò chuyện (phân trang)|
| `POST`      | `/messages/uploads`           | 🔒   | Upload file đính kèm (`multipart/form-data`) |

#### Query params `GET /messages/:conversationId`
| Tham số  | Kiểu     | Mô tả                                                      |
|----------|----------|------------------------------------------------------------|
| `before` | ISO 8601 | Lấy tin nhắn trước thời điểm này (dùng cho phân trang)     |
| `limit`  | number   | Số lượng tin nhắn trả về (mặc định: `20`)                  |

#### Ví dụ phản hồi `GET /messages/:conversationId`
```json
{
  "messages": [
    {
      "id": 5,
      "conversation_id": 1,
      "sender_id": 2,
      "content": "Xin chào!",
      "type": "text",
      "created_at": "2024-01-01T08:00:00.000Z",
      "file_name": null,
      "file_type": null,
      "file_url": null
    }
  ],
  "hasMore": false,
  "nextCursor": "2024-01-01T08:00:00.000Z"
}
```

#### Body `POST /messages/uploads` (multipart/form-data)
| Field            | Kiểu   | Bắt buộc | Mô tả                          |
|------------------|--------|----------|--------------------------------|
| `file`           | file   | Có       | File cần upload                |
| `conversationId` | number | Có       | ID cuộc trò chuyện             |
| `clientTempId`   | string | Không    | ID tạm thời từ phía client     |

---

### Người dùng (`/users`)

| Phương thức | Đường dẫn          | Auth | Mô tả                                              |
|-------------|---------------------|------|----------------------------------------------------|
| `GET`       | `/users/search?q=…` | 🔒   | Tìm kiếm người dùng theo tên (ILIKE) hoặc email   |
| `GET`       | `/users/:id`        | 🔒   | Lấy thông tin người dùng theo ID                   |

---

## Socket Events

Kết nối Socket.IO yêu cầu xác thực JWT qua `handshake.auth.token`.

```js
const socket = io("http://localhost:8000", {
  auth: { token: "your_jwt_token" }
});
```

### Client → Server

| Sự kiện              | Payload                               | Mô tả                                                           |
|----------------------|---------------------------------------|-----------------------------------------------------------------|
| `join_user_room`     | —                                     | Tham gia phòng cá nhân để nhận thông báo tin nhắn mới           |
| `start_conversation` | `{ targetId }`                        | Tìm hoặc tạo cuộc trò chuyện với người dùng khác               |
| `join_conversation`  | `conversationId`                      | Tham gia phòng của cuộc trò chuyện để nhận tin nhắn trực tiếp  |
| `leave_conversation` | `conversationId`                      | Rời phòng cuộc trò chuyện                                       |
| `send_message`       | `{ conversation_id, content }`        | Gửi tin nhắn văn bản mới                                        |
| `typing`             | `{ conversationId }`                  | Thông báo đang gõ tin nhắn                                      |
| `stop_typing`        | `{ conversationId }`                  | Thông báo ngừng gõ tin nhắn                                     |
| `mark_seen`          | `{ messageId }`                       | Đánh dấu tin nhắn đã đọc                                        |

### Server → Client

| Sự kiện              | Payload                     | Mô tả                                                        |
|----------------------|-----------------------------|--------------------------------------------------------------|
| `conversation_ready` | `{ conversationId }`        | Cuộc trò chuyện đã sẵn sàng (sau `start_conversation`)      |
| `receive_message`    | Đối tượng tin nhắn          | Tin nhắn mới gửi đến tất cả thành viên đang ở trong phòng   |
| `new_message`        | Đối tượng tin nhắn          | Thông báo tin nhắn mới cho người dùng không ở trong phòng   |
| `typing`             | `{ userId }`                | Người dùng đang gõ tin nhắn trong phòng                      |
| `stop_typing`        | `{ userId }`                | Người dùng ngừng gõ tin nhắn trong phòng                     |
| `message_seen`       | `{ messageId, userId }`     | Tin nhắn đã được đọc bởi một thành viên                      |

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
