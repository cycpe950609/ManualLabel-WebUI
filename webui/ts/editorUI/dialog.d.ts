declare class Dialog {
    private dialog;
    constructor(title: string, body: DocumentFragment | HTMLElement, closing?: EventListener);
    private ShowDialog;
    private CloseDialog;
    show(): void;
    close(): void;
}
export default Dialog;
