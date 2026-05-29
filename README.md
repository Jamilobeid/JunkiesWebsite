# JunkiesWebsite

Full-stack restaurant website for Junkies with a React frontend, ASP.NET Core Web API backend, SQL Server database, account login/register, cart, checkout, previous orders, and loyalty points.

## Project structure

- `frontend` - React + Vite app and CSS styling.
- `backend` - ASP.NET Core Web API, Entity Framework Core, SQL Server models, seed data, auth, menu, and order endpoints.

## Prerequisites

Install these first:

- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- SQL Server LocalDB or SQL Server Express

The backend uses this default database connection in `backend/appsettings.json`:

```json
"Server=(localdb)\\mssqllocaldb;Database=JunkiesDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
```

If you use SQL Server Express instead, replace it with a connection string such as:

```json
"Server=.\\SQLEXPRESS;Database=JunkiesDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
```

## Run the backend

```bash
cd C:\Users\User\Desktop\JunkiesWebsite\backend
dotnet restore
dotnet run --launch-profile http
```

The API runs at:

```text
http://localhost:5002/api
```

The database is created automatically the first time the API starts, and the menu from the provided screenshot is seeded into SQL Server.

## Run the frontend

Open a second terminal:

```bash
cd C:\Users\User\Desktop\JunkiesWebsite\frontend
npm install
npm run dev
```

The website runs at:

```text
http://localhost:5173
```

## API endpoints

- `GET /api/menu` - all menu categories and items.
- `GET /api/menu/category/{categoryName}` - items from one category.
- `POST /api/auth/register` - create account.
- `POST /api/auth/login` - log in.
- `POST /api/auth/logout` - log out.
- `GET /api/auth/me` - profile, points, and previous orders.
- `POST /api/orders` - submit an order.

## Loyalty points

Menu prices are in Lebanese pounds, so this project uses:

- `100,000 L.L. spent = 1 point`
- `100 points = 500,000 L.L. discount`

Guests can place orders, but only logged-in users earn and redeem points.
