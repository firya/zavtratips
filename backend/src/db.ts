import pg from "pg";

export const DB = (function() {
    const { Pool } = pg;

    let db: pg.Pool | null = null;

    function init() {
        return new Pool({
            connectionString: process.env.POSTGRES_URL + "?sslmode=require",
        })
    }

    return {
        getInstance: () => {
            if (!db) {
                db = init()
            }
            return db
        },
    }
})()

export const removeAllTables = async (pool: pg.Pool) => {
    try {
        await pool.query(`DROP TABLE zt_accounts`);
        await pool.query(`DROP TABLE zt_podcasts`);
        await pool.query(`DROP TABLE zt_recommendation`);
        await pool.query(`DROP TABLE zt_streams`);
    } catch(e) {
        console.log(e);
    }
}

export const createAllTables = (pool: pg.Pool) => {
    const promises = [
        createUserTable(pool),
        createPodcastTable(pool),
        createRecommendationTable(pool),
        createStreamsTable(pool)
    ];

    return Promise.all(promises);
}

export const createUserTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS zt_accounts (
            telegram_id serial PRIMARY KEY,
            role VARCHAR (50) DEFAULT 'moderator'
        );`);
        await pool.query(`INSERT INTO zt_accounts VALUES
        ('1690894', 'admin') ON CONFLICT DO NOTHING;`);
    } catch(e) {
        console.log(e);
    }
}

export const createPodcastTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS zt_podcasts (
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

export const createStreamsTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS zt_recommendation (
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

export const createRecommendationTable = async (pool: pg.Pool) => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS zt_streams (
            date timestamp default NULL,
            title varchar(512),
            link varchar(512),
            length interval hour to minute
        );`);
    } catch(e) {
        console.log(e);
    }
}