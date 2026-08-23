require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    ApplicationCommandType, 
    ApplicationCommandOptionType,
    MessageFlags
} = require('discord.js');
const fs = require('fs');
const config = require('./config.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds
    ] 
});

const userSettings = new Map();

const commands = [
    {
        name: '翻譯',
        description: '設定翻譯語言',
        integration_types: [0, 1], 
        contexts: [0, 1, 2],       
        options: [
            {
                name: 'target_lang',
                description: '翻譯後的語言',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    { name: '繁體中文', value: '繁體中文' },
                    { name: '簡體中文', value: '簡體中文' },
                    { name: 'English', value: 'English' },
                    { name: '日本語', value: '日本語' },
                    { name: '한국어', value: '한국어' },
                ]
            },
            {
                name: 'source_lang',
                description: '要翻譯的語言 (預設自動偵測)',
                type: ApplicationCommandOptionType.String,
                required: false,
                choices: [
                    { name: '自動偵測', value: '自動偵測' },
                    { name: '繁體中文', value: '繁體中文' },
                    { name: '簡體中文', value: '簡體中文' },
                    { name: 'English', value: 'English' },
                    { name: '日本語', value: '日本語' },
                ]
            }
        ]
    },
    {
        name: '翻譯此訊息',
        type: ApplicationCommandType.Message,
        integration_types: [0, 1],
        contexts: [0, 1, 2]
    }
];

client.once('clientReady', async () => {
    console.log(`✅ 機器人已登入為 ${client.user.tag}`);
    
    
    try {
        if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
            console.error('⚠️ 找不到 DISCORD_TOKEN 或 CLIENT_ID，請確認 .env 檔案設定！');
            return;
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        console.log('開始刷新應用程式 (/) 指令...');
        
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        
        console.log('✅ 成功重新載入應用程式 (/) 與右鍵選單指令！');
    } catch (error) {
        console.error('❌ 註冊指令時發生錯誤:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '翻譯') {
            const targetLang = interaction.options.getString('target_lang');
            const sourceLang = interaction.options.getString('source_lang') ?? '自動偵測';
                        const key = `${interaction.user.id}_${interaction.channelId}`;
            userSettings.set(key, { targetLang, sourceLang });
            await interaction.reply({
                content: `✅ 設定完成！\n**目標語言**：${targetLang}\n**原文語言**：${sourceLang}`,
                flags: MessageFlags.Ephemeral
            });
        }
    } 
    else if (interaction.isMessageContextMenuCommand()) {
        if (interaction.commandName === '翻譯此訊息') {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            
            const targetMessage = interaction.targetMessage.content;
            if (!targetMessage || targetMessage.trim() === '') {
                return interaction.editReply('此訊息沒有文字內容可以翻譯。');
            }

            const key = `${interaction.user.id}_${interaction.channelId}`;
            const settings = userSettings.get(key) || { targetLang: '繁體中文', sourceLang: '自動偵測' };
            const { targetLang, sourceLang } = settings;
            
            try {
                if (config.gemini && config.gemini.enabled) {
                    const apiKey = config.gemini.token;
                    const model = config.gemini.model;
                    
                    if (!apiKey) {
                        return interaction.editReply('❌ Gemini token 未設定，請至 config.js 設定。');
                    }
                    
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{ text: targetMessage }]
                            }],
                            systemInstruction: {
                                parts: [{ text: `你是一個專業的翻譯與字體轉換助理。\n請將以下使用者的文字翻譯或轉換為：「${targetLang}」。\n\n【嚴格規則】\n1. 只能輸出最終結果，絕對不要加上任何前言、解釋、引言或引號。\n2. 如果是中文之間的繁簡轉換（例如繁體轉簡體），請「逐字轉換字體」，絕對不要替換任何詞彙、不要改變語氣、不要進行改寫。必須保留所有原汁原味的用詞與顏文字（如 XD）。\n3. 如果是跨語言翻譯（如中翻英、英翻日），請提供流暢且準確的翻譯。` }]
                            },
                            generationConfig: {
                                temperature: 0.3
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Gemini API responded with status: ${response.status}`);
                    }

                    const data = await response.json();
                    
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        await interaction.editReply(data.candidates[0].content.parts[0].text.trim());
                    } else {
                        await interaction.editReply('❌ 翻譯失敗：Gemini API 回傳格式不正確。');
                    }
                } else {
                    const response = await fetch(`${config.ollama.url}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: config.ollama.model,
                            messages: [
                                {
                                    role: "system",
                                    content: `你是一個專業的翻譯與字體轉換助理。\n請將以下使用者的文字翻譯或轉換為：「${targetLang}」。\n\n【嚴格規則】\n1. 只能輸出最終結果，絕對不要加上任何前言、解釋、引言或引號。\n2. 如果是中文之間的繁簡轉換（例如繁體轉簡體），請「逐字轉換字體」，絕對不要替換任何詞彙、不要改變語氣、不要進行改寫。必須保留所有原汁原味的用詞與顏文字（如 XD）。\n3. 如果是跨語言翻譯（如中翻英、英翻日），請提供流暢且準確的翻譯。`
                                },
                                {
                                    role: "user",
                                    content: targetMessage
                                }
                            ],
                            stream: false,
                            temperature: 0.3
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Ollama API responded with status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    
                    if (data.message && data.message.content) {
                        await interaction.editReply(data.message.content);
                    } else {
                        await interaction.editReply('❌ 翻譯失敗：Ollama API 回傳格式不正確。');
                    }
                }
            } catch (error) {
                console.error('API 請求錯誤:', error);
                await interaction.editReply(`❌ 翻譯時發生錯誤，請確認 API 是否有啟動並正常運作。`);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
