import pg from "pg";

export const createDB = async () => {
    const { Pool } = pg;

    const pool = new Pool({
        connectionString: process.env.POSTGRES_URL + "?sslmode=require",
    })

    await removeAllTables(pool)

    const promises = [
        createUserTable(pool),
        createPodcastTable(pool),
        createRecommendationTable(pool),
        createStreamsTable(pool)
    ];

    await Promise.all(promises)
}

const removeAllTables = async (pool: pg.Pool) => {
    try {
        await pool.query(`DROP TABLE zt_accounts`);
        await pool.query(`DROP TABLE zt_podcasts`);
        await pool.query(`DROP TABLE zt_recommendation`);
        await pool.query(`DROP TABLE zt_streams`);
    } catch(e) {
        console.log(e);
    }
}

const createUserTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE zt_accounts (
            telegram_id serial PRIMARY KEY,
            role VARCHAR (50) DEFAULT 'moderator'
        );`);
        await pool.query(`INSERT INTO zt_accounts VALUES
        ('1690894', 'admin');`);
    } catch(e) {
        console.log(e);
    }
}

const createPodcastTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE zt_podcasts (
            date timestamp default NULL,
            podcast varchar(128),
            number varchar(128),
            title varchar(128),
            length interval hour to minute
        );`);
        await pool.query(`INSERT INTO zt_podcasts VALUES
        (to_timestamp(${Date.now()/1000}), 'dsa', '288', 'test title', '01:02:03');`);
    } catch(e) {
        console.log(e);
    }
}

const createStreamsTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE zt_recommendation (
            date timestamp default NULL,
            podcast varchar(128),
            type varchar(128),
            title varchar(512),
            link varchar(512),
            image varchar(512),
            platforms varchar(128),
            rating varchar(16),
            genres varchar(256),
            releaseDate timestamp default NULL,
            length varchar(256),
            dima varchar(256),
            timur varchar(256),
            maksim varchar(256),
            guest varchar(256)
        );`);
    } catch(e) {
        console.log(e);
    }
}

const createRecommendationTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE zt_streams (
            date timestamp default NULL,
            title varchar(512),
            link varchar(512),
            length interval hour to minute
        );`);
    } catch(e) {
        console.log(e);
    }
}