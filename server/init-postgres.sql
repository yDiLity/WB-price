-- Создание пользователя и базы данных для Ozon Price Optimizer
-- Этот файл нужно выполнить от имени суперпользователя postgres

-- Создаем пользователя для приложения
CREATE USER ozonuser WITH PASSWORD 'ozonpass123';

-- Даем права на создание баз данных
ALTER USER ozonuser CREATEDB;

-- Создаем базу данных
CREATE DATABASE ozon_price_optimizer OWNER ozonuser;

-- Подключаемся к созданной базе данных
\c ozon_price_optimizer;

-- Даем все права пользователю на эту базу данных
GRANT ALL PRIVILEGES ON DATABASE ozon_price_optimizer TO ozonuser;

-- Создаем схему public если её нет
CREATE SCHEMA IF NOT EXISTS public;

-- Даем права на схему
GRANT ALL ON SCHEMA public TO ozonuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ozonuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ozonuser;

-- Устанавливаем права по умолчанию для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ozonuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ozonuser;

-- Выводим информацию о созданных объектах
SELECT 'Database and user created successfully!' as status;
