
import { getRowList } from "../libs/googlespreadsheet";
import { DB } from "../db";
import { strToDate, typedObjectKeys } from "../utils";
import PGformat from 'pg-format';

type ColumnMapType = Record<string, ColumnType>

type ColumnType = {
    label: string,
    transform?: (val: string) => unknown
}

const STREAM_COLUMN_MAP: ColumnMapType = {
    date: {
        label: 'Дата',
        transform: (val: string) => strToDate(val).toISOString()
    },
    title: {
        label: 'Название'
    },
    link: {
        label: 'Ссылка'
    },
    length: {
        label: 'Продолжительность'
    }
}

export const updateStreams = async () => {
    if (!process.env.GOOGLE_SPREADSHEET_URL) return console.log('there is no GOOGLE_SPREADSHEET_URL')

    const pool = DB.getInstance()

    const res = await getRowList(process.env.GOOGLE_SPREADSHEET_URL, 'Стримы', 3);

    let values: unknown[] = []
    res.map((row) => {
        const value: unknown[] = []
        typedObjectKeys(STREAM_COLUMN_MAP).map((key) => {
            const result = row[STREAM_COLUMN_MAP[key].label]
            const transformedResult = STREAM_COLUMN_MAP[key]?.transform?.(result) || result
            value.push(transformedResult);
        })
        values.push(value)
    });

    await pool.query(`TRUNCATE TABLE zt_streams`)

    const query = PGformat(`INSERT INTO zt_streams (${Object.keys(STREAM_COLUMN_MAP).join(', ')}) VALUES %L`, values)
    await pool.query(query);

    console.log('zt_streams table updated');
};