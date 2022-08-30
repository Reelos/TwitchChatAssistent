import { Settings } from "./assets/classes/settings.js";
import { IRCWrapper } from "./assets/classes/ircWrapper.js";
import { WebserviceWrapper } from "./assets/classes/webserviceWrapper.js";

//const ROOT_PATH : string = 

export class Main {
    static settings : Settings;
    static ircWrapper : IRCWrapper;
    static webserviceWrapper : WebserviceWrapper;

    static async main() {
        this.settings = new Settings();
        this.webserviceWrapper = new WebserviceWrapper(this.settings);
        this.ircWrapper = new IRCWrapper(this.settings);
        await this.settings.tryLoadSettingsFile();
    }
}

Main.main();