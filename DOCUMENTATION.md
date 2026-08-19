# Version Update — v1.2 (Aug 19, 2026)

> Applied to the switchgod.com.np deployment (repo `mhzsajan/switchgod-bazar`). Live project state lives in `RESUME.md`, `SESSIONS.md`, `.deploy/README.md`, `.deploy/KNOWN_ISSUES.md`.

**What changed in this version (Session 56):**
- **Make Admin actually works** — real `super_admin` permission grant/revoke on users.json, admin UI Make/Revoke toggle, guarded by new `SuperAdminGuard` (JWT + permission check) on block/unblock/make-admin/revoke-admin routes
- **Real profile image upload** — `POST /attachments` now saves to `api/rest/uploads/` via multer and returns a real served URL (`/uploads/*`); `users.update()` merges profile + address (unique ids) instead of dropping them
- **Stale in-memory data fixed** — auth.users and users.service now `reloadFromFile()` before every operation (dual-array ghost solved)
- **~15 stub endpoints → real persisted CRUD** — addresses, refunds, wishlists (toggle persists `in_wishlist` on products.json), my-wishlists, conversations, messages, newsletters (dedupe), feedbacks, abusive reports, withdraws (+approve), ownership-transfer. All follow reload-from-file + dual-write (src + dist) pattern.
- **Still stubs by design:** phone OTP login, AI descriptions, Stripe/PayPal, imports, webhooks, become-seller

> **Ops notes:** Caddy needs a `/uploads/*` route on `api.switchgod.com.np` for uploaded images in production. For captcha-protected curl tests use Turnstile always-pass key `1x0000000000000000000000000000000AA` and restore the real secret afterward. Nest incremental build can serve stale dist — `rm -rf dist` + rebuild if the API crash-loops after edits.

---

# Version Update — v1.1 (Aug 18, 2026)

> Applied to the switchgod.com.np deployment (repo `mhzsajan/switchgod-bazar`). This is the stock PickBazar vendor docs below; live project state lives in `RESUME.md`, `SESSIONS.md`, `.deploy/README.md`, `.deploy/KNOWN_ISSUES.md`.

**What changed in this version (Sessions 48-55):**
- Email system (Gmail SMTP) — password reset / email verification / welcome / shop / order emails; sending from `support@switchgod.com.np`
- Cloudflare Email Routing — `support@`, `admin@`, `info@switchgod.com.np` forward to Gmail
- Role security — new registrations get `customer` only; admins promoted via `ADMIN_EMAILS` env
- Mandatory email verification — 6-digit code, `/me` returns 409 until verified, `/verify-email` page with code input
- Real Google login (OAuth access-token verification)
- Cloudflare Turnstile captcha on register + login (storefront + admin)
- Crash fix: all 20 API db services `mkdirSync` before dual-write (dist/db wiped by rebuild)
- Admin logout menu fix (role derived from permissions)

> **Note:** Stock docs below reference `yarn` — this machine uses **npm** (see COMMANDS.md). Vendor GraphQL paths don't exist here (REST only).

---

