import type {Config} from 'jest';

const config: Config = {
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	coveragePathIgnorePatterns: [
		'node_modules',
		'__test__',
		'src/database/migration'
	],
	collectCoverageFrom: ['./src/**'],
	detectOpenHandles: true,
};

export default config;