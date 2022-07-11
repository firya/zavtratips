import { useState, useEffect } from "react";
import {
	Form,
	Button,
	Input,
	Skeleton,
	AutoComplete,
	notification,
} from "antd";
import API from "../../libs/api";
import { generateName } from "../../libs/utils";

const AddRecommendation = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingPodcastList, setLoadingPodcastList] = useState<boolean>(true);
	const [podcastList, setPodcastList] = useState<any[]>([]);
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [form] = Form.useForm();

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
		other: [
			"🎲 Настольная игра",
			"📦 Вещь",
			"📱 Техника",
			"💽 Софт",
			"📕 Книга",
			"🌅 Манга",
			"💬 Статья",
			"🔗 Ссылка",
			"🍔 Еда",
			"🍺 Пиво",
			"🍷 Бухло",
			"🎶 Мюзикл",
			"🕺 Событие",
			"📍 Место",
		],
	};

	const typeList = [
		...typeProviderList.imdb,
		...typeProviderList.rawg,
		...typeProviderList.other,
	];

	const recomendList = ["", "👍", "❌"];

	useEffect(() => {
		loadPodcastList();
	}, []);

	useEffect(() => {
		if (podcastList.length > 0) {
			form.setFieldsValue({
				podcast: 0,
			});
		}
	}, [podcastList]);

	const loadPodcastList = async () => {
		const result = await API({
			method: "GET",
			endpoint: "/rows",
			data: {
				sheetTitle: "Выпуски",
				limit: 0,
				order: -1,
			},
		});

		setPodcastList(result);
		setLoadingPodcastList(false);
	};

	const searchSuggestions = async (searchText: string) => {
		const type = form.getFieldValue("type");
		const provider = (
			Object.keys(typeProviderList) as (keyof typeof typeProviderList)[]
		).find((key) => {
			return typeProviderList[key].indexOf(type) !== -1;
		});

		if (provider !== "other") {
			const result = await API({
				method: "GET",
				endpoint: "/search",
				data: {
					provider: provider,
					value: searchText,
				},
			});

			setSuggestions(
				result.map((item: any, i: number) => ({
					value: i,
					label: `${item.title} (${item.year})`,
					title: item.title,
					key: i,
					link: item.link,
				}))
			);
		}
	};

	const selectSuggestion = (value: string, option: any) => {
		form.setFieldsValue({
			link: option.link,
			name: option.title,
		});
	};

	const onFinish = async (values: any) => {
		console.log(values);
		if (!loading) {
			setLoading(true);
			try {
				await API({
					method: "POST",
					endpoint: "/rows",
					data: {
						dataCheckString: window.Telegram.WebApp.initData,
						sheetTitle: "Рекомендации",
						data: {
							Выпуск: podcastList[values.podcast].data["Шоу и номер"],
							Тип: values.type,
							Название: generateName(
								values.name,
								values.anothername,
								values.description
							),
							Ссылка: values.link,
							Дима: values.dima,
							Тимур: values.timur,
							Максим: values.maksim,
							Гость: values.guest,
						},
					},
				});

				notification.open({
					message: "Recommendation added",
					description: "",
					placement: "top",
				});
				form.resetFields();
			} catch (e: any) {
				notification.open({
					message: e.error.message,
					description: "",
					placement: "top",
				});
			}
			setLoading(false);
		}
	};

	return (
		<Form
			name="basic"
			initialValues={{ remember: true }}
			onFinish={onFinish}
			autoComplete="off"
			layout="vertical"
			form={form}
			style={{ padding: "24px" }}
		>
			<Form.Item label="Podcast" name="podcast">
				<select className="select" tabIndex={0}>
					{podcastList.map((podcast, i) => (
						<option value={i} key={i}>
							{podcast.data["Шоу и номер"]}
						</option>
					))}
				</select>
			</Form.Item>

			{loadingPodcastList ? (
				<Skeleton active />
			) : (
				<>
					<Form.Item label="Type" name="type" initialValue={typeList[0]}>
						<select className="select" tabIndex={1}>
							{typeList.map((type, i) => (
								<option value={type} key={i}>
									{type}
								</option>
							))}
						</select>
					</Form.Item>
					<Form.Item label="Name" name="name">
						<AutoComplete
							options={suggestions}
							onSearch={searchSuggestions}
							onSelect={selectSuggestion}
							className="input"
							size="large"
							tabIndex={2}
						/>
					</Form.Item>
					<Form.Item label="Another name" name="anothername">
						<Input className="input" size="large" tabIndex={3} />
					</Form.Item>
					<Form.Item label="Description" name="description">
						<Input className="input" size="large" tabIndex={4} />
					</Form.Item>
					<Form.Item label="Link" name="link">
						<Input className="input" size="large" tabIndex={5} />
					</Form.Item>

					<Form.Item label="Dima" name="dima">
						<select className="select" tabIndex={6}>
							{recomendList.map((emoji, i) => (
								<option value={emoji} key={i}>
									{emoji}
								</option>
							))}
						</select>
					</Form.Item>

					<Form.Item label="Timur" name="timur">
						<select className="select" tabIndex={7}>
							{recomendList.map((emoji, i) => (
								<option value={emoji} key={i}>
									{emoji}
								</option>
							))}
						</select>
					</Form.Item>

					<Form.Item label="Maksim" name="maksim">
						<select className="select" tabIndex={8}>
							{recomendList.map((emoji, i) => (
								<option value={emoji} key={i}>
									{emoji}
								</option>
							))}
						</select>
					</Form.Item>
					<Form.Item label="Guest" name="guest">
						<Input className="input" size="large" tabIndex={9} />
					</Form.Item>
				</>
			)}

			<Form.Item>
				<Button type="primary" htmlType="submit" loading={loading}>
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

export default AddRecommendation;
