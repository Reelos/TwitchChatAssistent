import { json } from "node:stream/consumers";
import { resourceLimits } from "worker_threads";

const fs = require('fs');
const fileName = 'notifierSettings.json';

export class Settings {

    //Username: string;
    //Password: string;
    Channel: string;
    Port : number;
    SoundFile: string;
    SoundTimeout: number;
    MutedList: string[];

    eventFunctions: Function[];
    settingsFieldList: string[];

    constructor() {
        //this.Username = '';
        //this.Password = '';
        this.Channel = '';
        this.Port = 3000;
        this.SoundFile = "new_message.mp3";
        this.SoundTimeout = 5;
        this.MutedList = [];

        // ignored Field
        this.eventFunctions = [];
        this.settingsFieldList = ["Channel", "Port", "SoundFile", "SoundTimeout", "MutedList"]

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
        let removeKeys = ["eventFunctions", "settingsFieldList"];
        for(let toRemove of removeKeys) {
            if(toRemove == key){
                return undefined;
            }
        }
        return value;
    }

    toJSONString() {
        return JSON.stringify(this, this.removeVarsFromParse, 2);
    }

    checkForOldFile(jsonRead :object) {
        let result = false;
        //console.log(`${this.constructor.name}: Check for Old File`);
        //console.log(`${this.constructor.name}: File Data -`, jsonRead);
        this.settingsFieldList.forEach((field) => {
            //console.log(`${this.constructor.name}: Check for Field - ${field}`);
            if(field in jsonRead) {
                console.log(`${this.constructor.name}: ${field} = ${Reflect.get(jsonRead, field)}`);
                Reflect.set(this, field, Reflect.get(jsonRead, field));
            } else {
                result = true;
            }
        });
        return result;
    }

    setSettingsFromJSON(jsonString: string) {
        let oldFile = false;
        let settingsObject = JSON.parse(jsonString);

        oldFile = this.checkForOldFile(settingsObject);

        if(oldFile)
        {
            console.log(this.constructor.name, ": Old File Detected, Update by saving Base Values");
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