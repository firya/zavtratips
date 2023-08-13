export const strToDate = (date: string): Date => {
    const dateArr = date.split(".");
    if (dateArr.length !== 3) return new Date();

    const [day, month, year] = dateArr.map((item) => parseInt(item, 10));
    if (!day || !month || !year) return new Date();
    return new Date(year, month - 1, day);
};

export const typedObjectKeys = <T extends object>(obj: T) => {
    return Object.keys(obj) as [keyof typeof obj]
}

export const escapeString = (str: string) => {
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}