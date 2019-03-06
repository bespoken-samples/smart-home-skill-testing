# Intro
This is a simple project that demonstrates automated testing for a Smart Home skill.

It uses Bespoken's Virtual Device API to interact with Smart Home device via Alexa programmatically. The test is intended to be run on a regular interval, optionally reporting results to DataDog for more advanced reporting and notifications.

It also shows an external API being used - the intention is this will be the canonical API for the device. This is used to ensure devices are in the proper state to be tested, and that the commands to Alexa have had the intended effect.

Most Smart Home devices have APIs like this - for our tests here, we just us a mock. In real test, an implementer should replace the mock with their real API calls.

There are two test suites - [single-device-test.js](blob/master/single-device-test.js) and [multi-device-test.js](blob/master/single-device-test.js).

The first one shows testing a single device, the second one shows a slightly more complex test that uses a CSV file to test a number of devices.

The basic sequence is simple:
1) Initialize the device to a "clean" state
2) Interact with Alexa - "alexa, turn the bedroom lamp off"
3) Check with the device itself via its API to confirm the result
4) Report the results to DataDog 

# Setup
To get setup, you will need the following (and some of this you likely already have):
1) [Node.js installed](https://nodejs.org/en/download/)
2) Project dependencies installed
Open a command-line window, and run `npm install` in the directory where this project is isntalled
3) A Bespoken Virtual Device token
Follow these directions to get one - [Bespoken Virtual Device setup](https://read.bespoken.io/end-to-end/setup). 
4) A DataDog account
This is optional - but DataDog is a nice tool for visualizing metrics as well as configuring notifications when there are issues.

The virtual device token as well as the Data Dog API key should go into the .env file. If no DataDog API key is supplied, this steps wills be skipped.

Once configured, you can run the tests:
`npm test`

# More Information
## Continuous Integration
These tests are configured to be run on a five-minute interval via Circle CI.

The Circle CI workflow to do this is in this file: [./.circleci/config.yml](blob/master/.circleci/config.yml).

The Circle CI docs are [here for more detailed information](https://circleci.com/docs/).

## Deako Case Study
To read more about this project, check out our Deako case study this was based on LINK HERE.

# TODO
- [ ] Add Circle CI configuration
- [ ] Add badges
- [ ] Add a pretty dashboard on DataDog
- [ ] Add link to blog in README
- [ ] Replace .env values with stubs