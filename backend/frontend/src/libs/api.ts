import qs from "qs";
import { hostURL } from "../dev";

interface IapiProps {
	method: "POST" | "GET" | "PUT" | "DELETE";
	endpoint: string;
	data?: {};
	headers?: {};
}

const API = (props: IapiProps): Promise<any> => {
	const { method = "GET", data = {}, endpoint, headers = {} } = props;

	let url: string = `${hostURL}/api${endpoint}`;

	if (method === "GET") {
		url += `?${qs.stringify(data)}`;
	}

	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(url, {
				method,
				headers: {
					...headers,
					"Content-Type": "application/json; charset=UTF-8",
				},
				body: method === "GET" ? null : JSON.stringify(data),
			});
			const result = await response.json();

			if (result.error) {
				reject(result);
			} else {
				resolve(result);
			}
		} catch (e) {
			reject({ error: e });
		}
	});
};

export default API;
