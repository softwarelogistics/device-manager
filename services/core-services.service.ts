


export class CoreServices {

    constructor() { }


    isValidID(id: string): boolean {
        if (!id) {
            return false;
        }

        const result = id.match('^[\\dABCDEF]{32}$');
        return result && result.length === 1;
    }

    public invokeSuccess(): Core.InvokeResult {
        return { successful: true, errors: [], warnings: [] };
    }

    public invokeError(err): Core.InvokeResult {
        return { successful: false, errors: [{ message: err }], warnings: [] };
    }
}
