import * as harryPotterNames from 'harrypotter-names';
import {bar} from './foo/foo';

class Demo {

    constructor(otherDemo: Demo) {
        console.log(harryPotterNames.random());
        console.log(bar);
    }
}
