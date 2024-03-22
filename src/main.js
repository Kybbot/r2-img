const listSection = document.querySelector("#listSection");

const getListOfFiles = async () => {
	try {
		const response = await fetch(`${import.meta.env.VITE_URL}/list`, {
			headers: {
				"ngrok-skip-browser-warning": "69420",
			},
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error("Error during data retrieval");
		}

		return data.data;
	} catch (error) {
		console.error("Error: ", error.message);
		throw new Error(error.message);
	}
};

const getFileLink = async (fileName) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_URL}/presigned-url-get?key=${fileName}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420",
			},
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error("Error during data retrieval");
		}

		return data.url;
	} catch (error) {
		console.error("Error: ", error.message);
		throw new Error(error.message);
	}
};

const renderListOfFiles = async () => {
	try {
		const list = await getListOfFiles();

		const arr = list.map((item) => {
			const article = document.createElement("article");
			const h3 = document.createElement("h3");
			h3.textContent = item.key;

			const button = document.createElement("button");
			button.type = "button";
			button.textContent = "Get Link";

			button.addEventListener("click", async () => {
				button.textContent = "Loading";
				button.disabled = true;

				const key = button.dataset.key;

				try {
					const url = await getFileLink(key);

					const a = document.createElement("a");
					a.href = url;
					a.textContent = url;
					a.target = "_blank";

					await fetch(url);

					article.replaceChild(a, button);
				} catch (error) {
					button.textContent = "Get Link";
					button.disabled = false;

					const p = document.createElement("p");
					p.textContent = error.message;
					article.append(p);
				}
			});

			button.setAttribute("data-key", item.key);
			article.append(h3);
			article.append(button);

			return article;
		});

		listSection.replaceChildren(...arr);
	} catch (error) {
		const p = document.createElement("p");
		p.textContent = error.message;

		listSection.replaceChildren(p);
	}
};

renderListOfFiles();

const uploadFileForm = document.querySelector("#uploadFileForm");
const fileInput = document.querySelector("#fileInput");
const formError = document.querySelector("#formError");

const getPresignedUrlForPost = async (fileName) => {
	try {
		const response = await fetch(`${import.meta.env.VITE_URL}/presigned-url-post?key=${fileName}`, {
			headers: {
				"ngrok-skip-browser-warning": "69420",
			},
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error("Error during presigned-url retrieval");
		}

		return data.url;
	} catch (error) {
		console.error("Error: ", error.message);
		throw new Error(error.message);
	}
};

const uploadFileToR2 = async (url, formData) => {
	try {
		const response = await fetch(url, {
			method: "PUT",
			body: formData,
			headers: {
				"ngrok-skip-browser-warning": "69420",
			},
		});
		const data = await response.json();

		if (!response.ok) {
			throw new Error("Error while sending a file");
		}

		return data;
	} catch (error) {
		console.error("Error: ", error.message);
		throw new Error(error.message);
	}
};

uploadFileForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const file = fileInput.files[0];
	if (!file) return;

	try {
		const presignedUrl = await getPresignedUrlForPost(file.name);

		if (presignedUrl) {
			const formData = new FormData();
			formData.append("file", file);

			await uploadFileToR2(presignedUrl, formData);

			renderListOfFiles();
		}
	} catch (error) {
		formError.textContent = error.message;
	}
});
