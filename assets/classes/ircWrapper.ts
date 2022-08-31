const tmi = require('tmi.js');
import type { Settings } from "./settings";
const player = require("play-sound");

export class IRCWrapper {
    settings: Settings;
    lastSendSound: number;
    currentChannel: string;
    app: any;
    client: any;


    constructor(settings: Settings) {
        this.settings = settings;
        this.lastSendSound = Date.now();
        this.currentChannel = "";
        this.client = null;

        this.settings.addChangedEventFunction(this.initializeTwitchConnection.bind(this));
    }

    initializeTwitchConnection() {
        if(this.currentChannel.toLowerCase().trim() !== this.settings.Channel.toLocaleLowerCase().trim()) {
            if(this.client != null) {
                this.client.disconnect();
            }

            if(this.settings.Channel.length > 0) {
                var opts = {
                    channels: [this.settings.Channel],
                }
                this.currentChannel = this.settings.Channel;
                console.log(`${this.constructor.name}: Channel = ${this.settings.Channel}`);

                this.client = tmi.client(opts);

                this.client.on("connected", this.onConnectedHandler.bind(this));
                this.client.on("message", this.onMessageHandler.bind(this));
                this.client.on("disconnected", this.onDisconnectedHandler.bind(this));

                this.client.connect();
            }
        }
    }

    onConnectedHandler(addr, port) {
        console.log(`${this.constructor.name}: connection to Twitch Chat "${this.settings.Channel}" Established via ${addr}:${port}`);
    }

    async onMessageHandler(_target, _context, _msg, self) {
        if(self) return;
        console.log("* new Message in Chat", this.settings.Channel);

        let diff  = Date.now() - this.lastSendSound;
        let timeout = this.settings.SoundTimeout * 1000;

        if(diff >= timeout) {
            player().play(process.cwd() + "/assets/new_message.mp3", (err) => {
                if (err) {
                    console.log(`${this.constructor.name}: !!ERROR!! unable to play sound ~ ${err}`);
                }
            });
            this.lastSendSound = Date.now();
        } else {
            console.log("** timeout for next Sound", (timeout - diff) / 1000);
        }
    }

    onDisconnectedHandler(reason) {
        console.log(`${this.constructor.name}: Disconnected from Twitch: ${reason}`);
    }
}