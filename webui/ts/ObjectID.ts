/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
declare global {
    interface Object {
        id: (o: Object) => number;
    }
}
function addID2Object() {
    // console.log("addID2Object");
    if (typeof Object.id == "undefined") {
        let id = 0;

        Object.id = function (o) {
            if (typeof o.__uniqueid == "undefined") {
                Object.defineProperty(o, "__uniqueid", {
                    value: ++id,
                    enumerable: false,
                    // This could go either way, depending on your
                    // interpretation of what an "id" is
                    writable: false
                });
            }

            return o.__uniqueid;
        };
    }
}

export default addID2Object;
