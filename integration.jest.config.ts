import config from './jest.config';
import type {Config} from 'jest';

const intconfig: Config = {
	...config,
	testMatch: [ '**/__test__/__integration__/**/?(*.)+(spec|test).[jt]s?(x)' ]
};

export default intconfig;