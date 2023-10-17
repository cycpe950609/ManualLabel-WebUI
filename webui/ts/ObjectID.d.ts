declare global {
    interface Object {
        id: (o: Object) => number;
    }
}
declare function addID2Object(): void;
export default addID2Object;
