const fs = require ('fs');

export class Settings {

    //Username: string;
    //Password: string;
    Channel: string;
    eventFunctions: Function[];

    constructor() {
        //this.Username = '';
        //this.Password = '';
        this.Channel = '';
        this.eventFunctions = [];

        //this.tryLoadSettingsFile();
    }

    async tryLoadSettingsFile() {
        await fs.readFile('settings.json', (err, data) => {
            if(err) {
                //console.warn('warn:', err);
                this.writeSettingsFile();
                return;
            } else {
                var read = data.toString('utf8');
                var settings = JSON.parse(read);

                //this.Username = settings.Username;
                //this.Password = settings.Password;
                this.Channel = settings.Channel;
                this.invokeChangedEvent();
            }
        });
    }

    addChangedEventFunction(eventFunc: Function) {
        this.eventFunctions.push(eventFunc);
    }

    invokeChangedEvent() {
        this.eventFunctions.forEach( event => event());
    }

    toJSONString(){
        return JSON.stringify(this, null, 2);
    }

    setSettingsFromJSON(jsonString: string) {
        let settingsObject = JSON.parse(jsonString);
        this.Channel = settingsObject.Channel;
    }

    async writeSettingsFile() {
        var settingsString = JSON.stringify(this, null, 2);
        await fs.writeFile('settings.json', settingsString, (error) => {
            if(error)
            {
                console.error("An Error Occured");
                console.error(`${error}`);
            }
            else
            {
                console.log('the settings file was changed');
                this.invokeChangedEvent();
            }
        });
    }
}