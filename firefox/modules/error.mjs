//Error Reporting And Handling
export class Error {
    constructor(errName, errDes) {
        if(typeof window.localStorage.getItem("error-reporting")=="undefined") window.localStorage.setItem("error-reporting", JSON.stringify({list:[]}));
        let reportingData = JSON.parse(window.localStorage.getItem("error-reporting"));
        this.id = reportingData.list.length-1;
        reportingData.list.push(this);
    }

    resolve(action="") {
        let reportingData = JSON.parse(window.localStorage.getItem("error-reporting"));
        reportingData.list.filter(v=>v.id!=this.id);
        switch(action) {
            case "":

            break;
            case "":
            default:
        }
    }
}

export class UnexpectedError extends Error {
    constructor(errName="Unexpected", errDes) {
        super(errName);
    }
}

export class LogicError extends Error {
    constructor(errName="Logic", errDes) {
        super(errName);
    }
}

export class SyntaxError extends Error {
    constructor(errName="Syntax", errDes) {
        super(errName);
    }
}



