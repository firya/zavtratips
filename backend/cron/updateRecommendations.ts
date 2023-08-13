
import { getRowList } from "../libs/googlespreadsheet";
import { DB } from "../db";
import { strToDate, typedObjectKeys } from "../utils";
import PGformat from 'pg-format';

type ColumnMapType = Record<string, ColumnType>

type ColumnType = {
    label: string,
    transform?: (val: string) => unknown
}

const RECOMMENDATIONS_COLUMN_MAP: ColumnMapType = {
    date: {
        label: 'Дата',
        transform: (val: string) => strToDate(val).toISOString()
    },
    podcast: {
        label: 'Выпуск'
    },
    type: {
        label: 'Тип'
    },
    title: {
        label: 'Название'
    },
    link: {
        label: 'Ссылка'
    },
    image: {
        label: 'Изображение'
    },
    platforms: {
        label: 'Платформы'
    },
    rating: {
        label: 'Рейтинг'
    },
    genres: {
        label: 'Жанр'
    },
    releaseDate: {
        label: 'Дата релиза',
        transform: (val: string) => val ? strToDate(val).toISOString() : null
    },
    length: {
        label: 'Продолжительность'
    },
    dima: {
        label: 'Дима'
    },
    timur: {
        label: 'Тимур'
    },
    maksim: {
        label: 'Максим'
    },
    guest: {
        label: 'Гость'
    }
}

export const updateRecommendations = async () => {
    if (!process.env.GOOGLE_SPREADSHEET_URL) return console.log('there is no GOOGLE_SPREADSHEET_URL')

    const pool = DB.getInstance()

    const res = await getRowList(process.env.GOOGLE_SPREADSHEET_URL, 'Рекомендации', 3);

    let values: unknown[] = []
    res.map((row) => {
        const value: unknown[] = []
        typedObjectKeys(RECOMMENDATIONS_COLUMN_MAP).map((key) => {
            const result = row[RECOMMENDATIONS_COLUMN_MAP[key].label]
            const transformedResult = RECOMMENDATIONS_COLUMN_MAP[key].transform ? RECOMMENDATIONS_COLUMN_MAP[key].transform?.(result) : result;
            value.push(transformedResult);
        })
        values.push(value);
    });

    await pool.query(`TRUNCATE TABLE zt_recommendation`)

    const query = PGformat(`INSERT INTO zt_recommendation (${Object.keys(RECOMMENDATIONS_COLUMN_MAP).join(', ')}) VALUES %L`, values)
    await pool.query(query);

    console.log('zt_recommendation table updated');
};