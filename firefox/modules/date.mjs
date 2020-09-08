export function timestamp(dateobj) {
    return dateobj.getTime/1000 | 0;
}

export function nowDate() {
    
}

export function nowTime() {

}

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
if(!Date.now) Date.now = function() { return new Date(); }
Date.time = function() { return Date.now().getUnixTime(); }