Introduction
Welcome to the PickBazar documentation! Fastest Ecommerce App built with React, NextJS, TypeScript, Laravel(GraphQL, REST API) and Tailwind.
Navigation
You can find different topics in the table of contents. On desktop, you should see it in the left sidebar. On mobile, you should see it after pressing an icon with Hamburger in the top right corner.
Supported Platforms For Local Development
Compatible Browsers (Firefox, Safari, Chrome, Edge)
Server(Node. js 10.13 or later)
MacOS, Windows, and Linux are supported
Requirements
node(10.13 or later)
yarn
editor: Visual Studio Code(recommended)
How it works
Tech We Have Used
We have used monorepo folder structure with Yarn Workspace. In our app we have two different services:
api
frontend
admin-graphql
admin-rest
shop-graphql
shop-rest.
Tech specification for specific part is given below:
Admin Dashboard (GraphQL & REST)
NextJs
Typescript
Tailwindcss
React Hook Form
Apollo Client(For GraphQL API version)
React-Query(For REST API version)
Shop Frontend (GraphQL & REST)
API
NextJs Typescript Tailwindcss React Hook Form
Apollo Client(For GraphQL API version) React-Query(For REST API version)
Laravel
Getting Started
For getting started with the template you have to follow the below procedure. For quick guide you can check below videos for installation.
Installation Video
Prerequisites
PHP 7.4
Composer
Xamp/Wamp/Lamp/Mamp for any such application for apache, nginx, mysql
PHP plugins you must need
simplexml
PHP' s dom extension
mbstring
GD Library
Frontend
node(12.13.0 or later)
yarn
editor: Visual Studio Code(recommended)
Getting Started
First download the file from codecanyon.
Unzip the downloaded file and folder structure you get
pickbazar|-- api|-- frontend|-- admin-graphql|-- admin-rest|-- shop-graphql|-- shop-restpickbazar|-- api|-- frontend|-- admin-graphql|-- admin-rest|-- shop-graphql|-- shop-rest
pickbazar
|-- api
|-- frontend
|-- admin-graphql
|-- admin-rest
|-- shop-graphql
|-- shop-rest
pickbazar
|-- api
|-- frontend
|-- admin-graphql
|-- admin-rest
|-- shop-graphql
|-- shop-rest
From the above folder structure you should notice that our app has two parts api and frontend. So you have to run both part separately and sequentially.
Getting started with api
  Run and start xamp/wamp/lamp/mamp and start all the services
 Create a database in your mysql and put those info in next step
 Rename .env.example file to .env and provide necessary credentials. Like database credentials stripe credentials, s3 credentials(only if you use s3 disk) admin email shop url etc.
 Specially check for this env variables
DB_HOST=localhost DB_DATABASE=pickbazar_laravel DB_USERNAME=rootDB_PASSWORD=DB_HOST=localhost DB_DATABASE=pickbazar_laravel DB_USERNAME=rootDB_PASSWORD=
DB_HOST=localhost DB_DATABASE=pickbazar_laravel DB_USERNAME=root
DB_PASSWORD=
DB_HOST=localhost DB_DATABASE=pickbazar_laravel DB_USERNAME=root
DB_PASSWORD=
 Run composer install
 run php artisan key:generate
 Run php artisan pickbazar:install and follow necessary steps.
 For image upload to work properly you need to run php artisan storage:link.
 run php artisan serve
