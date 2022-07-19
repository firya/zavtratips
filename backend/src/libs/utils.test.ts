import {
  leftPad,
  formatDate,
  splitName,
  sumTime,
  strToDate,
  wordDeclension,
  convertYoutubeDuration,
} from "./utils";

describe("leftPad", () => {
  test("Correct one number parameter", () => {
    expect(leftPad(1)).toBe("1");
  });
  test("Correct two parameter", () => {
    expect(leftPad(1, 3)).toBe("001");
  });
  test("Minus one", () => {
    expect(leftPad(-1, 3)).toBe("-001");
  });
  test("Infinity", () => {
    expect(leftPad(-Infinity, 10)).toBe("Infinity");
  });
});

describe("formatDate", () => {
  test("correct", () => {
    expect(formatDate(new Date(2022, 6, 12))).toBe("12.07.2022");
  });
  test("correct separator", () => {
    expect(formatDate(new Date(2022, 6, 12), "/")).toBe("12/07/2022");
  });
});

describe("splitName", () => {
  test("Full name", () => {
    expect(splitName("Name / Alter name (Description)")).toEqual({
      name: "Name",
      anothername: "Alter name",
      description: "Description",
    });
  });
  test("Name with description", () => {
    expect(splitName("Name (Description)")).toEqual({
      name: "Name",
      anothername: "",
      description: "Description",
    });
  });
  test("Name with alter name", () => {
    expect(splitName("Name / Alter name")).toEqual({
      name: "Name",
      anothername: "Alter name",
      description: "",
    });
  });
  test("Empty string", () => {
    expect(splitName("")).toEqual({
      name: "",
      anothername: "",
      description: "",
    });
  });
});

describe("sumTime", () => {
  test("correct", () => {
    expect(sumTime(["02:01:04", "02:58:56"])).toBe("05:00:00");
  });
  test("empty array", () => {
    expect(sumTime([])).toBe("00:00:00");
  });
  test("different length", () => {
    expect(sumTime(["01:02:03", "03:02"])).toBe("04:04:03");
  });
  test("not time", () => {
    expect(sumTime(["01:02:03", "sdf"])).toBe("01:02:03");
  });
  test("empty time string", () => {
    expect(sumTime(["01:02:03", ""])).toBe("01:02:03");
  });
});

describe("strToDate", () => {
  jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  test("correct", () => {
    expect(strToDate("12.05.2012")).toEqual(new Date(2012, 4, 12));
  });
  test("empty", () => {
    expect(strToDate("")).toEqual(new Date());
  });
  test("not date", () => {
    expect(strToDate("asdas")).toEqual(new Date());
  });
  test("domain", () => {
    expect(strToDate("asdas.asd.asd")).toEqual(new Date());
  });
});

describe("wordDeclension", () => {
  const daysDeclension = ["день", "дня", "дней"];

  test("correct", () => {
    expect([
      wordDeclension(0, daysDeclension),
      wordDeclension(1, daysDeclension),
      wordDeclension(2, daysDeclension),
      wordDeclension(3, daysDeclension),
      wordDeclension(4, daysDeclension),
      wordDeclension(5, daysDeclension),
      wordDeclension(6, daysDeclension),
      wordDeclension(7, daysDeclension),
      wordDeclension(8, daysDeclension),
      wordDeclension(9, daysDeclension),
      wordDeclension(10, daysDeclension),
      wordDeclension(11, daysDeclension),
      wordDeclension(21, daysDeclension),
    ]).toEqual([
      "0 дней",
      "1 день",
      "2 дня",
      "3 дня",
      "4 дня",
      "5 дней",
      "6 дней",
      "7 дней",
      "8 дней",
      "9 дней",
      "10 дней",
      "11 дней",
      "21 день",
    ]);
  });

  test("Infinity", () => {
    expect([wordDeclension(Infinity, daysDeclension)]).toEqual([
      "Infinity дней",
    ]);
  });

  test("Minus one", () => {
    expect([wordDeclension(-1, daysDeclension)]).toEqual(["-1 день"]);
  });

  test("Empty declensions", () => {
    expect([wordDeclension(1, [])]).toEqual(["1"]);
  });
});

describe("convertYoutubeDuration", () => {
  test("Correct", () => {
    expect(convertYoutubeDuration("PT3H2M31S")).toBe("03:02:31");
  });
  test("Empty string", () => {
    expect(convertYoutubeDuration("")).toBe("00:00:00");
  });
  test("Random string", () => {
    expect(convertYoutubeDuration("lkjdhsffsklj")).toBe("00:00:00");
  });
  test("Not totally same format string", () => {
    expect(convertYoutubeDuration("PT3H31S")).toBe("03:00:31");
  });
});
