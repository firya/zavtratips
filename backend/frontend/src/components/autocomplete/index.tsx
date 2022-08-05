import { useState, useEffect } from "react";
import { Form, AutoComplete } from "antd";
import { useDebounce } from "../../libs/debounce";
import API from "../../libs/api";

interface Iautocomplete {
  typeList: any;
  form: any;
}

const AutocmpleteField = ({ typeList, form }: Iautocomplete) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const searchValueDebounced = useDebounce(searchValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const typeProviderList = {
    imdb: [
      "🎬 Фильм",
      "🦁 Мультфильм",
      "🍿 Сериал",
      "🚶‍♂️ Мультсериал",
      "😸 Аниме",
      "🎞 Документалка",
      "🎤 Стендап",
    ],
    rawg: ["🎮 Игра"],
  };

  useEffect(() => {
    if (searchValueDebounced.length >= 3) {
      searchSuggestions(searchValueDebounced);
    }
  }, [searchValueDebounced]);

  const searchSuggestions = async (searchText: string) => {
    const type = form.getFieldValue("type");
    const provider = (
      Object.keys(typeProviderList) as (keyof typeof typeProviderList)[]
    ).find((key) => {
      return typeProviderList[key].indexOf(type) !== -1;
    });

    if (provider) {
      const result = await API({
        method: "GET",
        endpoint: "/search",
        data: {
          provider: provider,
          value: searchText,
        },
      });

      if (result.length > 0) {
        setSuggestions(
          result.map((item: any, i: number) => ({
            value: i.toString(),
            label: `${item.title} (${item.year})`,
            title: item.title,
            key: i,
            link: item.link,
          }))
        );
      }
    }
  };

  const selectSuggestion = (value: string, option: any) => {
    form.setFieldsValue({
      link: option.link,
      name: option.title,
    });
  };

  return (
    <Form.Item label="Name" name="name">
      <AutoComplete
        options={suggestions}
        onSearch={(value) => setSearchValue(value)}
        onSelect={selectSuggestion}
        className="input"
        size="large"
        tabIndex={2}
      />
    </Form.Item>
  );
};

export default AutocmpleteField;