NB: your frontend NEXT_PUBLIC_GRAPHQL_API_ENDPOINT env value will belocalhost:8000/graphqlNB: your frontend NEXT_PUBLIC_GRAPHQL_API_ENDPOINT env value will belocalhost:8000/graphqlNB: your frontend NEXT_PUBLIC_REST_API_ENDPOINT env value will be localhost:8000/NB: your frontend NEXT_PUBLIC_REST_API_ENDPOINT env value will be localhost:8000/For details api doc and requirements details you can go to Laravel APIFor details api doc and requirements details you can go to Laravel API
NB: your frontend NEXT_PUBLIC_GRAPHQL_API_ENDPOINT env value will be
localhost:8000/graphql
NB: your frontend NEXT_PUBLIC_GRAPHQL_API_ENDPOINT env value will be
localhost:8000/graphql
NB: your frontend NEXT_PUBLIC_REST_API_ENDPOINT env value will be localhost:8000/
NB: your frontend NEXT_PUBLIC_REST_API_ENDPOINT env value will be localhost:8000/
For details api doc and requirements details you can go to Laravel API
For details api doc and requirements details you can go to Laravel API
Getting Started with Frontend
After configuring API & running it successfully you can choose the directory where you need to work
NOTE: only for windows user ( if you want to use GraphQL version)
Go to your specific project root and find `.graphql-let.yml`Replace the env variable `${NEXT_PUBLIC_GRAPHQL_API_ENDPOINT}` in schema field manuallyProvide your API url in the schema field.Also change the dev command at `package.json`Go to `pickbazar/shop-graphql/package.json` file and change the scripts:"codegen": "DOTENV_CONFIG_PATH=.env node -r dotenv/config $(yarn bin)/graphql-let",to"codegen": "graphql-let",Go to your specific project root and find `.graphql-let.yml`Replace the env variable `${NEXT_PUBLIC_GRAPHQL_API_ENDPOINT}` in schema field manuallyProvide your API url in the schema field.Also change the dev command at `package.json`Go to `pickbazar/shop-graphql/package.json` file and change the scripts:"codegen": "DOTENV_CONFIG_PATH=.env node -r dotenv/config $(yarn bin)/graphql-let",to"codegen": "graphql-let",
Go to your specific project root and find `.graphql-let.yml`
Replace the env variable `${NEXT_PUBLIC_GRAPHQL_API_ENDPOINT}` in schema field manually
Provide your API url in the schema field.
Also change the dev command at `package.json`
Go to `pickbazar/shop-graphql/package.json` file and change the scripts:
"codegen": "DOTENV_CONFIG_PATH=.env node -r dotenv/config $(yarn bin)/graphql-let",
to
"codegen": "graphql-let",
Go to your specific project root and find `.graphql-let.yml`
Replace the env variable `${NEXT_PUBLIC_GRAPHQL_API_ENDPOINT}` in schema field manually
Provide your API url in the schema field.
Also change the dev command at `package.json`
Go to `pickbazar/shop-graphql/package.json` file and change the scripts:
"codegen": "DOTENV_CONFIG_PATH=.env node -r dotenv/config $(yarn bin)/graphql-let",
to
"codegen": "graphql-let",
Below are the directories where you will choose to work for frontend stuffs
# For Admin GraphQLcd frontend/admin-graphql # For Admin RESTcd frontend/admin-rest # For Shop GraphQLcd frontend/shop-graphql # For Shop restcd frontend/shop-rest# For Admin GraphQLcd frontend/admin-graphql # For Admin RESTcd frontend/admin-rest # For Shop GraphQLcd frontend/shop-graphql # For Shop restcd frontend/shop-rest
# For Admin GraphQL
cd frontend/admin-graphql # For Admin REST
cd frontend/admin-rest # For Shop GraphQL
cd frontend/shop-graphql # For Shop rest
cd frontend/shop-rest
# For Admin GraphQL
cd frontend/admin-graphql # For Admin REST
cd frontend/admin-rest # For Shop GraphQL
cd frontend/shop-graphql # For Shop rest
cd frontend/shop-rest
After choosing your working directory Go to specific folder and rename the .env.template => .env and put your api endpoint here. You will find .env.template file at the root of your frontend/{chosen-directory-name}
Run yarn at the root directory.
# on pickbazar/root directory yarn# on pickbazar/root directory yarn
# on pickbazar/root directory yarn
# on pickbazar/root directory yarn
Scripts To Run the fronted App
For Admin :
For starting the admin dashboard part with corresponding api data run below commands.
using workspace (At the root of the pickbazar directory, you can run the below commands)
# for dev mode run below command # GraphQLyarn dev:admin-gql# RESTyarn dev:admin-rest# for dev mode run below command # GraphQLyarn dev:admin-gql# RESTyarn dev:admin-rest
# for dev mode run below command # GraphQL
yarn dev:admin-gql
# REST
yarn dev:admin-rest
# for dev mode run below command # GraphQL
yarn dev:admin-gql
# REST
yarn dev:admin-rest
without workspace(if you want to run the command within specific project root of
frontend/{chosen-directory-name})
# for dev mode run below command # GraphQLyarn dev# RESTyarn dev# for dev mode run below command # GraphQLyarn dev# RESTyarn dev
# for dev mode run below command # GraphQL
yarn dev
# REST
yarn dev
# for dev mode run below command # GraphQL
yarn dev
# REST
yarn dev
This command will run the app in development mode. Open the suggested url in your terminal. like => http://localhost: 3000 .
** Note: **
The page will automatically reload if you make changes to the code. You will see the build errors and lint warnings in the console.
If you saw any error while running make Sure you setup your API endpoint properly at .env file.
For Shop :
For starting the shop part with corresponding api run below commands.
using workspace (At the root of the pickbazar directory, you can run the below commands)
# for dev mode run below command # GraphQLyarn dev:shop-gql# RESTyarn dev:shop-rest# for dev mode run below command # GraphQLyarn dev:shop-gql# RESTyarn dev:shop-rest
# for dev mode run below command # GraphQL
yarn dev:shop-gql
# REST
yarn dev:shop-rest
# for dev mode run below command # GraphQL
yarn dev:shop-gql
# REST
yarn dev:shop-rest
without workspace(if you want to run the command within specific project root of
frontend/{chosen-directory-name})
# for dev mode run below command # GraphQLyarn dev# RESTyarn dev# for dev mode run below command # GraphQLyarn dev# RESTyarn dev
# for dev mode run below command # GraphQL
yarn dev
# REST
yarn dev
# for dev mode run below command # GraphQL
yarn dev
# REST
yarn dev
** If you want to test your production build admin or shop in local environment then run the below commands. **
Admin (At the root of the pickbazar directory, you can run the below commands)
# build admin for production yarn build:admin-gql#start admin in production mode yarn start:admin-gql# build admin for production yarn build:admin-gql#start admin in production mode yarn start:admin-gql
# build admin for production yarn build:admin-gql
#start admin in production mode yarn start:admin-gql
# build admin for production yarn build:admin-gql
#start admin in production mode yarn start:admin-gql
Shop (At the root of the pickbazar directory, you can run the below commands)
# build shop for production yarn build:shop-gql# start shop in production mode yarn start:shop-gql# build shop for production yarn build:shop-gql# start shop in production mode yarn start:shop-gql
# build shop for production yarn build:shop-gql
# start shop in production mode yarn start:shop-gql
# build shop for production yarn build:shop-gql
# start shop in production mode yarn start:shop-gql
** Note **: Please see package.json file for other builtin helper commands.
For development purpose we use yarn workspace if you want to use it then see the package.json
file at root, for various workspace specific command.
if you prefer single template then just copy the required template folder and separate them. you' ll find their package.json file within them and follow the command for dev, build, start.
For further development & customization check our Frontend Customization guide.
Admin dashboard
Analytics Dashboard
You will get a complete analytics dashboard to know the overview of your shop.
Manage Product Type
In Types menu you will get the product types and you can add, remove or modify product type from there.
Manage Product Category
In Categories menu you will get the product types and you can add, remove or modify product categories from there.
Product Management
In Products menu you will get the products and you can add, remove or modify products from there.
A portion of product form
Order Status
In Order Status menu you will get the order status list and you can add, remove or modify order status from there.
Order Management
In Order menu you will get the order list and you can add, remove or modify order from there.
A portion of order management. Order status change.
Coupon Management
In Coupon menu you will get the Coupon list and you can add, remove or modify Coupon from there.
Customer Management
In Customer menu you will get the Customer list and you can add, remove or modify Customer from there.
Tax Management
In Tax menu you will get the Tax list and you can add, remove or modify Tax from there.
Shipping Management
In shipping menu you will get the shipping list and you can add, remove or modify shipping from there.
Shipping Management
In shipping menu you will get the shipping list and you can add, remove or modify shipping from there.
Settings Management
In settings menu you will get the settings management form there.
Available Scripts:
You can run below commands in the root folder for your need.
"clean": "yarn workspaces run rimraf \"{.next,node_modules,generated,src/graphql/*.d.ts}\" && rimraf node_modules","gql-clean": "yarn workspaces run rimraf \"{generated,src/graphql/*.d.ts}\"","dev:shop-rest": "yarn workspace @pick-bazar/shop-rest dev", "build:shop-rest": "yarn workspace @pick-bazar/shop-rest build", "start:shop-rest": "yarn workspace @pick-bazar/shop-rest start", "dev:admin-rest": "yarn workspace @pick-bazar/admin-rest dev", "build:admin-rest": "yarn workspace @pick-bazar/admin-rest build", "start:admin-rest": "yarn workspace @pick-bazar/admin-rest start", "dev:shop-gql": "yarn workspace @pick-bazar/shop-graphql dev", "build:shop-gql": "yarn workspace @pick-bazar/shop-graphql build", "start:shop-gql": "yarn workspace @pick-bazar/shop-graphql start", "dev:admin-gql": "yarn workspace @pick-bazar/admin-graphql dev", "build:admin-gql": "yarn workspace @pick-bazar/admin-graphql build", "start:admin-gql": "yarn workspace @pick-bazar/admin-graphql start""clean": "yarn workspaces run rimraf \"{.next,node_modules,generated,src/graphql/*.d.ts}\" && rimraf node_modules","gql-clean": "yarn workspaces run rimraf \"{generated,src/graphql/*.d.ts}\"","dev:shop-rest": "yarn workspace @pick-bazar/shop-rest dev", "build:shop-rest": "yarn workspace @pick-bazar/shop-rest build", "start:shop-rest": "yarn workspace @pick-bazar/shop-rest start", "dev:admin-rest": "yarn workspace @pick-bazar/admin-rest dev", "build:admin-rest": "yarn workspace @pick-bazar/admin-rest build", "start:admin-rest": "yarn workspace @pick-bazar/admin-rest start", "dev:shop-gql": "yarn workspace @pick-bazar/shop-graphql dev", "build:shop-gql": "yarn workspace @pick-bazar/shop-graphql build", "start:shop-gql": "yarn workspace @pick-bazar/shop-graphql start", "dev:admin-gql": "yarn workspace @pick-bazar/admin-graphql dev", "build:admin-gql": "yarn workspace @pick-bazar/admin-graphql build", "start:admin-gql": "yarn workspace @pick-bazar/admin-graphql start"
"clean": "yarn workspaces run rimraf \"
{.next,node_modules,generated,src/graphql/*.d.ts}\" && rimraf node_modules",
"gql-clean": "yarn workspaces run rimraf \"
{generated,src/graphql/*.d.ts}\"",
"dev:shop-rest": "yarn workspace @pick-bazar/shop-rest dev", "build:shop-rest": "yarn workspace @pick-bazar/shop-rest build", "start:shop-rest": "yarn workspace @pick-bazar/shop-rest start", "dev:admin-rest": "yarn workspace @pick-bazar/admin-rest dev", "build:admin-rest": "yarn workspace @pick-bazar/admin-rest build", "start:admin-rest": "yarn workspace @pick-bazar/admin-rest start", "dev:shop-gql": "yarn workspace @pick-bazar/shop-graphql dev", "build:shop-gql": "yarn workspace @pick-bazar/shop-graphql build", "start:shop-gql": "yarn workspace @pick-bazar/shop-graphql start", "dev:admin-gql": "yarn workspace @pick-bazar/admin-graphql dev", "build:admin-gql": "yarn workspace @pick-bazar/admin-graphql build", "start:admin-gql": "yarn workspace @pick-bazar/admin-graphql start"
"clean": "yarn workspaces run rimraf \"
{.next,node_modules,generated,src/graphql/*.d.ts}\" && rimraf node_modules",
"gql-clean": "yarn workspaces run rimraf \"
{generated,src/graphql/*.d.ts}\"",
"dev:shop-rest": "yarn workspace @pick-bazar/shop-rest dev", "build:shop-rest": "yarn workspace @pick-bazar/shop-rest build", "start:shop-rest": "yarn workspace @pick-bazar/shop-rest start", "dev:admin-rest": "yarn workspace @pick-bazar/admin-rest dev", "build:admin-rest": "yarn workspace @pick-bazar/admin-rest build", "start:admin-rest": "yarn workspace @pick-bazar/admin-rest start", "dev:shop-gql": "yarn workspace @pick-bazar/shop-graphql dev", "build:shop-gql": "yarn workspace @pick-bazar/shop-graphql build", "start:shop-gql": "yarn workspace @pick-bazar/shop-graphql start", "dev:admin-gql": "yarn workspace @pick-bazar/admin-graphql dev", "build:admin-gql": "yarn workspace @pick-bazar/admin-graphql build", "start:admin-gql": "yarn workspace @pick-bazar/admin-graphql start"
** Note: ** Also, individual Scripts are available under every individual package. You can check out them from their individual package. json file.
Customization
For customizing the template's default site settings:
If you want to customize the site settings such as site info, default(logo, language , currency code), navigation etc, you can easily change those settings from /frontend/[your-project]/src/settings/site.settings.ts
In this file, find your required settings key and change it' s value according to your need.
For example, If you want to change the currencyCode : please go to /frontend/[your-project]/src/settings/site.settings.ts and find the following portions and change it.
currencyCode: "USD";currencyCode: "USD";
currencyCode: "USD";
currencyCode: "USD";
NOTE ** Some of these options are customizable through ADMIN Dashboard.
How to change banner:
If you want to customize the banner, you can easily change those info from
open /frontend/[your-project]/src/settings/site-pages.settings.tsopen /frontend/[your-project]/src/settings/site-pages.settings.ts
open /frontend/[your-project]/src/settings/site-pages.settings.ts
open /frontend/[your-project]/src/settings/site-pages.settings.ts
In this file, find your required page type' s key and change it' s value according to your need.
For example, If you want to change the currencyCode : please go to
open /frontend/[your-project]/src/settings/site-pages.settings.tsopen /frontend/[your-project]/src/settings/site-pages.settings.ts
open /frontend/[your-project]/src/settings/site-pages.settings.ts
open /frontend/[your-project]/src/settings/site-pages.settings.ts
and find the following portions and change it.
grocery: {title: "Grocery - PickBazar", description: "Grocery Details", banner: {heading: "Groceries Delivered in 90 Minute", subheading:"Get your healthy foods & snacks delivered at your doorsteps all day everyday",image: "/banner/grocery.png",},},grocery: {title: "Grocery - PickBazar", description: "Grocery Details", banner: {heading: "Groceries Delivered in 90 Minute", subheading:"Get your healthy foods & snacks delivered at your doorsteps all day everyday",image: "/banner/grocery.png",},},
grocery: {
title: "Grocery - PickBazar", description: "Grocery Details", banner: {
heading: "Groceries Delivered in 90 Minute", subheading:
"Get your healthy foods & snacks delivered at your doorsteps all day everyday",
image: "/banner/grocery.png",
},
},
grocery: {
title: "Grocery - PickBazar", description: "Grocery Details", banner: {
heading: "Groceries Delivered in 90 Minute", subheading:
"Get your healthy foods & snacks delivered at your doorsteps all day everyday",
image: "/banner/grocery.png",
},
},
How to change promotion slider:
Go to
open /frontend/[your-project]/src/components/common/promotion-slider.tsxopen /frontend/[your-project]/src/components/common/promotion-slider.tsx
open /frontend/[your-project]/src/components/common/promotion-slider.tsx
open /frontend/[your-project]/src/components/common/promotion-slider.tsx
file and change according to your needs.
How to change product card:
Go to
open /frontend/[your-project]/src/components/product/render-product-card.tsx` file and change according to your needs.open /frontend/[your-project]/src/components/product/render-product-card.tsx` file and change according to your needs.
open /frontend/[your-project]/src/components/product/render-product-card.tsx` file and change according to your needs.
open /frontend/[your-project]/src/components/product/render-product-card.tsx` file and change according to your needs.
Styles and Assets
CSS styles:
We use tailwindcss framework with some customization which you find at :
open /frontend/[your-project]/tailwind.config.jsopen /frontend/[your-project]/tailwind.config.js
open /frontend/[your-project]/tailwind.config.js
open /frontend/[your-project]/tailwind.config.js
For tailwindcss documentation: Go to Tailwindcss
Icons:
for our icons
open /frontend/[your-project]/src/components/iconsopen /frontend/[your-project]/src/components/icons
open /frontend/[your-project]/src/components/icons
open /frontend/[your-project]/src/components/icons
For Adding a custom Icon:
To add a custom icon please follow this procedure.
Open your custom SVG icon file in the code editor and copy all the code.
Then Go to src -> components -> icons folder and create a new .tsx file.
Then here create a function component and paste your copied SVG code inside the return statement.
Then covert all the SVG' s kebab-cases properties into camelCase format except the data-name property. For ex. change the stroke-width and fill-color into strokeWidth and fillColor. (for reference you can see one of our icon. )
If your custom SVG code has any single custom color then change them into fillColor.
Utilities
In this template, We have used some custom helper functions which is located in
cd /frontend/[your-project]/src/utils/cd /frontend/[your-project]/src/utils/
cd /frontend/[your-project]/src/utils/
cd /frontend/[your-project]/src/utils/
You can use or customize these helper functions according to your needs.
API Integration:
We have used env variables using .env file format. You have to put your API url within this file.
For example:
Go to /frontend/shop-graphql folder.
Copy the contents of .env.template into a new file called .env
Put Your api url in the /frontend/shop-graphql/.env file' s NEXT_PUBLIC_REST_API_ENDPOINT key.
Data Fetching
For GraphQL
We have used GraphQL Query and Mutation which is defined in
cd /frontend/[your-project-graphql]/src/graphql/cd /frontend/[your-project-graphql]/src/graphql/
cd /frontend/[your-project-graphql]/src/graphql/
cd /frontend/[your-project-graphql]/src/graphql/
For details documentation:
Apollo Client
GraphQL Let
You can check and customize it as your need.
Uses Example:
Query
import { useOrdersQuery, OrdersDocument, OrderDocument, OrdersOrderByColumn, SortOrder,} from "@graphql/orders.graphql";// Fetch list of ordersconst { data, error, loading, fetchMore } = useOrdersQuery({ variables: {orderBy: [{ field: OrdersOrderByColumn.CreatedAt, order: SortOrder.Desc }],first: 10,page: 1,customer_id: 1,},});fetchMore({ variables: {page, first,},});// Fetch Single Orderconst { data, error, loading } = useOrderQuery({import { useOrdersQuery, OrdersDocument, OrderDocument, OrdersOrderByColumn, SortOrder,} from "@graphql/orders.graphql";// Fetch list of ordersconst { data, error, loading, fetchMore } = useOrdersQuery({ variables: {orderBy: [{ field: OrdersOrderByColumn.CreatedAt, order: SortOrder.Desc }],first: 10,page: 1,customer_id: 1,},});fetchMore({ variables: {page, first,},});// Fetch Single Orderconst { data, error, loading } = useOrderQuery({
import { useOrdersQuery, OrdersDocument, OrderDocument, OrdersOrderByColumn, SortOrder,
} from "@graphql/orders.graphql";
// Fetch list of orders
const { data, error, loading, fetchMore } = useOrdersQuery({ variables: {
orderBy: [{ field: OrdersOrderByColumn.CreatedAt, order: SortOrder.Desc }],
first: 10,
page: 1,
customer_id: 1,
},
});
fetchMore({ variables: {
page, first,
},
});
// Fetch Single Order
const { data, error, loading } = useOrderQuery({
import { useOrdersQuery, OrdersDocument, OrderDocument, OrdersOrderByColumn, SortOrder,
} from "@graphql/orders.graphql";
// Fetch list of orders
const { data, error, loading, fetchMore } = useOrdersQuery({ variables: {
orderBy: [{ field: OrdersOrderByColumn.CreatedAt, order: SortOrder.Desc }],
first: 10,
page: 1,
customer_id: 1,
},
});
fetchMore({ variables: {
page, first,
},
});
// Fetch Single Order
const { data, error, loading } = useOrderQuery({
variables: { id,tracking_number,},});variables: { id,tracking_number,},});
variables: { id,
tracking_number,
},
});
variables: { id,
tracking_number,
},
});
Mutation
import { useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation, CouponInput, CouponUpdateInput, CouponType,
} from "@graphql/coupons.graphql";
const [createCoupon] = useCreateCouponMutation(); const [updateCoupon] = useUpdateCouponMutation(); const [deleteCoupon] = useDeleteCouponMutation();
const handleSubmit = async () => { const createInput = {
code: "eid50", amount: 50,
active_from: "2020-12-20 13:43:32",
expire_at: "2020-12-30 13:43:32",
type: CouponType.FixedCoupon,
};
const { data, error, loading } = await createCoupon({ variables: { input: createInput },
});
const updateInput: CouponUpdateInput = { code: "eid50",
amount: 100,
active_from: "2020-12-20 13:43:32",
expire_at: "2020-12-30 13:43:32",
type: CouponType.FixedCoupon,
};
const { data, error, loading } = await updateCoupon({ variables: { id: 22, input: updateInput },
});
const { data, error, loading } = await deleteCoupon({ variables: { id: 22 },
});
};
For REST API
We have used React Query and Axios which is defined in
/frontend/[your-project-rest]/src/data//frontend/[your-project-rest]/src/data/
/frontend/[your-project-rest]/src/data/
/frontend/[your-project-rest]/src/data/
For details documentation:
React-Query You can check and customize it as your need.
Uses Example:
Query
import { useProductsQuery } from "@data/product/use-products.query"; const {isFetching: loading, isFetchingNextPage: loadingMore, fetchNextPage,hasNextPage, isError, data,error,} = useProductsQuery({ type: "grocery", text: "",category: "grocery",});import { useProductsQuery } from "@data/product/use-products.query"; const {isFetching: loading, isFetchingNextPage: loadingMore, fetchNextPage,hasNextPage, isError, data,error,} = useProductsQuery({ type: "grocery", text: "",category: "grocery",});
import { useProductsQuery } from "@data/product/use-products.query"; const {
isFetching: loading, isFetchingNextPage: loadingMore, fetchNextPage,
hasNextPage, isError, data,
error,
} = useProductsQuery({ type: "grocery", text: "",
category: "grocery",
});
import { useProductsQuery } from "@data/product/use-products.query"; const {
isFetching: loading, isFetchingNextPage: loadingMore, fetchNextPage,
hasNextPage, isError, data,
error,
} = useProductsQuery({ type: "grocery", text: "",
category: "grocery",
});
Mutation
import { useCreateProductMutation } from "@data/product/product-create.mutation";const {mutate: createProduct, isLoading: creating,} = useCreateProductMutation();function handleSubmit(inputValues) { createProduct({...inputValues,},{onError: (error: any) => { Object.keys(error?.response?.data).forEach((field: any) => {setError(field, { type: "manual",message: error?.response?.data[field][0],});import { useCreateProductMutation } from "@data/product/product-create.mutation";const {mutate: createProduct, isLoading: creating,} = useCreateProductMutation();function handleSubmit(inputValues) { createProduct({...inputValues,},{onError: (error: any) => { Object.keys(error?.response?.data).forEach((field: any) => {setError(field, { type: "manual",message: error?.response?.data[field][0],});
import { useCreateProductMutation } from "@data/product/product-create.mutation";
const {
mutate: createProduct, isLoading: creating,
} = useCreateProductMutation();
function handleSubmit(inputValues) { createProduct(
{
...inputValues,
},
{
onError: (error: any) => { Object.keys(error?.response?.data).forEach((field: any) => {
setError(field, { type: "manual",
message: error?.response?.data[field][0],
});
import { useCreateProductMutation } from "@data/product/product-create.mutation";
const {
mutate: createProduct, isLoading: creating,
} = useCreateProductMutation();
function handleSubmit(inputValues) { createProduct(
{
...inputValues,
},
{
onError: (error: any) => { Object.keys(error?.response?.data).forEach((field: any) => {
setError(field, { type: "manual",
message: error?.response?.data[field][0],
});
});},});}});},});}
});
},
}
);
}
});
},
}
);
}
Deployment
API Deployment
Its a basic laravel application so you can deploy it as any other laravel application. Make sure you have installed all the php required plugins we mentioned above. You can follow below resources to deploy the application in a VPS
https://www.digitalocean.com/community/tutorials/how-to-deploy-a-laravel-application-with-nginx-on-ubuntu-16-04
Vercel Deployment
vercel.com
If you want to host the template in vercel.com then follow the below command
Frontend
After deploying the api you will get the api endpoint url. Put that url in the frontend/[your-project]/.env and vercel.json file.
TypeError: Cannot read properties of null (reading 'useContext')
If you encounter this issue after installing the package, please follow the steps outlined below.
Or follow the video link below
NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here}'NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here}'
NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here}'
NEXT_PUBLIC_GRAPHQL_API_ENDPOINT= '{put_your_api_url_here}'
Navigate to frontend/[your-project]
Now run below command
vercelvercel
vercel
vercel
** NOTE: ** for deploying to vercel you need to install vercel-cli on your machine for more information please visit here
For others hosting providers:
Please follow nextjs deployment docs: