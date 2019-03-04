// This is simple mock of our device API - in a real implementation, the real API would be used
module.exports = {
	getState: () => {
		return {
			status: "on",
		};
	}
};