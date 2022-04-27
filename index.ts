import { Settings } from "./assets/classes/settings";
import { IRCWrapper } from "./assets/classes/ircWrapper";
import { WebserviceWrapper } from "./assets/classes/webserviceWrapper";

//const ROOT_PATH : string = 

class Main {
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