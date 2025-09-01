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
- View order history (`/orders/myorders`)  
- View all orders (Admin only)  
- Get order by ID (`/orders/:id`)  
- Track order status (`pending`, `paid`, `payment_failed`, `shipped`, `completed`, `cancelled`)  
- Cancel order (`/orders/:id/cancel`)  
- Mark order as delivered (Admin only → `/orders/:id/deliver`)  

---

### 💳 Payments
- Stripe or PayPal integration  
- Create PayPal order (`/payments/paypal/:orderId`)  
- Handle PayPal webhook (`/payments/paypal/webhook`)  
- Store transaction reference in DB  
- Payment status tracking (`pending`, `success`, `failed`, `refunded`)  

---


## 🏗️ Project Architecture (MVC)

```

src/
├── Controllers/
│   ├── categoryController.js
│   ├── orderController.js
│   ├── paymentsController.js
│   ├── productController.js
│   ├── reviewController.js
│   └── userController.js
│
├── Middlewares/
│   └── auth.js
│
├── Models/
│   ├── cartModel.js
│   ├── categoryModel.js
│   ├── orderModel.js
│   ├── paymentsModel.js
│   ├── productModel.js
│   └── userModel.js
│
├── Routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── paymentRoutes.js
│
├── Utils/
│   ├── sendEmail.js
│   ├── pagination.js
│   ├── jwtHelper.js
│   └── fileUpload.js
│
├── app.js
├── server.js
└── config.env

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
- `images` (URL/path)  
- `createdAt`, `updatedAt`  

### Fields
- *categoryId* (ObjectId, PK) → Unique identifier for the category  
- *name* (String, required, unique) → Name of the category (e.g., Electronics, Clothing)  
- *description* (String, optional) → Short description of the category  
- *createdAt* (Date, auto) → Timestamp when the category was created  
- *updatedAt* (Date, auto) → Timestamp when the category was last updated  

---

### Rules / Constraints
- name must be unique (no duplicate categories).  
- createdAt and updatedAt are automatically handled by the system.  

---
### 🔎 Query Parameters (GET /api/categories)

The GET /api/categories endpoint supports *filtering, **pagination, and **sorting*.

#### Filtering
- ?name=Electronics → Get categories with name *"Electronics"*

#### Pagination
- ?page=2&limit=5 → Get *page 2* with *5 categories per page*

#### Sorting
- ?sort=name → Sort by name (ascending)  
- ?sort=-name → Sort by name (descending)  
- ?sort=-createdAt → Sort by most recent
-----

### 🛒 Cart
- `cartId` (PK)  
- `userId` (FK → Users)  
- `items` (Array of: productId, quantity, priceAtTime)  
- `createdAt`, `updatedAt`  

### 📜 Orders
- `orderId` (PK)  
- `user` (FK → Users)  
- `cartItems` (Array of: `product`, `quantity`, `price`, `color`)  
- `shippingAddress` (`details`, `street`, `city`)  
- `shippingPrice`  
- `totalOrderPrice`  
- `paymentMethodType` (`card`, `cash`)  
- `payment` (FK → Payments)  
- `isPaid` (`Boolean`), `paidAt`  
- `isCancelled` (`Boolean`), `cancelledAt`  
- `isDelivered` (`Boolean`), `deliveredAt`  
- `status` (`pending`, `paid`, `payment_failed`, `shipped`, `completed`, `cancelled`)  
- `createdAt`, `updatedAt`  

---

### 💳 Payments
- `paymentId` (PK)  
- `orderId` (FK → Orders)  
- `provider` (`stripe`, `paypal`)  
- `amount`  
- `currency` (default: `EGP`)  
- `status` (`pending`, `success`, `failed`, `refunded`)  
- `transactionReference`  
- `createdAt`, `updatedAt`  
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


## 📡 API Endpoints (High Level)
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






