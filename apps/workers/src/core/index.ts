import cluster from 'cluster';
import os from 'os';
import process from 'process';

import { Terminal } from '@zyrohub/toolkit';
import ansicolor from 'ansicolor';

import { Core } from './Core.js';

if (cluster.isPrimary) {
	Terminal.success('CLUSTER', `Primary ${ansicolor.cyan(process.pid)} is running!`);

	const cpuCount = os.availableParallelism();

	for (let i = 0; i < cpuCount; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		Terminal.error(
			'CLUSTER',
			`Worker ${ansicolor.cyan(worker.process.pid)} died with code: ${ansicolor.yellow(
				code
			)}, and signal: ${ansicolor.red(signal)}`
		);

		setTimeout(() => {
			Terminal.info('CLUSTER', 'Restarting worker...');

			cluster.fork();
		}, 5000);
	});
} else {
	Terminal.success('CLUSTER', `Worker ${ansicolor.cyan(process.pid)} started!`);

	const core = new Core();

	core.init();
}
