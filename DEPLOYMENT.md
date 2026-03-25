# BMTC Bus Tracker Deployment

## 1. Prepare the server

- Use a PHP + MySQL hosting provider such as Hostinger, InfinityFree, AwardSpace, or any VPS with Apache/Nginx.
- Create a MySQL database and note the host, port, database name, username, and password.
- Upload the project files to your hosting account.
- Keep the folder structure exactly the same so `index.php` can redirect visitors into the app.

## 2. Import the database

- Open phpMyAdmin on your hosting panel.
- Create a database named `bmtc_tracker`, or another name if you plan to override it with environment variables.
- Import [database/schema.sql](C:/xampp/htdocs/bmtc-bus-tracker/database/schema.sql).

## 3. Configure database connection

The app reads these environment variables if your host supports them:

- `BMTC_DB_HOST`
- `BMTC_DB_PORT`
- `BMTC_DB_USER`
- `BMTC_DB_PASSWORD`
- `BMTC_DB_NAME`

If your shared host does not support environment variables, update [db_connection.php](C:/xampp/htdocs/bmtc-bus-tracker/backend/config/db_connection.php#L1) with your production credentials.

## 4. Publish the website

- Point your public domain to the project folder.
- The root URL will automatically open `frontend/signup.html` through [index.php](C:/xampp/htdocs/bmtc-bus-tracker/index.php#L1).
- Keep the `backend` and `database` folders on the server so PHP can access the APIs and schema.
- Apache security rules are included in [.htaccess](C:/xampp/htdocs/bmtc-bus-tracker/.htaccess#L1), [database/.htaccess](C:/xampp/htdocs/bmtc-bus-tracker/database/.htaccess#L1), and [backend/config/.htaccess](C:/xampp/htdocs/bmtc-bus-tracker/backend/config/.htaccess#L1).

## 5. After deployment

- Create your own admin account directly in the `users` table or keep `admin@bmtc.local` only for testing.
- Change demo passwords before going live.
- Enable HTTPS on the hosting provider before public release.
