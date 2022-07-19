import { podcastStat, totalStat } from "./stat";
import RowModel from "../models/row";
import * as mockingoose from "mockingoose";

describe("Stat", () => {
  let response;

  beforeEach(() => {
    response = [
      {
        _id: {
          $oid: "62d674ef23998ab4c6a39b69",
        },
        sheetTitle: "Выпуски",
        rowNumber: 3,
        data: {
          Дата: " 16.12.2015",
          Шоу: "Zavtracast",
          "Выпуск, №": "1",
          "Шоу и номер": "Zavtracast #001",
          Название: "Пилотный",
          "Полное название": "Zavtracast #001 — Пилотный",
          Продолжительность: "2:01:00",
          "Число рекомендаций": "",
        },
        __v: 0,
      },
      {
        _id: {
          $oid: "62d6729723998ab4c6a36853",
        },
        sheetTitle: "Рекомендации",
        rowNumber: 2,
        data: {
          Дата: " 16.12.2015",
          Выпуск: "Zavtracast #001",
          Тип: "🎮 Игра",
          Название: "Fallout 4",
          Ссылка: "https://rawg.io/games/3070",
          Изображение:
            "https://media.rawg.io/media/games/d82/d82990b9c67ba0d2d09d4e6fa88885a7.jpg",
          Описание:
            "<p><a herf='https://rawg.io/games/3070'>rawg.io</a>: 84</p><p>Жанры: Action, RPG</p><p>Платформы: Xbox One, PC, PlayStation 4</p><p>Продолжительность: 09.11.2015</p><p>Дата релиза: 27 / 81 / 157 часов</p>",
          Платформы: "Xbox One, PC, PlayStation 4",
          Рейтинг: "84",
          Жанр: "Action, RPG",
          "Дата релиза": "09.11.2015",
          Продолжительность: "27 / 81 / 157 часов",
          Дима: "",
          Тимур: "❌",
          Максим: "",
          Гость: "",
        },
        __v: 0,
      },
      {
        _id: {
          $oid: "62d6729723998ab4c6a36854",
        },
        sheetTitle: "Рекомендации",
        rowNumber: 3,
        data: {
          Дата: " 16.12.2015",
          Выпуск: "Zavtracast #001",
          Тип: "🎮 Игра",
          Название: "Final Fantasy VII (PS4)",
          Ссылка: "https://rawg.io/games/52939",
          Изображение:
            "https://media.rawg.io/media/games/6c0/6c00ee85d1344f58c469e8e47fd8ae7c.jpg",
          Описание:
            "<p><a herf='https://rawg.io/games/52939'>rawg.io</a></p><p>Жанры: Action, Adventure, RPG</p><p>Платформы: Android, PS Vita, PlayStation 2, Nintendo Switch, PC, iOS, PlayStation, PlayStation 3, PlayStation 4, Xbox One, PSP</p><p>Продолжительность: 31.01.1997</p>",
          Платформы:
            "Android, PS Vita, PlayStation 2, Nintendo Switch, PC, iOS, PlayStation, PlayStation 3, PlayStation 4, Xbox One, PSP",
          Рейтинг: "",
          Жанр: "Action, Adventure, RPG",
          "Дата релиза": "31.01.1997",
          Продолжительность: "",
          Дима: "👍",
          Тимур: "👍",
          Максим: "",
          Гость: "",
        },
        __v: 0,
      },
    ];
  });

  jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  test("podcastStat", async () => {
    mockingoose(RowModel).toReturn(response);
    const result = await podcastStat();
    expect(result).toEqual({
      count: 3,
      length: "29:01:00",
      onAir: "4 года 0 месяцев 17 дней",
    });
  });
  test("totalStat", async () => {
    mockingoose(RowModel).toReturn(response);
    const result = await totalStat();
    expect(result).toEqual({
      byType: {
        "🎮 Игра": 2,
      },
      total: 3,
    });
  });
});
