import { getRowList } from "../libs/googlespreadsheet";
import { DB } from "../db";
import PGformat from "pg-format";

export const updateConfig = async () => {
    if (!process.env.GOOGLE_SPREADSHEET_URL) return console.log('there is no GOOGLE_SPREADSHEET_URL')

    const pool = DB.getInstance()
    const res = await getRowList(process.env.GOOGLE_SPREADSHEET_URL, 'Config');

    let values: string[][] = []
    res.map((row) => {
        Object.keys(row).map((key) => {
            if (row[key]) values.push([key, row[key]])
        })
    })

    await pool.query(`TRUNCATE TABLE zt_config`)

    const query = PGformat(`INSERT INTO zt_config (key, value) VALUES %L`, values)
    await pool.query(query);

    console.log('zt_config table updated');
};