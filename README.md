# Enterprise E-Commerce & Analytics Platform

## Project Overview
The Enterprise E-Commerce & Analytics Platform is a full-stack web application designed to provide a complete online shopping experience with administrative management and analytics capabilities.

## Live Demo
- **Frontend:** https://enterprise-ecommerce-oct.vercel.app
- **Backend API:** https://enterprise-ecommerce-oct.onrender.com/api
- **GitHub:** https://github.com/divya12112004/cognevance_EnterpriseEcommerce_oct12

## Features

### Customer
- User registration and login
- Browse products and categories
- Shopping cart and checkout
- Address and account management
- Order history
- Mock payment processing
- Email notifications

### Admin
- Dashboard and analytics
- Product and category management
- Inventory management
- Customer management
- Order management
- Role-based access control

## Technologies Used
- **Frontend:** React.js, Vite, HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT and bcrypt
- **Image Storage:** Cloudinary
- **Email:** Nodemailer
- **Deployment:** Vercel and Render
- **Version Control:** Git and GitHub

## Project Structure
- `client/` – Frontend application
- `server/` – Backend API and server configuration

## Setup Instructions

### Prerequisites
Install Node.js, npm, and MySQL. Configure any required external services.

### 1. Clone the repository
```bash
git clone https://github.com/divya12112004/cognevance_EnterpriseEcommerce_oct12.git
cd cognevance_EnterpriseEcommerce_oct12
```

### 2. Install frontend dependencies
```bash
cd client
npm install
```

### 3. Install backend dependencies
Open another terminal from the project root:
```bash
cd server
npm install
```

### 4. Configure environment variables
Create a `.env` file inside `server/` with the database, JWT, email, and other configuration variables required by the application.

Use your own credentials and keep the `.env` file out of GitHub.

### 5. Run the backend
From the `server/` folder, run the development command configured in `server/package.json`. For example:
```bash
npm run dev
```

### 6. Run the frontend
From the `client/` folder:
```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## Project Workflow
1. Customers register or log in.
2. Customers browse products and manage their carts.
3. Customers select an address and place orders.
4. The application processes a simulated payment and stores order information.
5. Email notifications are sent when configured.
6. Administrators manage products, inventory, customers, and orders.
7. The admin dashboard displays relevant business analytics.

## Deployment
- Frontend hosted on Vercel
- Backend hosted on Render
- MySQL database hosted separately

## Payment Disclaimer
This project uses a **mock payment gateway** for demonstration. It does not process real payments or charge real money.

## Security
- JWT-based authentication
- Password hashing
- Role-based access control
- Environment variables for sensitive configuration

## Author
**Divya M.**

Developed as an internship project to demonstrate full-stack development, database integration, e-commerce workflows, and analytics.
