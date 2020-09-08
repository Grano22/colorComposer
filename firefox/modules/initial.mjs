import { DecToHex, HexToDec } from './converters.mjs'; //Converter

export class colorComposerBuilder {
    constructor(includeConverter=true) {
        if(includeConverter) this.Converter = {
            DecToHex:DecToHex,
            HexToDec:HexToDec
        };
    }

    info() {
        console.info('%cColor Composer', 'font-size:30px;font-weight:bolder;background: red;\
        background: -webkit-linear-gradient(left, orange , yellow, green, cyan, blue, violet);\
        background: -o-linear-gradient(right, orange, yellow, green, cyan, blue, violet);\
        background: -moz-linear-gradient(right, orange, yellow, green, cyan, blue, violet);\
        background: linear-gradient(to right, orange , yellow, green, cyan, blue, violet);\
        -webkit-background-clip: text;\
        -webkit-text-fill-color: transparent;');
        console.info('Version: 0.1');
    }
}