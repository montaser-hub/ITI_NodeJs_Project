# 🛒 E-Commerce REST API (Node.js + Express + MongoDB)

This is a **Node.js E-Commerce REST API project** built using **Express.js** and **MongoDB (Mongoose)**.  
It follows the **MVC architecture** and includes **JWT authentication**, product & category management, shopping cart, order handling, and Stripe/PayPal payment integration.  

---

## 🚀 Features

### 🔑 Authentication & Users
- User registration with **JWT authentication**
- Password hashing with **bcrypt**
- **Email confirmation** after registration (via Nodemailer)
- Login / Logout
- User profile management (update info)
- Role-based access (`user` / `admin`)

### 📦 Products & Categories
- Product CRUD (**admin only**)
- Category CRUD (**admin only**)
- Public product list with **pagination, filtering, search**
- Product details view

### 🛒 Cart
- Add products to cart
- Remove products from cart
- Update product quantities

### 📜 Orders
- Place an order from the cart
- View order history
- Track order status (`pending`, `paid`, `shipped`, `completed`, `cancelled`)

### 💳 Payments
- Stripe or PayPal integration
- Store transaction reference in DB
- Payment status tracking (`pending`, `success`, `failed`)

---

## 🏗️ Project Architecture (MVC)
src/
├── Controllers/
│ ├── categoryController.js
│ ├── orderController.js
│ ├── paymentsController.js
│ ├── productController.js
│ ├── reviewController.js
│ └── userController.js
│
├── Middlewares/
│ └── auth.js
│
├── Models/
│ ├── cartModel.js
│ ├── categoryModel.js
│ ├── orderModel.js
│ ├── paymentsModel.js
│ ├── productModel.js
│ └── userModel.js
│
├── Routes/
│ ├── authRoutes.js
│ ├── userRoutes.js
│ ├── productRoutes.js
│ ├── categoryRoutes.js
│ ├── cartRoutes.js
│ ├── orderRoutes.js
│ └── paymentRoutes.js
│
├── Utils/
│ ├── sendEmail.js
│ ├── pagination.js
│ ├── jwtHelper.js
│ └── fileUpload.js
│
├── app.js
├── server.js
├── config.env



---

## 🗄️ Database Design (ERD)

### 👤 Users
- `userId` (PK)  
- `name`  
- `username` (unique)  
- `email` (unique)  
- `age`  
- `password` (hashed)  
- `role` (`user` | `admin`)  
- `isVerified` (boolean)  
- `createdAt`, `updatedAt`  

### 📦 Products
- `productId` (PK)  
- `name`  
- `description`  
- `price`  
- `quantity`  
- `categoryId` (FK → Categories)  
- `image` (URL/path)  
- `createdAt`, `updatedAt`  

### 🏷️ Categories
- `categoryId` (PK)  
- `name`  
- `description`  
- `createdAt`, `updatedAt`  

### 🛒 Cart
- `cartId` (PK)  
- `userId` (FK → Users)  
- `items` (Array of: productId, quantity, priceAtTime)  
- `createdAt`, `updatedAt`  

### 📜 Orders
- `orderId` (PK)  
- `userId` (FK → Users)  
- `items` (Array of: productId, quantity, priceAtTime)  
- `totalAmount`  
- `status` (`pending`, `paid`, `shipped`, `completed`, `cancelled`)  
- `paymentId` (FK → Payments)  
- `createdAt`, `updatedAt`  

### 💳 Payments
- `paymentId` (PK)  
- `orderId` (FK → Orders)  
- `provider` (`Stripe` | `PayPal`)  
- `amount`  
- `currency`  
- `status` (`pending`, `success`, `failed`)  
- `transactionReference`  
- `createdAt`  

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB + Mongoose  
- **Authentication**: JWT + bcrypt  
- **Validation**: Joi / express-validator  
- **Email**: Nodemailer  
- **File Uploads**: Multer + Cloudinary/AWS S3  
- **Payments**: Stripe / PayPal SDK  
- **Logging**: Morgan  
- **Env Config**: dotenv  

---

## 📥 Installation & Setup

```bash
# Clone repository
git clone https://github.com/your-username/ecommerce-api.git
cd ecommerce-api

# Install dependencies
npm install

# Create .env file
cp config.env.example config.env

# Run development server
npm run dev

Example config.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=supersecretkey
STRIPE_SECRET_KEY=your_stripe_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password


📡 API Endpoints (High Level)
🔑 Auth

POST /api/auth/register

POST /api/auth/login

GET /api/auth/confirm/:token

👤 User

GET /api/users/me

PUT /api/users/me

📦 Products

GET /api/products (with pagination, search)

GET /api/products/:id

POST /api/products (admin only)

PUT /api/products/:id (admin only)

DELETE /api/products/:id (admin only)

🏷️ Categories

GET /api/categories

POST /api/categories (admin only)

PUT /api/categories/:id (admin only)

DELETE /api/categories/:id (admin only)

🛒 Cart

GET /api/cart

POST /api/cart (add item)

PUT /api/cart/:itemId (update qty)

DELETE /api/cart/:itemId

📜 Orders

POST /api/orders

GET /api/orders/history

💳 Payments

POST /api/payments/stripe

POST /api/payments/paypal
..........

📜 License

This project is licensed under the MIT License.
Feel free to use and modify for learning or production.
