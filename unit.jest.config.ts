import config from './jest.config';
import type {Config} from 'jest';

const uconfig: Config = {
	...config,
	testMatch: [ '**/__test__/__unit__/**/?(*.)+(spec|test).[jt]s?(x)' ]
};

export default uconfig;