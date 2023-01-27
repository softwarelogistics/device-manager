
import { ErrorReporterService } from './error-reporter.service';



export class ValidationHelpersService {

    constructor(private errorReporter: ErrorReporterService) { }

    validateKeyNameForInsert(model: Core.IKeyNamedModel, parentItems: Core.IKeyedModel[]): Core.InvokeResult {
        const results = { successful: true, errors: [], warnings: [] };

        if (!model.name) {
            results.successful = false;
            results.errors.push({
                message: `Name is required`
            });
        }

        if (!model.key) {
            results.successful = false;
            results.errors.push({
                message: `Key is required`
            });
        }

        if (!model.key.match('^[a-z][0-9a-z]{2,20}$')) {
            results.successful = false;
            results.errors.push({
                message: `Key must be between 3 and 20 characters and may only contain numbers and lower case letters.
            The key must start with a lower case letter`});
        }

        if (parentItems.find(par => par.key === model.key)) {
            results.successful = false;
            results.errors.push({
                message: `The provided key already exists, please enter a unique key.`
            });
        }

        if (!results.successful) {
            this.errorReporter.addErrors(results.errors);
        }

        return results;
    }

    validateKeyNameForUpdate(model: Core.IKeyNamedModel, parentItems: Core.IKeyedModel[]): Core.InvokeResult {
        const results = { successful: true, errors: [], warnings: [] };

        if (!model.name) {
            results.successful = false;
            results.errors.push({
                message: `Name is required`
            });
        }

        if (!model.key) {
            results.successful = false;
            results.errors.push({
                message: `Key is required`
            });
        }

        if (!model.key.match('^[a-z][0-9a-z]{2,20}$')) {
            results.successful = false;
            results.errors.push({
                message: `Key must be between 3 and 20 characters and may only contain numbers and lower case letters.
            The key must start with a lower case letter`});
        }

        /* The key will exist in the parent, but it is for this item, we are not allowing editing of the key so check
           isn't important, we also check on the server prior to insert.
        if (parentItems.find(par => par.key === model.key)) {
            results.successful = false;
            results.errors.push({
                message: `The provided key already exists, please enter a unique key.`});
        } */

        if (!results.successful) {
            this.errorReporter.addErrors(results.errors);
        }

        return results;
    }

}
