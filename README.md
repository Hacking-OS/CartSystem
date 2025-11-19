# CartSystem Project

## Overview

The **CartSystem** project is an Angular 17-based shopping cart system with an integrated Express.js API backend. The application facilitates shopping cart management, user authentication, and payment processing. This project is structured to be scalable and maintainable, allowing for flexibility in integrating features like token handling and advanced business logic.

---

## Features

- **Shopping Cart Management**: Manage cart items, including adding, removing, and updating products.
- **User Authentication**: Secure user login and registration with token-based authentication.
- **Payment Integration**: Integrates payment methods and processes transactions.
- **API Integration**: The backend is built using Express.js to handle cart and user actions, offering a RESTful API.

---

## Architecture

### Frontend (Angular 17)

- **Interceptors**: Modifies HTTP requests and responses.
- **Custom Services**: Handles complex business logic such as token refresh and advanced operations.

### Backend (Express.js)

- Provides API endpoints for cart management, user actions, and payment processing.
- Manages token-based authentication and handles advanced features like token refreshing.

---

## Token Handling & Advanced Logic: Interceptor vs Custom Service

While Angular interceptors are ideal for modifying HTTP requests and responses, complex logic like token refreshing can introduce unnecessary complexity if implemented directly within the interceptor. Instead, the recommended approach is:

- **Interceptor**: Used for simple tasks like adding headers, logging, and error handling.
- **Custom Service**: Handles advanced logic like token refreshing, keeping the interceptor focused on its core task.

By leveraging a custom service, we allow for greater flexibility and easier maintenance, while ensuring that the interceptor remains lightweight.

---

## Setup Instructions

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/cartsystem.git
cd cartsystem
