const deviceAPI = require("./device-api");
const expect = require("chai").expect;
const metrics = require("datadog-metrics");
const vdk = require("virtual-device-sdk");

// We use the very nice dotenv module to setup our environment variables
// It looks in the <PROJECT_DIR>/.env file for environment values so we don't have to set them up everytime
require("dotenv").config();

describe("single device", function() {
	// Increase the timeout for these tests to 60 seconds
	this.timeout(60000);

	describe("turn on and off", function() {
	  	it("should toggle without error", async function(done) {
			// To interact with a Bespoken Virtual Device, sign up and create one at:
			//	https://apps.bespoken.io/dashboard
			// They virtual devices allow you to talk to Alexa and Google Assistant programmatically  
			// The token once created should be set as an environment variable named VIRTUAL_DEVICE_TOKEN
			const virtualDevice = new vdk.VirtualDevice(process.env.VIRTUAL_DEVICE_TOKEN); 
			const response = await virtualDevice.message("turn on office lamp");

			const successAlexa = response.transcript.includes("ok");
			console.log("Transcript: " + response.transcript);
			
			// Check the device API to ensure it also worked
			// In this case, we use a simple mock - but just substitute in your real API here
			const state = deviceAPI.getState(process.env.DEVICE_API_KEY, process.env.DEVICE_ID)
			const successDevice = state.status === "ON";

			// Send the stats to Data Dog [Optional step]
			// Leveraging DataDog is great for advanced reporting and notifications
			// Here we increment a counter everytime we have success for the device
			// Using the counter, we can see the results over time as well as trigger notifications if too many tests fail
			if (process.env.DATADOG_API_KEY) {
				metrics.init({ host: process.env.DEVICE_ID, prefix: "smart-home" });
				if (successAlexa) {
					metrics.increment("device.alexa.success");
				} else {
					metrics.increment("device.alexa.failure");
				}

				if (successDevice) {
					metrics.increment("device.api.success");
				} else {
					metrics.increment("device.api.failure");
				}
			}

			// Do our mocha assertions
			expect(successAlexa, "Call to Alexa failed").to.be.true;
			expect(successDevice, "Device state was not set properly").to.be.true;

			done();
	  	});
	});
});