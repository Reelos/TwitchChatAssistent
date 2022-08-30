const fs = require('fs');
const fileName = 'notifierSettings.json';

export class Settings {

    //Username: string;
    //Password: string;
    Channel: string;
    Port : number;
    eventFunctions: Function[];

    constructor() {
        //this.Username = '';
        //this.Password = '';
        this.Channel = '';
        this.Port = 3000;
        this.eventFunctions = [];

        //this.tryLoadSettingsFile();
    }

    async tryLoadSettingsFile() {
        await fs.readFile(fileName, (err, data) => {
            if(err) {
                //console.warn('warn:', err);
                this.writeSettingsFile();
                return;
            } else {
                var read = data.toString('utf8');
                this.setSettingsFromJSON(read);
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

    protected removeVarsFromParse(key:string, value) {
        let removeKeys = ["eventFunctions"];
        for(let toRemove of removeKeys) {
            if(toRemove == key){
                return undefined;
            }
        }
        return value;
    }

    toJSONString(){
        return JSON.stringify(this, this.removeVarsFromParse, 2);
    }

    setSettingsFromJSON(jsonString: string) {
        let oldFile = false;
        let settingsObject = JSON.parse(jsonString);

        this.Channel = settingsObject.Channel;
        // Added Later
        if(settingsObject.Port != undefined)
        {
            this.Port = settingsObject.Port;
        }
        else
        {
            oldFile = true;
        }

        if(oldFile)
        {
            this.writeSettingsFile(false);
        }
    }

    async writeSettingsFile(invoke : boolean = true) {
        let settingsString = this.toJSONString();
        await fs.writeFile(fileName, settingsString, (error) => {
            if(error)
            {
                console.error(`${this.constructor.name}: An Error Occured trying to write the Settings File.`);
                console.error(`${error}`);
            }
            else
            {
                console.log(`${this.constructor.name}: The Settings File was changed.`);
                if(invoke) {
                    this.invokeChangedEvent();
                }
            }
        });
    }
}