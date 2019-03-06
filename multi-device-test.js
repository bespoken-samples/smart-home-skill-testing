const csvparse = require("csv-parse/lib/sync");
const deviceAPI = require("./device-api");
const expect = require("chai").expect;
const fs = require("fs");
const metrics = require("datadog-metrics");
const vdk = require("virtual-device-sdk");

// We use the very nice dotenv module to setup our environment variables
// It looks in the <PROJECT_DIR>/.env file for environment values so we don't have to set them up everytime
require("dotenv").config();

describe("multiple devices", function() {
	// Increase the timeout for these tests to 60 seconds
	this.timeout(60000);
	const virtualDevice = new vdk.VirtualDevice(process.env.VIRTUAL_DEVICE_TOKEN); 

	// Read the device names from a CSV
	const devices = csvparse(fs.readFileSync("devices.csv"));
	console.log("devices: " + devices);
	
	for (const deviceArray of devices) {
		const deviceName = deviceArray[0];
		console.log(`Device ${deviceName}`);
		const deviceID = deviceName.split(" ").join("-");
		describe(`turn on and off ${deviceName}`, function() {
			afterEach(async function() {
				// Turn off the device after each test
				return virtualDevice.message(`turn off ${deviceName}`);
			});

			it("should toggle without error", async function() {
				// To interact with a Bespoken Virtual Device, sign up and create one at:
				//	https://apps.bespoken.io/dashboard
				// They virtual devices allow you to talk to Alexa and Google Assistant programmatically  
				// The token once created should be set as an environment variable named VIRTUAL_DEVICE_TOKEN
				const response = await virtualDevice.message(`turn on ${deviceName}`);

				const successAlexa = response.transcript.includes("ok");
				
				// Check the device API to ensure it also worked
				// In this case, we use a simple mock - but just substitute in your real API here
				const state = deviceAPI.getState(process.env.DEVICE_API_KEY, deviceID)
				const successDevice = state.status === "ON";

				// Send the stats to Data Dog [Optional step]
				// Leveraging DataDog is great for advanced reporting and notifications
				// Here we increment a counter everytime we have success for the device
				// Using the counter, we can see the results over time as well as trigger notifications if too many tests fail
				if (process.env.DATADOG_API_KEY) {
					metrics.init({ host: deviceID, prefix: "device." });
					if (successAlexa) {
						metrics.increment("alexa.success");
					} else {
						metrics.increment("alexa.failure");
					}

					if (successDevice) {
						metrics.increment("api.success");
					} else {
						metrics.increment("api.failure");
					}
				}

				// Do our assertions
				expect(successAlexa, "Call to Alexa failed: " + response.transcript).to.be.true;
				expect(successDevice, "Device state was not set properly").to.be.true;
			});
		});
	}
});