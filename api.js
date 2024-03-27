import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';
import * as Speech from 'expo-speech';
import * as Localization from 'expo-localization';
import UIText from './data/text.json';
import makeid from './js/makeid';
import Event from './js/event';

// For test cases
const NETWORK_STATUS = true;
const _FLUSH = true;
const _DEVELOPMENT = true;
const _DEVLANG = "";

let storage;

storage = new Storage({
    size: 1000,
    storageBackend: AsyncStorage,
    defaultExpires: null,
    enableCache: true,
    sync: {}
});

class Api {
    constructor() {
        if (!_DEVELOPMENT) {
        } else {
            this.segment = { screen: () => { }, trackWithProperties: () => { }, screenWithProperties: () => { } }
        }
        this.event = Event;
        console.log("API: Created instance");
        this.currentLang = _DEVLANG;

        this.initApiCurrents();
        if (_FLUSH) {
            this.flush();
        }
    }

    flush() {
        // Flush to the beginning state
        this.setData("lang", "");
        this.setData("setup", "start");
        console.log("API: flushed");
    }

    initApiCurrents() {
        this.getData("userId").then(uid => {
            if (!_DEVELOPMENT) {
                this.segment.identify(uid);
            }
            if (_FLUSH || uid == "" || uid == null) {
                let uid = makeid(8);
                this.setData("userId", uid);
            }
            console.log("Segment: User identified" + uid);
        }, err => {
            if (err.name == "NotFoundError") {
                let uid = makeid(8);
                this.setData("userId", uid);
                if (!_DEVELOPMENT) {
                    this.segment.identify(uid);
                }
                console.log("API: First time userId set");
                console.log("Segment: User identified" + uid);
            }
        });

        this.getData("setup").then(setupStatus => {
            console.log("Setup status is: ", setupStatus);
            if (_FLUSH || setupStatus == "" || setupStatus == null) {
                this.setData("setup", "start");
            }
        }, err => {
            if (err.name == "NotFoundError") {
                this.setData("setup", "start");
                console.log("Setup status set for the first time");
            }
        });

        this.getData("lang").then(lang => {
            console.log("API: serve with lang: ", lang);
            if (lang.includes("tr")) {
                this.currentLang = "tr";
            } else if (lang.includes("de")) {
                this.currentLang = "de";
            } else if (lang.includes("fr")) {
                this.currentLang = "fr";
            } else if (lang.includes("es")) {
                this.currentLang = "es";
            } else if (lang.includes("hr")) { // Handle Croatian language
                this.currentLang = "hr";
            } else {
                this.currentLang = "en";
            }
            if (_DEVLANG) { this.currentLang = _DEVLANG; }
        }, err => {
            if (err.name == "NotFoundError") {
                lang = Localization.locale;
                this.setData("lang", lang);
                console.log("API: first time lang init", lang);
                if (lang.includes("tr")) {
                    this.currentLang = "tr";
                } else if (lang.includes("de")) {
                    this.currentLang = "de";
                } else if (lang.includes("fr")) {
                    this.currentLang = "fr";
                } else if (lang.includes("hr")) { // Handle Croatian language
                    this.currentLang = "hr";
                } else {
                    this.currentLang = "en";
                }
                if (_DEVLANG) { this.currentLang = _DEVLANG; }
            }
        });

        // Other initialization code for speakPitch, speakRate, gridSize...
    }

    speak(speakText) {
        console.log("Speak With", {
            language: this.currentLang,
            pitch: this.speakPitch,
            rate: this.speakRate
        });
        Speech.speak(speakText, {
            language: this.currentLang,
            pitch: this.speakPitch,
            rate: this.speakRate
        });
    }

    UIText(identifier, forcedLang) {
        if (UIText[identifier]) {
            if (forcedLang) {
                return UIText[identifier][forcedLang];
            } else if (UIText[identifier][this.currentLang]) {
                return UIText[identifier][this.currentLang];
            } else {
                return UIText[identifier].en;
            }
        } else {
            return "UndefinedUIText";
        }
    }

    changeLang(toLang) {
        this.setData("lang", toLang);
        this.currentLang = toLang;
    }

    // These are like kinda private;
    // But xxx it, use them in the general app, who cares.
    setData(key, data) {
        return storage.save({ key, data });
    }

    getData(key) {
        // returns promise
        return storage.load({ key });
    }
}

const _api = new Api();
export default _api;
