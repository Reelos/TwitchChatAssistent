const tmi = require('tmi.js');
import { Settings } from "./settings";

const player = require("play-sound")();

export class IRCWrapper {
    settings: Settings;
    port: number;
    app: any;
    client: any;

    constructor(settings: Settings) {
        this.settings = settings;
        this.client = null;

        this.settings.addChangedEventFunction(this.initializeTwitchConnection.bind(this));
    }

    initializeTwitchConnection() {
        if(this.client != null) {
            this.client.disconnect();
        }

        if(this.settings.Channel.length > 0) {
            var opts = {
                channels: [this.settings.Channel],
            }
            console.log(`Channel: ${this.settings.Channel}`);

            this.client = tmi.client(opts);

            this.client.on("connected", this.onConnectedHandler);
            this.client.on("message", this.onMessageHandler.bind(this));
            this.client.on("disconnected", this.onDisconnectedHandler);

            this.client.connect();
        }
    }

    onConnectedHandler(addr, port) {
        console.log(`connection to Twitch Established via ${addr}:${port}`);
    }

    onMessageHandler(target, context, msg, self) {
        if(self) return;
        console.log("* new Message in Chat", this.settings.Channel);
        player.play(process.cwd() + "/assets/new_message.mp3", (err) => {
            if (err) console.log(`ERROR: unable to play sound ~ ${err}`);
        });
    }

    onDisconnectedHandler(reason) {
        console.log(`Disconnected from Twitch: ${reason}`);
    }
}