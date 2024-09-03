const fs = require('fs');
const pack = require('./pack.function');

const [_node, _shell, hookPath, srcPath, outputPath] = process.argv;

if (!hookPath || !srcPath || !outputPath) {
	console.error('Param Error: Missing required parameters.');
	process.exit(1);
}

function loadHook(hookPath) {
	if (!hookPath) {
		throw new Error('Hook Error: Missing required parameters.');
	}

	let hookCode;

	try {
		hookCode = fs.readFileSync(hookPath).toString();
	} catch {
		throw new Error('Hook Error: Load file failed.');
	}

	return { hookCode };
}

function loadSrc(srcPath) {
	if (!srcPath) {
		throw new Error('Src Error: Missing required parameters.');
	}

	let srcCode;

	try {
		srcCode = fs.readFileSync(srcPath).toString();
	} catch {
		throw new Error('Src Error: Load file failed.');
	}

	return { srcCode };
}

function saveHandled(outputPath, handledCode) {
	if (!outputPath || !handledCode) {
		throw new Error('Save Error: Missing required parameters.');
	}

	try {
		fs.writeFileSync(outputPath, handledCode);
	} catch {
		throw new Error('Save Error: Write file failed.');
	}
}

function cmd(hookPath, srcPath, outputPath) {
	try {
		const { hookCode } = loadHook(hookPath);
		const { srcCode } = loadSrc(srcPath);

		const handledCode = pack({ hookCode, srcCode });

		saveHandled(outputPath, handledCode);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}

cmd(hookPath, srcPath, outputPath);
