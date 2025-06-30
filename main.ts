import { App, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import axios from 'axios';
import * as https from 'https';
//import * as fs from 'fs';
//import * as path from 'path';
// Импортируйте fetch из node-fetch
//import fetch from 'electron-fetch';
//import * as fetch from 'electron-fetch';
// Remember to rename these classes and interfaces!
//import Agent from 'https';
import * as childProcess from 'child_process';
//import * as path from 'path';
interface MyPluginSettings {
	mySetting: string;
	llmProviderSetting: string;
	apiKeySetting: string;
	basePathSetting: string;
	modelSetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	llmProviderSetting: 'default',
	apiKeySetting: 'default',
	basePathSetting: 'default',
	modelSetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			new Notice('This is a notice!');
		});
		ribbonIconEl.addClass('my-plugin-ribbon-class');
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						new SampleModal(this.app).open();
					}
					return true;
				}
			}
		});
		this.addContextMenu();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		//стартуем прокси сервер
		this.startProxyServer();
		// Проверяем доступность прокси-сервера при загрузке плагина
        const isProxyServerAvailable = await this.checkProxyServerAvailability();
        if (isProxyServerAvailable) {
            console.log('Proxy server is available.');
        } else {
            console.error('Proxy server is not available. Please check your configuration.');
        }
	}
	//запускаем прокси сервер
    startProxyServer() {
		const proxyPath = normalizePath(`${this.app.vault.adapter.basePath}/${'.obsidian/plugins/GigaTest1/proxy-server.mjs'}`);
		const proxyProcess = childProcess.spawn('node', [proxyPath]);
        proxyProcess.on('error', (err) => {
			console.error('Error starting proxy server:', err);
        });
        console.log('Proxy server started successfully!');
    }
	// Функция для проверки доступности прокси-сервера
	async checkProxyServerAvailability(): Promise<boolean> {
		const proxyUrl = 'http://localhost:3000/api/v2/oauth'; 
	
		try {
			const response = await axios.head(proxyUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
			return response.status === 200;
		} catch (error) {
			return false;
		}
	}
	//обработка текста
	async processSelectText() {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			const selectedText = editor.getSelection();
			if (selectedText.trim() !== '') {
				try {
					//отправка на обработку
					//const gptResponse = await this.sendToChatGPT(selectedText);
					const gigaResponse = await this.sendChatCompletionRequest(selectedText);
					//const gigaResponse = await this.getAccessToken();
					//вставка ответа
					//editor.replaceSelection(gptResponse);
					editor.replaceSelection(gigaResponse);
					//втсавка строчкой ниже
					const currentPosition = editor.getCursor();
					//editor.replaceRange(gptResponse, currentPosition);
					editor.replaceRange(gigaResponse, currentPosition);
				} catch (error) {
					console.error('Ошибка обработки текста: ', error);
					new Notice('Ошибка обработки текста. Подробности в консоли');
				}
			}
		}
	}
	async processSelectText2() {
		const selectedText = 'добрый день';
		try {
			const gigaResponse = await this.sendChatCompletionRequest(selectedText);
			console.log('Ответ от GigaChat', gigaResponse);
		
	} catch (error) {
		console.error('Ошибка обработки текста: ', error);
		new Notice('Ошибка обработки текста. Подробности в консоли');
		}
	}
	async processSelectText3() {
		const proxyUrl = 'http://localhost:3000/api/v2/oauth';
		try {
			//const response = await axios.post(proxyUrl, new URLSearchParams(data), { headers });
			const response = await axios.post(proxyUrl);
			//обработка полученного ответа и его разбивка на токен и время действия токена  
			console.log('Ответ от GigaChat', response.data)
		} catch (error) {
			console.error('Error in processSelectText3', error);
		}
	}
	async processSelectText4() {
		const proxyUrl1 = 'http://localhost:3000/api/v2/oauth';
		const proxyUrl2 = 'http://localhost:3000/api/v1/chat/completions';
		try {
			//const response = await axios.post(proxyUrl, new URLSearchParams(data), { headers });
			const response = await axios.post(proxyUrl1);
			//const mes = 'скажи котик';
			//обработка полученного ответа и его разбивка на токен и время действия токена  
			console.log('Токен от GigaChat', response.data)
			if (response) {
				const mes = 'скажи котик';
				console.log('передача прокси серверу значения', mes)
				//const answer = await axios.post(proxyUrl2, { request: mes}, { headers: { 'Content-Type': 'application/json', }, });
				const answer = await axios.post(proxyUrl2, mes);
				//console.log('Ответ от GigaChat', answer.data);
				//console.log('Ответ от GigaChat', answer.choices[0].message.content);
				console.log('Ответ от GigaChat', answer.data.choices[0].message.content);
			}
			else {
				console.log('Не удалось получить токен доступа.');
			}
		} 
		catch (error) {
			console.error('Error in processSelectText3', error);
		}
	}
	//получение токена
	async getAccessToken() {
		// Используем URL прокси-сервера вместо API Sberbank
		const proxyUrl = 'http://localhost:3000/api/v2/oauth'; // Замените на свой адрес прокси-сервера
		// Здесь мы отправляем запрос не напрямую на API Sberbank, а на прокси-сервер
		try {
			//const response = await axios.post(proxyUrl, new URLSearchParams(data), { headers });
			const response = await axios.post(proxyUrl);
			//обработка полученного ответа и его разбивка на токен и время действия токена  
			const { access_token, expires_at } = response.data;
			console.log('getAccessToken Токен доступа:', access_token);
			console.log('getAccessToken Токен действует: ', new Date(expires_at));
			return access_token;
		} catch (error) {
			console.error('Error in getAccessToken:', error);
		}
	}
	//общение с GigaChat
	async sendChatCompletionRequest(messageContent: string) {
		//получим токен из функции выше 
		//const accessToken = await this.getAccessToken();
		//работае через локальный прокси сервер
		const proxyUrl = 'http://localhost:3000/api/v1/chat/completions';
		try {
			//const response = await axios.post(proxyUrl, requestData, axiosConfig);
			const response = await axios.post(proxyUrl);
			return response.data;
		} catch (error) {
			console.error('Error:', error.message);
			return null;
		}
	}
	addContextMenu() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('Обработать текст в GigaChat');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						await this.processSelectText();
					});
				});
				menu.addItem((item) => {
					item.setTitle('Получить токен');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						//await getAccessToken();
						try {
							// Вызываем функцию getAccessSSL и получаем результат
							const result = await this.getAccessToken();
							// Выводим результат в консоль
							console.log('результат нажатия на кнопку Получить токен result:', result);
							// Теперь вы можете добавить логику обработки результата, если это необходимо
						} catch (error) {
							// Если произошла ошибка, выводим её в консоль
							console.error('Error in getAccessToken:', error);
						}
					});
				});
				menu.addItem((item) => {
					item.setTitle('GigaChat');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						await this.processSelectText2();
					});
				});
				menu.addItem((item) => {
					item.setTitle('Test1');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						await this.processSelectText3();
					});
				});
				menu.addItem((item) => {
					item.setTitle('Test2');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						await this.processSelectText4();
					});
				});
			})
		);
	}
	onunload() {
	}
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}
	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;
	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Настройки плагина GigaObsidian'});
		new Setting(containerEl)
			.setName('LLM Provider')
			.setDesc('LLM Provider')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.llmProviderSetting)
				.onChange(async (value) => {
					this.plugin.settings.llmProviderSetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('API Key')
			.setDesc('API Key')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.apiKeySetting)
				.onChange(async (value) => {
					this.plugin.settings.apiKeySetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Base Path')
			.setDesc('Base Path')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.basePathSetting)
				.onChange(async (value) => {
					this.plugin.settings.basePathSetting = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Model')
			.setDesc('Model')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.modelSetting)
				.onChange(async (value) => {
					this.plugin.settings.modelSetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
