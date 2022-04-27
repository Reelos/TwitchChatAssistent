const express = require('express');
import { Settings } from "./settings";

export class WebserviceWrapper {
    port: number;
    app: any;
    settings: Settings;
    running: boolean;

    constructor(settings : Settings) {
        this.settings = settings;
        this.port = 3000
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
                this.settings.Channel = req.body.Channel;
                this.settings.writeSettingsFile();
            }
            res.status(204).end();
        });

        this.app.get('/settings', (req,res) => {
            res.end(this.settings.toJSONString());
        });

        this.app.get('/style.css', (req,res) => {
            res.sendFile('./style.css', {root: __dirname +'/../'});
        });

        this.app.get('/', (req,res) => {
            res.sendFile('./index.html', {root: __dirname +'/../'});
        });
    }
    
    startUpServer() {
        if(!this.running){
            // start listen
            this.app.listen(this.port, () => {
                console.log(`${this.constructor.name}: started listening on port ${this.port}`);
            });
            this.running = true;
        }
    }
}