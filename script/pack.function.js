function pack({ hookCode, srcCode }) {
	try {
		let code = srcCode;

		if (!code.endsWith('\n')) {
			code = `${code}\n`;
		}

		return `;(function(){${code}}(function(){if(addEventListener.__hooked){return;}${hookCode}}()));`;
	} catch (err) {
		throw new Error(`Pack Error: ${err?.message}`);
	}
}

module.exports = pack;
