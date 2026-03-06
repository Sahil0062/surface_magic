import dotenv from "dotenv"
dotenv.config()
export const config = {
    STAGING:
    {
        DB_HOST: process.env.STAGING_DB_HOST,
        DB_USER: process.env.STAGING_DB_USER,
        DB_PASS: process.env.STAGING_DB_PASS,
        DB_DATABASE: process.env.DATABASE_NAME,
        DB_PORT: 3306,
    },
    local:
    {
        DB_HOST: process.env.LOCAL_DB_HOST,
        DB_USER: process.env.LOCAL_DB_USER,
        DB_PASS: process.env.LOCAL_DB_PASS,
        DB_DATABASE: process.env.DATABASE_NAME,
        DB_PORT: 3306,
    },
    PRODUCTION: {
        DB_HOST: process.env.PRODUCTION_DB_HOST,
        DB_USER: process.env.PRODUCTION_DB_USER,
        DB_PASS: process.env.PRODUCTION_DB_PASS,
        DB_DATABASE: process.env.DATABASE_NAME,
        DB_PORT: 3306,
    }
}