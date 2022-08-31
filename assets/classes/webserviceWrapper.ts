const express = require('express');
import type { Settings } from "./settings";
const path = require('path');
const fs = require('fs');
import {fileURLToPath} from 'url';
import { Console } from "console";

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

export class WebserviceWrapper {
    port: number;
    app: any;
    server: any;
    settings: Settings;
    running: boolean;

    constructor(settings : Settings) {
        this.settings = settings;
        this.port = settings.Port;
        this.app = express();
        this.running = false;

        this.settings.addChangedEventFunction(this.startUpServer.bind(this));

        this.initialize();
    }

    initialize() {
        this.app.use(express.json());

        // define base for requests
        this.app.post('/settings', (req,res) => {
            if(req.body.Channel){
                this.settings.checkForOldFile(req.body);
                //this.settings.Channel = req.body.Channel;
                //this.settings.Port = req.body.Port;
                this.settings.writeSettingsFile();

                if(this.port != this.settings.Port) {
                    this.port = this.settings.Port;
                    this.restartServer();
                }
            }
            res.status(204).end();
        });

        this.app.get('/settings', (_req,res) => {
            res.end(this.settings.toJSONString());
        });

        this.app.get('/sounds', (_req,res) => {
            res.end(this.readAllAssetSoundFiles());
        })

        this.app.get('/style.css', (_req,res) => {
            res.sendFile('./style.css', {root: __dirname +'/../'});
        });

        this.app.get('/', (_req,res) => {
            res.sendFile('./index.html', {root: __dirname +'/../'});
        });
    }

    readAllAssetSoundFiles() {
        let result : string[] = [];

        result = fs.readdirSync(process.cwd() + "/assets/");
        //console.log(`${this.constructor.name}: Found Files -`, result);

        result = result.filter(file => file.endsWith(".wav") || file.endsWith(".mp3") || file.endsWith(".mid"));

        //console.log(`${this.constructor.name}: Fitlered Files -`, result);

        return JSON.stringify(result, null, 2);
    }
    
    startUpServer() {
        if(!this.running){
            // start listen
            this.port = this.settings.Port;
            this.server = this.app.listen(this.port, () => {
                console.log(`${this.constructor.name}: Server started listening on port ${this.port}`);
                this.running = true;
            });
        }
    }

    stopServer() {
        if(this.running) {
            this.server.close((err) => {
                if(err) {
                    console.log(`${this.constructor.name}: An error has occured trying to close the Server.`);
                } else {
                    this.running = false;
                    console.log(`${this.constructor.name}: Server stopped.`);
                }
            });
        }
    }

    serverStoppingTimout() {
        if(this.running) {
            console.log(`${this.constructor.name}: Attempting to stop Server.`);
            this.stopServer();
            setTimeout(this.serverStoppingTimout.bind(this), 5000)
        } else {
            console.log(`${this.constructor.name}: Attempting to start Server.`);
            this.startUpServer();
        }
    }

    restartServer()
    {
        if(this.running) {
            this.serverStoppingTimout();
        } else {
            console.log(`${this.constructor.name}: The Server is not active. Restart not possible.`);
        }
    }
}