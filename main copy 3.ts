//голвый файл
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import axios from 'axios';
import * as https from 'https';
import * as fs from 'fs';
import fetch from 'node-fetch';
// Remember to rename these classes and interfaces!

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

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
		this.addContextMenu();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async getAccessToken() {
		const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
			'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
		};
	
		const data = {
			scope: 'GIGACHAT_API_PERS',
		};
		// Работа с сертификатом
		//const certBuffer = fs.readFileSync('C:\\Users\\skiner\\Documents\\OUTERHEAVEN\\russian_trusted_root_ca.cer');
		//const certBuffer = fs.readFileSync('./russian_trusted_root_ca.cer');
		const certBuffer = await fs.promises.readFile('./russian_trusted_root_ca.cer');
		// Создание агента с сертификатом
		const axiosConfig = {
			httpsAgent: new https.Agent({
				ca: certBuffer,
			}),
		};
	
		try {
			const response = await axios.post(apiUrl, new URLSearchParams(data), { headers, ...axiosConfig });
			console.log('getAccessToken result:', response.data);
		// Здесь можно добавить логику обработки результата, если это необходимо
		} catch (error) {
			console.error('Error in getAccessToken:', error);
		// Обработка ошибок
		}
	}

	async getAccessToken2() {
		const apiUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
			'RqUID': '89a05b68-c017-4799-a3a3-2a13acc0aa0f',
			'Authorization': 'Basic N2NmY2YxOWEtOWJmOS00ZDJkLWI0YTEtNzhkMmI1YTAwNjU1Ojg5YTA1YjY4LWMwMTctNDc5OS1hM2EzLTJhMTNhY2MwYWEwZg==',
		};
	
		const data = new URLSearchParams({
			scope: 'GIGACHAT_API_PERS',
		});
	
		// Работа с сертификатом
		const certBuffer = fs.readFileSync('./russian_trusted_root_ca.cer');
		
		const options = {
			method: 'POST',
			body: data,
			headers,
			agent: new https.Agent({
				ca: certBuffer,
			}),
		};
	
		try {
			const response = await fetch(apiUrl, options);
			const result = await response.json();
			console.log('getAccessToken2 result:', result);
			// Здесь можно добавить логику обработки результата, если это необходимо
		} catch (error) {
			console.error('Error in getAccessToken2:', error);
			// Обработка ошибок
		}
	}

	addContextMenu() {
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('Обработать текст в ChatGPT');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						//await this.processSelectText();
					});
				});
				menu.addItem((item) => {
					item.setTitle('Получить токен');
					item.setIcon('Keyboard');
					item.onClick(async () => {
						//await getAccessToken();
						try {
							// Вызываем функцию getAccessSSL и получаем результат
							const result = await this.getAccessToken2();
				
							// Выводим результат в консоль
							console.log('getAccessToken2 result:', result);
				
							// Теперь вы можете добавить логику обработки результата, если это необходимо
						} catch (error) {
							// Если произошла ошибка, выводим её в консоль
							console.error('Error in getAccessToken2:', error);
						}
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
